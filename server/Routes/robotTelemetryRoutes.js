const router = require('express').Router();
const { createRobotTelemetry } = require('../Services/robotTelemetry');
const telemetry = createRobotTelemetry();

router.get('/robot-telemetry', async (req, res) => {
  try {
    res.json(await telemetry.load(req.query.date, req.query.endDate));
  } catch (error) {
    if (error.message === 'INVALID_DATE') return res.status(400).json({ message: 'กรุณาระบุวันที่ให้ถูกต้อง (YYYY-MM-DD)' });
    if (error.message === 'NOT_CONFIGURED') return res.status(503).json({ message: 'ยังไม่ได้ตั้งค่าบัญชี iDriverPlus บนเซิร์ฟเวอร์' });
    // Never log Axios errors: their config contains the upstream password or token.
    res.status(502).json({ message: 'ดึงข้อมูล iDriverPlus ไม่สำเร็จ กรุณาลองใหม่ ข้อมูลที่ขาดหายไม่ได้หมายถึงหุ่นยนต์ Offline' });
  }
});
module.exports = router;
