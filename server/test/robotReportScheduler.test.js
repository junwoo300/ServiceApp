const test = require('node:test');
const assert = require('node:assert/strict');
const { startRobotReports, reportDate, splitMessage } = require('../Services/robotReportScheduler');

test('Bangkok midnight uses previous day, including year boundary', () => {
  assert.equal(reportDate('afternoon', new Date('2026-12-31T17:00:00Z')), '2026-12-31');
  assert.equal(reportDate('morning', new Date('2027-01-01T01:00:00Z')), '2027-01-01');
});
test('schedules Thai shifts without sending on startup and sends each report with correct date', async () => {
  const jobs = [], sent = [], dates = [];
  startRobotReports({ enabled: true, token: 'test', chatId: 'group',
    now: () => new Date('2026-09-12T17:00:00Z'), log: { info() {}, error() {} },
    scheduler: { schedule(expression, run, options) { jobs.push({ expression, run, options }); } },
    telemetry: { async load(date) { dates.push(date); return { fetchedAt: '2026-09-12T17:00:00Z', robots: [
      { vin: '1', location: 'DAD', status: 'offline', actualArea: 125 },
    ] }; } },
    http: { async post(url, body) { sent.push(body); return { data: { ok: true } }; } },
  });
  assert.equal(sent.length, 0);
  assert.deepEqual(jobs.map(j => j.expression), ['0 8 * * *', '0 0 * * *']);
  assert.ok(jobs.every(j => j.options.timezone === 'Asia/Bangkok'));
  await jobs[0].run();
  assert.ok(!sent.map(s => s.text).join('').includes('ตารางเมตร'));
  sent.length = 0;
  await jobs[1].run();
  assert.deepEqual(dates, ['2026-09-13', '2026-09-12']);
  assert.ok(sent.every(s => s.chat_id === 'group'));
  assert.match(sent.map(s => s.text).join(''), /125 ตารางเมตร/);
});
test('upstream failure sends nothing; disabled configuration registers no jobs', async () => {
  let run, sent = false;
  assert.deepEqual(startRobotReports({ enabled: false }), []);
  startRobotReports({ enabled: true, token: 'test', chatId: 'group',
    scheduler: { schedule(expression, callback) { run = callback; } },
    telemetry: { async load() { throw Error('unavailable'); } },
    http: { async post() { sent = true; } }, log: { error() {} },
  });
  await run(); assert.equal(sent, false);
});
test('splits long reports on lines within Telegram limit', () => {
  const text = Array(120).fill('🟢ออนไลน์ · ทำงานได้ 1,250 ตารางเมตร').join('\n');
  const parts = splitMessage(text);
  assert.ok(parts.length > 1);
  assert.ok(parts.every(part => part.length <= 3500));
  assert.equal(parts.join('\n'), text);
});
