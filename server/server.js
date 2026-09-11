const express = require('express');
const morgan = require('morgan');
const { readdirSync } = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./Config/Db');
const mongoose = require('mongoose');
const path = require('path');
require('./cronTasks');  // รันบอทแจ้งเตือน บิล telegam ไปด้วยเมื่อกด npm start ที่ backend 
require('./onsitetelegram'); 
const app = express();

// Middleware
app.use(morgan('dev')); 
app.use(cors()); 
app.use(bodyParser.json({ limit: '10mb' })); 

// ให้ Express ให้บริการไฟล์ในโฟลเดอร์ uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// โหลด routes ทั้งหมดจากโฟลเดอร์ Routes
readdirSync('./Routes').map((r) => app.use('/api', require('./Routes/' + r)));

// เพิ่มเส้นทาง /api/ask-ai
app.use('/api/ask-ai', require('./Routes/ask-ai'));

app.get('/api/health/db', (req, res) => {
  res.json({
    connected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host,
    database: mongoose.connection.name,
  });
});

// จัดการข้อผิดพลาด 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// จัดการข้อผิดพลาดทั่วไป
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// รับฟังการเชื่อมต่อ
const PORT = 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Cannot start server because MongoDB is unavailable:', error.message);
  process.exitCode = 1;
});
