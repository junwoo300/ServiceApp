const cron = require('node-cron');
const axios = require('axios');
const { createRobotTelemetry } = require('./robotTelemetry');
const { buildRobotStatusSummary } = require('../../service/src/components/Page/Robot/robotReportText');

function reportDate(mode, now = new Date()) {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  return mode === 'afternoon' ? new Date(Date.parse(date) - 86400000).toISOString().slice(0, 10) : date;
}

function splitMessage(text, limit = 3500) {
  const chunks = [];
  let chunk = '';
  for (const line of text.split('\n')) {
    for (let rest = line; rest.length > limit;) {
      if (chunk) { chunks.push(chunk); chunk = ''; }
      // Split by code points so an emoji is never cut in half.
      const part = [...rest].slice(0, Math.floor(limit / 2)).join('');
      chunks.push(part); rest = rest.slice(part.length);
      if (rest.length <= limit) { chunk = rest; break; }
    }
    if (line.length > limit) continue;
    if (chunk && chunk.length + line.length + 1 > limit) { chunks.push(chunk); chunk = ''; }
    chunk += (chunk ? '\n' : '') + line;
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

function startRobotReports({ token = process.env.TELEGRAM_ROBOT_TOKEN, chatId = process.env.TELEGRAM_ROBOT_CHAT_ID,
  enabled = process.env.TELEGRAM_ROBOT_ENABLED === 'true', scheduler = cron,
  telemetry = createRobotTelemetry(), http = axios, now = () => new Date(), log = console } = {}) {
  if (!enabled) return [];
  if (!token || !chatId) throw new Error('Robot reports require Telegram token and chat ID');
  const running = new Set();
  const run = async mode => {
    if (running.has(mode)) return;
    running.add(mode);
    try {
      const date = reportDate(mode, now());
      const data = await telemetry.load(date);
      if (!data.robots.length) throw new Error('No robot data');
      const text = buildRobotStatusSummary(data.robots, { mode, date, fetchedAt: data.fetchedAt });
      for (const chunk of splitMessage(text)) {
        const response = await http.post(`https://api.telegram.org/bot${token}/sendMessage`, {
          chat_id: chatId, text: chunk,
        }, { timeout: 15000 });
        if (!response.data?.ok) throw new Error('Telegram rejected report');
      }
      log.info(`Robot ${mode} report sent for ${date}`);
    } catch {
      // Axios errors may contain the bot token. Do not print them or retry ambiguous sends.
      log.error(`Robot ${mode} report failed; check connectivity and Telegram configuration`);
    } finally { running.delete(mode); }
  };
  return [scheduler.schedule('0 8 * * *', () => run('morning'), { timezone: 'Asia/Bangkok', noOverlap: true }),
    scheduler.schedule('0 0 * * *', () => run('afternoon'), { timezone: 'Asia/Bangkok', noOverlap: true })];
}
module.exports = { startRobotReports, reportDate, splitMessage };
