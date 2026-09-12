const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { readdirSync } = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const { createAuth } = require('./middlewares/auth');

function createApp(options = {}) {
  const app = express();
  // CRA's development proxy rewrites Origin to its backend target.
  const origins = (process.env.FRONTEND_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://127.0.0.1:5000')
    .split(',').map(value => value.trim());
  const auth = createAuth({ passwordHash: process.env.APP_PASSWORD_HASH,
    secure: process.env.NODE_ENV === 'production', ...options.auth });
  app.disable('x-powered-by');
  app.use(morgan('dev'));
  app.use(cors({ origin: origins, credentials: true }));
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
        (req.get('X-Service-App') !== '1' || (req.get('Origin') && !origins.includes(req.get('Origin'))))) {
      return res.status(403).json({ message: 'Request origin is not allowed' });
    }
    next();
  });
  app.use(express.json({ limit: '10mb' }));
  app.post('/api/auth/login', auth.login);
  app.post('/api/auth/logout', auth.logout);
  app.use('/api', auth.requireAuth);
  app.get('/api/auth/session', (req, res) => res.json({ authenticated: true }));
  app.use('/uploads', auth.requireAuth, (req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Content-Security-Policy', "default-src 'none'; sandbox");
    next();
  }, express.static(path.join(__dirname, 'uploads'), { cacheControl: false }));
  for (const file of readdirSync(path.join(__dirname, 'Routes'))) {
    if (file.endsWith('.js') && file !== 'ask-ai.js') app.use('/api', require(`./Routes/${file}`));
  }
  app.use('/api/ask-ai', require('./Routes/ask-ai'));
  app.get('/api/health/db', (req, res) => res.json({ connected: mongoose.connection.readyState === 1 }));
  app.use((req, res) => res.status(404).json({ message: 'Resource not found' }));
  app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE' || err.type === 'entity.too.large') {
      return res.status(413).json({ message: 'ไฟล์หรือข้อมูลมีขนาดเกินกำหนด' });
    }
    if (err.name === 'MulterError' || err.status === 400 || err.type === 'entity.parse.failed') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err.message);
    res.status(500).json({ message: 'Something went wrong!' });
  });
  return app;
}
module.exports = { createApp };
