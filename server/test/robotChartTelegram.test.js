const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createRobotChartTelegramRouter } = require('../Routes/robotChartTelegramRoutes');

async function setup(t, options) {
  const app = express();
  app.use(createRobotChartTelegramRouter(options));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}/robot-chart-telegram`;
}
function body(count = 1, date = '2026-09-24') {
  const form = new FormData();
  form.append('date', date);
  const png = Buffer.from('89504e470d0a1a0a0000000d4948445200000578000005780802000000', 'hex');
  for (let i = 0; i < count; i++) form.append('photos', new Blob([png], { type: 'image/png' }), 'chart.png');
  return form;
}
const config = () => ({ token: 'test-token', chatId: 'robot-group' });

test('sends PNGs to the configured robot group as photo or album', async t => {
  const calls = [];
  const url = await setup(t, { config, http: { async post(...args) { calls.push(args); return { data: { ok: true } }; } } });
  for (const count of [1, 2]) {
    const response = await fetch(url, { method: 'POST', body: body(count) });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).sent, count);
  }
  assert.match(calls[0][0], /sendPhoto$/);
  assert.equal(calls[0][1].get('chat_id'), 'robot-group');
  assert.equal(calls[0][1].get('photo').type, 'image/png');
  assert.match(calls[1][0], /sendMediaGroup$/);
  assert.equal(JSON.parse(calls[1][1].get('media')).length, 2);
});

test('rejects invalid input without sending and hides Telegram errors without retry', async t => {
  let calls = 0;
  const url = await setup(t, { config, http: { async post() { calls++; throw Error('secret-test-token'); } } });
  assert.equal((await fetch(url, { method: 'POST', body: body(1, 'bad-date') })).status, 400);
  assert.equal(calls, 0);
  const response = await fetch(url, { method: 'POST', body: body() });
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /secret-test-token/);
  assert.equal(calls, 1);
});

test('missing configuration does not send', async t => {
  const url = await setup(t, { config: () => ({}) });
  assert.equal((await fetch(url, { method: 'POST', body: body() })).status, 503);
});
