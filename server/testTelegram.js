const mongoose = require('mongoose');
const connectDB = require('./Config/Db'); // หรือ './db' ตามโครงสร้างไฟล์คุณ
const { sendTelegramReminder } = require('./cronTasks');

async function runTest() {
  try {
    await connectDB();  // เชื่อมต่อ DB ก่อน
    await sendTelegramReminder();  // รันฟังก์ชันส่งแจ้งเตือน
    console.log('Test complete');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();  // ปิดการเชื่อมต่อ DB
  }
}

runTest();
