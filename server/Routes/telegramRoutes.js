const router = require('express').Router();
const axios = require('axios');

router.post('/telegram/test', async (req, res) => {
  const token = process.env.TELEGRAM_BILL_TOKEN;
  const chatId = process.env.TELEGRAM_BILL_CHAT_ID;
  if (!token || !chatId) return res.status(503).json({ message: 'ยังไม่ได้ตั้งค่า Telegram บน server' });
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId, text: 'ข้อความทดสอบจาก Service APP'
    }, { timeout: 10000 });
    res.json({ message: 'ส่งข้อความแล้ว' });
  } catch {
    res.status(502).json({ message: 'ส่งข้อความ Telegram ไม่สำเร็จ' });
  }
});
module.exports = router;
