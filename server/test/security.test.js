const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scryptSync } = require('node:crypto');
const { once } = require('node:events');
const { createApp } = require('../app');
const salt = 'a'.repeat(32);
const password = 'test-password-only';
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;

async function fixture(t) {
  let current = Date.now();
  const app = createApp({ auth: { passwordHash, now: () => current } });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}`;
  const request = (route, options = {}) => fetch(url + route, options);
  const login = (value = password) => request('/api/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Service-App': '1' }, body: JSON.stringify({ password: value }) });
  return { request, login, advance: ms => { current += ms; } };
}

test('rejects missing/forged sessions on business APIs and uploads', async t => {
  const { request } = await fixture(t);
  for (const route of ['/api/product', '/api/robots', '/api/robot-telemetry?date=2026-09-11', '/api/auth/session', '/uploads/example.png']) {
    assert.equal((await request(route)).status, 401);
    assert.equal((await request(route, { headers: { Cookie: 'service_session=forged; isAuthenticated=true' } })).status, 401);
  }
  assert.equal((await request('/api/product/id', { method: 'DELETE', headers: { 'X-Service-App': '1' } })).status, 401);
});

test('valid login issues an HttpOnly cookie; expiry and logout invalidate it', async t => {
  const { request, login, advance } = await fixture(t);
  assert.equal((await login('wrong')).status, 401);
  let response = await login();
  assert.equal(response.status, 200);
  const setCookie = response.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Strict/i);
  let cookie = setCookie.split(';')[0];
  assert.equal((await request('/api/auth/session', { headers: { Cookie: cookie } })).status, 200);
  advance(8 * 60 * 60 * 1000 + 1);
  assert.equal((await request('/api/auth/session', { headers: { Cookie: cookie } })).status, 401);
  response = await login();
  cookie = response.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('/api/auth/logout', { method: 'POST', headers: { Cookie: cookie, 'X-Service-App': '1' } })).status, 200);
  assert.equal((await request('/api/auth/session', { headers: { Cookie: cookie } })).status, 401);
});

test('blocks cross-origin writes and rate-limits password guessing', async t => {
  const { request, login, advance } = await fixture(t);
  assert.equal((await request('/api/auth/login', { method: 'POST' })).status, 403);
  assert.equal((await request('/api/auth/login', { method: 'POST', headers: { 'X-Service-App': '1', Origin: 'https://other.example' } })).status, 403);
  for (let i = 0; i < 5; i++) assert.equal((await login('wrong')).status, 401);
  assert.equal((await login()).status, 429);
  advance(15 * 60 * 1000 + 1);
  assert.equal((await login()).status, 200);
});

test('accepts a browser login through the CRA proxy origin', async t => {
  const { request } = await fixture(t);
  const response = await request('/api/auth/login', { method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Service-App': '1', Origin: 'http://127.0.0.1:5000' },
    body: JSON.stringify({ password }) });
  assert.equal(response.status, 200);
});

test('valid image uploads use relative URLs and require a session when read', async t => {
  const fs = require('node:fs/promises');
  const path = require('node:path');
  const Image = require('../Models/imageModels');
  t.mock.method(Image.prototype, 'save', async function () { return this; });
  const { request, login } = await fixture(t);
  const cookie = (await login()).headers.get('set-cookie').split(';')[0];
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  const form = new FormData();
  form.append('image', new Blob([png], { type: 'image/png' }), 'test.png');
  const response = await request('/api/upload', { method: 'POST',
    headers: { Cookie: cookie, 'X-Service-App': '1' }, body: form });
  assert.equal(response.status, 201);
  const { imageUrl } = await response.json();
  assert.match(imageUrl, /^uploads\/[a-f0-9-]+\.png$/);
  t.after(() => fs.unlink(path.join(__dirname, '..', imageUrl)));
  assert.equal((await request(`/${imageUrl}`)).status, 401);
  const image = await request(`/${imageUrl}`, { headers: { Cookie: cookie } });
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
});

test('both image routes reject invalid files and enforce size; Excel is bounded too', async t => {
  const { request, login } = await fixture(t);
  const cookie = (await login()).headers.get('set-cookie').split(';')[0];
  const upload = (route, field, content, filename, type) => {
    const form = new FormData();
    form.append(field, new Blob([content], { type }), filename);
    return request(route, { method: 'POST', headers: { Cookie: cookie, 'X-Service-App': '1' }, body: form });
  };
  for (const route of ['/api/upload', '/api/projects']) {
    assert.equal((await upload(route, 'image', '<html>', 'bad.html', 'text/html')).status, 400);
    assert.equal((await upload(route, 'image', 'not an image', 'fake.png', 'image/png')).status, 400);
    assert.equal((await upload(route, 'image', Buffer.alloc(5 * 1024 * 1024 + 1), 'large.png', 'image/png')).status, 413);
  }
  assert.equal((await upload('/api/import/employees', 'file', 'bad', 'bad.txt', 'text/plain')).status, 400);
  assert.equal((await upload('/api/import/employees', 'file', Buffer.alloc(5 * 1024 * 1024 + 1), 'large.xlsx', 'application/octet-stream')).status, 413);
});
