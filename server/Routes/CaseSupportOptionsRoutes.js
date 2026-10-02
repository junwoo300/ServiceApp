const express = require('express');
const { getOptions } = require('../Models/CaseSupportOptions');
const router = express.Router();

router.get('/case-support-options', async (req, res, next) => {
  try { res.json(await getOptions()); } catch (error) { next(error); }
});

async function changeOption(req, res, next) {
  const { kind, id } = req.params;
  if (!['subjects', 'types'].includes(kind)) return res.status(400).json({ error: 'รายการไม่ถูกต้อง' });
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (req.method !== 'DELETE' && (!name || name.length > 200)) {
    return res.status(400).json({ error: 'กรุณาระบุชื่อไม่เกิน 200 ตัวอักษร' });
  }
  try {
    const options = await getOptions();
    const item = id ? options[kind].find(value => String(value._id) === id) : null;
    if (id && !item) return res.status(404).json({ error: 'ไม่พบรายการ กรุณาโหลดใหม่' });
    if (req.method !== 'DELETE' && options[kind].some(value =>
      String(value._id) !== id && value.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ error: 'มีชื่อนี้อยู่แล้ว' });
    }
    if (req.method === 'POST') options[kind].push({ name });
    else if (req.method === 'PUT') item.name = name;
    else item.deleteOne();
    await options.save();
    res.status(req.method === 'POST' ? 201 : 200).json(options);
  } catch (error) {
    if (error.name === 'VersionError') return res.status(409).json({ error: 'รายการถูกเปลี่ยนโดยผู้ใช้อื่น กรุณาปิดแล้วเปิดหน้าจัดการใหม่' });
    next(error);
  }
}

router.post('/case-support-options/:kind', changeOption);
router.put('/case-support-options/:kind/:id', changeOption);
router.delete('/case-support-options/:kind/:id', changeOption);
module.exports = router;
