const crypto = require('node:crypto');
const scrypt = require('node:util').promisify(crypto.scrypt);
const COOKIE = 'service_session';
const SESSION_MS = 8 * 60 * 60 * 1000;
const ATTEMPT_MS = 15 * 60 * 1000;

function createAuth({ passwordHash, secure = false, now = Date.now }) {
  if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash || '')) {
    throw new Error('Configure APP_PASSWORD_HASH first: run npm run setup:auth');
  }
  const [salt, expected] = passwordHash.split(':');
  const sessions = new Map();
  const attempts = new Map();
  const cookieOptions = { httpOnly: true, sameSite: 'strict', secure, path: '/' };
  const digest = token => crypto.createHash('sha256').update(token).digest('hex');
  const sessionKey = req => {
    const cookie = (req.headers.cookie || '').split(';').map(part => part.trim())
      .find(part => part.startsWith(`${COOKIE}=`));
    return cookie ? digest(cookie.slice(COOKIE.length + 1)) : '';
  };
  const cleanup = () => {
    for (const [key, expires] of sessions) if (expires <= now()) sessions.delete(key);
    for (const [key, value] of attempts) if (value.expires <= now()) attempts.delete(key);
  };
  return {
    async login(req, res, next) {
      cleanup();
      const key = req.ip;
      const attempt = attempts.get(key) || { count: 0, expires: now() + ATTEMPT_MS };
      if (attempt.count >= 5 || (!attempts.has(key) && attempts.size >= 10000)) {
        res.set('Retry-After', String(Math.max(1, Math.ceil((attempt.expires - now()) / 1000))));
        return res.status(429).json({ message: 'ลองเข้าสู่ระบบมากเกินไป กรุณารอ 15 นาที' });
      }
      attempt.count += 1;
      attempts.set(key, attempt);
      const password = req.body?.password;
      if (typeof password !== 'string' || password.length === 0 || password.length > 256) {
        return res.status(400).json({ message: 'กรุณาระบุรหัสผ่านไม่เกิน 256 ตัวอักษร' });
      }
      try {
        const actual = await scrypt(password, salt, 64);
        if (!crypto.timingSafeEqual(actual, Buffer.from(expected, 'hex'))) {
          return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
        }
        if (sessions.size >= 1000) return res.status(503).json({ message: 'กรุณาลองใหม่ภายหลัง' });
        attempts.delete(key);
        sessions.delete(sessionKey(req));
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(digest(token), now() + SESSION_MS);
        res.cookie(COOKIE, token, { ...cookieOptions, maxAge: SESSION_MS });
        return res.json({ authenticated: true });
      } catch (error) { next(error); }
    },
    requireAuth(req, res, next) {
      cleanup();
      if (!sessions.has(sessionKey(req))) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
      next();
    },
    logout(req, res) {
      sessions.delete(sessionKey(req));
      res.clearCookie(COOKIE, cookieOptions);
      res.json({ authenticated: false });
    },
  };
}
module.exports = { createAuth };
