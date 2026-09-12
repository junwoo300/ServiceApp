const test = require('node:test');
const assert = require('node:assert/strict');
const { createRobotTelemetry, mergeRobots, validDate } = require('../Services/robotTelemetry');

test('joins by VIN, supports numeric statuses, and preserves missing data versus zero', () => {
  const rows = mergeRobots([{ vin: 'B', is_login: 2 }, { vin: 'A', is_login: '1' }, { vin: 'D' }],
    [{ vin: 'A', task_num: '0', total_time: '326', actual_clean_area: '6486.50' }, { vin: 'C' }]);
  assert.equal(rows.find(r => r.vin === 'A').workMinutes, 326);
  assert.equal(rows.find(r => r.vin === 'A').actualArea, 6486.5);
  assert.equal(rows.find(r => r.vin === 'A').tasks, 0);
  assert.equal(rows.find(r => r.vin === 'A').status, 'online');
  assert.equal(rows.find(r => r.vin === 'B').status, 'offline');
  assert.equal(rows.find(r => r.vin === 'B').tasks, null);
  assert.equal(rows.find(r => r.vin === 'C').status, 'unknown');
  assert.equal(rows.find(r => r.vin === 'D').status, 'unknown');
});

test('rejects impossible or malformed dates', () => {
  for (const date of ['2026-02-30', '', undefined, ['2026-09-11'], '2026-9-1']) assert.equal(validDate(date), false);
  assert.equal(validDate('2024-02-29'), true);
});

test('forwards inclusive date ranges and keeps each range in a separate cache entry', async () => {
  const periods = [];
  const client = createRobotTelemetry({ credentials: () => ({ username: 'test', password: 'test' }), http: {
    async post() { return { data: { err_no: 200, result: { 'access-token': 'test' } } }; },
    async request(config) {
      if (config.method === 'POST') periods.push(Object.fromEntries(new URLSearchParams(config.data)));
      return { data: { err_no: 200, totalNum: 0, result: [] } };
    },
  } });
  await assert.rejects(client.load('2026-09-12', '2026-09-01'), /INVALID_DATE/);
  await assert.rejects(client.load('2026-09-01', 'bad'), /INVALID_DATE/);
  await client.load('2026-09-01', '2026-09-12');
  await client.load('2026-09-01', '2026-09-12');
  await client.load('2026-09-01');
  assert.equal(periods.length, 2);
  assert.equal(periods[0].start_time, '2026-09-01');
  assert.equal(periods[0].end_time, '2026-09-12');
  assert.equal(periods[1].end_time, '2026-09-01');
});

test('reads all pages, renews expired token, coalesces and caches requests', async () => {
  let logins = 0, calls = 0, expired = false, time = 0;
  const http = {
    async post() { logins++; return { data: { err_no: 200, result: { 'access-token': `token${logins}` } } }; },
    async request(config) {
      calls++;
      if (!expired) { expired = true; return { data: { err_no: 4001 } }; }
      const page = config.method === 'GET' ? config.params.page : Number(new URLSearchParams(config.data).get('page'));
      return { data: { err_no: 200, totalNum: '2', result: [{ vin: page === 1 ? 'A' : 'B', is_login: '1', task_num: '1' }] } };
    },
  };
  const client = createRobotTelemetry({ http, credentials: () => ({ username: 'test', password: 'test' }), now: () => time });
  const [a, b] = await Promise.all([client.load('2026-09-11'), client.load('2026-09-11')]);
  assert.deepEqual(a, b);
  assert.equal(a.robots.length, 2);
  assert.equal(logins, 2);
  const previous = calls;
  await client.load('2026-09-11');
  assert.equal(calls, previous);
  time = 61000;
  await client.load('2026-09-11');
  assert.ok(calls > previous);
});

test('incomplete upstream pages fail instead of silently hiding robots', async () => {
  const client = createRobotTelemetry({ credentials: () => ({ username: 'test', password: 'test' }), http: {
    async post() { return { data: { err_no: 200, result: { 'access-token': 'token' } } }; },
    async request() { return { data: { err_no: 200, totalNum: '2', result: [{ vin: 'A' }] } }; },
  } });
  await assert.rejects(client.load('2026-09-11'), /INCOMPLETE_RESPONSE/);
});
