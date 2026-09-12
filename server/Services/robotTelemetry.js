const axios = require('axios');

const SOURCE = 'https://agent.wxb.idriverplus.com/#/datastatistics';
const BASE_URL = 'https://wolfsburg.phpserver.idriverplus.com/';
const number = value => value !== null && value !== undefined && value !== '' &&
  Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;

function validDate(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}

function mergeRobots(cars, statistics) {
  const live = new Map(cars.map(car => [car.vin, car]));
  const daily = new Map(statistics.map(row => [row.vin, row]));
  return [...new Set([...live.keys(), ...daily.keys()])].map(vin => {
    const car = live.get(vin);
    const row = daily.get(vin);
    return {
      vin, name: car?.vehicle_name || row?.vehicle_name || vin,
      model: car?.vehicle_model || null,
      location: car?.organization_name || row?.project_name || null,
      status: String(car?.is_login) === '1' ? 'online' : String(car?.is_login) === '2' ? 'offline' : 'unknown',
      tasks: number(row?.task_num), workMinutes: number(row?.total_time),
      actualArea: number(row?.actual_clean_area), plannedArea: number(row?.plan_clean_area),
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
}

function createRobotTelemetry({ http = axios.create({ baseURL: BASE_URL, timeout: 15000,
  maxRedirects: 0 }), credentials = () => ({ username: process.env.IDRIVERPLUS_USERNAME,
  password: process.env.IDRIVERPLUS_PASSWORD }), now = Date.now } = {}) {
  let token;
  let loggingIn;
  const cache = new Map();
  const pending = new Map();

  async function login() {
    if (!loggingIn) loggingIn = (async () => {
      const values = credentials();
      if (!values.username || !values.password) throw new Error('NOT_CONFIGURED');
      const { data } = await http.post('userCenter/web/index.php/login/login',
        new URLSearchParams({ ...values, language: 'EN' }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      if (Number(data?.err_no) !== 200 || !data.result?.['access-token']) throw new Error('UPSTREAM_AUTH');
      token = data.result['access-token'];
      return token;
    })().finally(() => { loggingIn = null; });
    return loggingIn;
  }

  async function request(endpoint, params, method, retry = true) {
    const usedToken = token || await login();
    const { data } = await http.request({ method, url: `basic/web/index.php/${endpoint}`,
      params: { 'access-token': usedToken, ...(method === 'GET' ? params : {}) },
      ...(method === 'POST' ? { data: new URLSearchParams(params).toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' } } : {}) });
    if (Number(data?.err_no) === 4001 && retry) {
      if (token === usedToken) token = null;
      return request(endpoint, params, method, false);
    }
    if (Number(data?.err_no) !== 200) throw new Error('UPSTREAM_ERROR');
    return data;
  }

  async function allPages(endpoint, params, method) {
    const rows = new Map();
    for (let page = 1; page <= 100; page++) {
      const data = await request(endpoint, { ...params, page, size: 30 }, method);
      const total = number(data.totalNum);
      if (!Array.isArray(data.result) || total === null) throw new Error('INVALID_RESPONSE');
      const previous = rows.size;
      for (const row of data.result) {
        if (!row || typeof row.vin !== 'string' || !row.vin) throw new Error('INVALID_RESPONSE');
        rows.set(row.vin, row);
      }
      if (rows.size >= total) return [...rows.values()];
      if (rows.size === previous) throw new Error('INCOMPLETE_RESPONSE');
    }
    throw new Error('INCOMPLETE_RESPONSE');
  }

  async function load(date, endDate = date) {
    if (!validDate(date) || !validDate(endDate) || endDate < date) throw new Error('INVALID_DATE');
    const key = `${date}:${endDate}`;
    const hit = cache.get(key);
    if (hit && now() - hit.at < 60000) return hit.value;
    if (pending.has(key)) return pending.get(key);
    if (pending.size >= 5) throw new Error('BUSY');
    const job = (async () => {
      const [cars, statistics] = await Promise.all([
        allPages('cars/car-lists', { is_login: '0', keyword: '', category_name: 'xdc' }, 'GET'),
        allPages('wv/statistics/cars-list', { start_time: date, end_time: endDate }, 'POST'),
      ]);
      const value = { date, endDate, source: SOURCE, fetchedAt: new Date(now()).toISOString(),
        robots: mergeRobots(cars, statistics) };
      if (cache.size >= 7) cache.delete(cache.keys().next().value);
      cache.set(key, { at: now(), value });
      return value;
    })().finally(() => pending.delete(key));
    pending.set(key, job);
    return job;
  }
  return { load };
}

module.exports = { createRobotTelemetry, mergeRobots, validDate };
