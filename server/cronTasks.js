require('./Config/env');
// cronTasks.js

const axios = require('axios');
const cron = require('node-cron');
const Bill = require('./Models/BillforpmModels');

const TELEGRAM_TOKEN = process.env.TELEGRAM_BILL_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_BILL_CHAT_ID;

function getFormattedDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear() + 543; // แปลงเป็น พ.ศ.
  return `${day}/${month}/${year}`;
}

async function sendTelegramReminder() {
  try {
    const pendingBills = await Bill.find({ status: { $ne: 'Done' } });

    if (pendingBills.length > 0) {
      const date = getFormattedDate();

      const pendingList = pendingBills
        .filter(b => b.status === 'Pending')
        .map(b => `🧾 ${b.name}`)
        .join('\n');

      const waitList = pendingBills
        .filter(b => b.status === 'wait')
        .map(b => `🧾 ${b.name}`)
        .join('\n');

      let text = `📅 ${date}\n📣 ยังมีบิลที่ยังไม่เปิดอยู่:\n`;

      if (pendingList) {
        text += `${pendingList}\n`;
      }

      if (waitList) {
        text += `\n📦 ยังมีบิลที่รออยู่:\n${waitList}`;
      }

      await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text,
      });

      console.log('✅ Telegram message sent!');
    } else {
      console.log('No pending bills.');
    }
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error.message);
  }
}


async function resetStatus() {
  try {
    await Bill.updateMany({}, { status: 'Pending' });
    console.log("✅ ทุกบิลถูกรีเซตเป็น Pending แล้ว เวลา:", new Date().toLocaleString());
  } catch (error) {
    console.error('Error resetting statuses:', error.message);
  }
}

// แจ้งเตือนทุกวันเวลา 08:30 น. (เช้า)
cron.schedule('30 8 * * *', () => {
  sendTelegramReminder();
}, {
  timezone: 'Asia/Bangkok'
});

// แจ้งเตือนทุกวันเวลา 12:00 น.
cron.schedule('0 12 * * *', () => {
  sendTelegramReminder();
}, {
  timezone: 'Asia/Bangkok'
});
// แจ้งเตือนทุกวันเวลา 15:00 น.
cron.schedule('0 15 * * *', () => {
  sendTelegramReminder();
}, {
  timezone: 'Asia/Bangkok'
});

// รีเซตสถานะทุกวันที่ 15 ของเดือน เวลา 00:00 น.
cron.schedule('0 0 18 * *', () => {
  resetStatus();
}, {
  timezone: 'Asia/Bangkok'
});


/*
// สำหรับเทส: รีเซตสถานะทุกนาที (ลบออกเมื่อเทสเสร็จ)
cron.schedule('* * * * *', () => {
  resetStatus();
});
*/

/*
// สำหรับเทส: ส่งข้อมูล (ลบออกเมื่อเทสเสร็จ)
cron.schedule('* * * * *', () => {
  sendTelegramReminder();
});
*/

module.exports = { sendTelegramReminder, resetStatus };
