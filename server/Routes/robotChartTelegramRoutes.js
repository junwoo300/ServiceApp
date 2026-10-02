const express = require('express');
const multer = require('multer');
const axios = require('axios');
const { validDate } = require('../Services/robotTelemetry');

function createRobotChartTelegramRouter({ http = axios,
  config = () => ({ token: process.env.TELEGRAM_ROBOT_TOKEN, chatId: process.env.TELEGRAM_ROBOT_CHAT_ID }) } = {}) {
  const router = express.Router();
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024, files: 10, fields: 3 } });
  let sending = false;
  router.post('/robot-chart-telegram', upload.array('photos', 10), async (req, res) => {
    const { token, chatId } = config();
    if (!token || !chatId) return res.status(503).json({ message: 'ยังไม่ได้ตั้งค่า Telegram สำหรับรายงานหุ่นยนต์บนเซิร์ฟเวอร์' });
    const { date, endDate = date } = req.body;
    const files = req.files || [];
    if (!validDate(date) || !validDate(endDate) || endDate < date || !files.length || files.some(file =>
      file.mimetype !== 'image/png' || file.buffer.length < 24 || file.buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')) {
      return res.status(400).json({ message: 'วันที่หรือรูปกราฟไม่ถูกต้อง' });
    }
    if (sending) return res.status(409).json({ message: 'กำลังส่งกราฟเข้า Telegram กรุณารอให้เสร็จก่อน' });
    sending = true;
    try {
      const form = new FormData();
      form.append('chat_id', chatId);
      const caption = `กราฟผลงานหุ่นยนต์ทุกไซต์\nวันที่ ${date}${endDate !== date ? ` ถึง ${endDate}` : ''}\nพื้นที่ทำความสะอาดจริงเทียบกับแผน (ตร.ม.)`;
      if (files.length === 1) {
        form.append('caption', caption);
        form.append('photo', new Blob([files[0].buffer], { type: 'image/png' }), 'robot-sites.png');
      } else {
        form.append('media', JSON.stringify(files.map((file, index) => ({ type: 'photo', media: `attach://chart${index}`, ...(index === 0 ? { caption } : {}) }))));
        files.forEach((file, index) => form.append(`chart${index}`, new Blob([file.buffer], { type: 'image/png' }), `robot-sites-${index + 1}.png`));
      }
      const response = await http.post(`https://api.telegram.org/bot${token}/${files.length === 1 ? 'sendPhoto' : 'sendMediaGroup'}`, form, { timeout: 60000, maxRedirects: 0 });
      if (!response.data?.ok) throw new Error('TELEGRAM_REJECTED');
      res.json({ sent: files.length, message: `ส่งกราฟเข้า Telegram แล้ว ${files.length} รูป` });
    } catch {
      // Never expose Axios errors containing the bot token, or retry an ambiguous send.
      res.status(502).json({ message: 'ยืนยันผลการส่งไม่ได้ กรุณาตรวจสอบในกลุ่ม Telegram ก่อนกดส่งใหม่' });
    } finally { sending = false; }
  });
  return router;
}

module.exports = createRobotChartTelegramRouter();
module.exports.createRobotChartTelegramRouter = createRobotChartTelegramRouter;
