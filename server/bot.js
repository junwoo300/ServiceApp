require('./Config/env');
// เทสข้อความมา แล้วบันทึกลง ดาต้าเบส billforpm สร้างบิล | ค่าแรงช่างแอร์ | https://imgur.com/a/xxxxx | https://imgur.com/a/yyyyy

const TelegramBot = require('node-telegram-bot-api');
const Bill = require('./Models/BillforpmModels');
const connectDB = require('./Config/Db');

// เรียกเชื่อม MongoDB
connectDB();

const TELEGRAM_TOKEN = process.env.TELEGRAM_BILL_TOKEN;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith('สร้างบิล')) {
    const parts = text.split('|').map(p => p.trim());

    if (parts.length !== 4) {
      bot.sendMessage(chatId, '❌ กรุณาใช้รูปแบบ:\nสร้างบิล | ชื่อบิล | link1 | link2');
      return;
    }

    const [_, name, link1, link2] = parts;

    try {
      const newBill = new Bill({
        name,
        link1,
        link2,
        status: 'Pending'
      });

      await newBill.save();
      bot.sendMessage(chatId, `✅ บันทึกบิลเรียบร้อยแล้ว:\n📄 ${name}`);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาดในการบันทึก');
    }
  }
});
