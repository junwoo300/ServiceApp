const mongoose = require('mongoose');

const defaults = {
  subjects: [
    'Monitor ตรวจสอบการทำงานหุ่นยนต์',
    'Training การใช้งานหุ่นยนต์',
    'ดึง report หุ่นยนต์',
    'ติดตั้ง/สแกน/ตำแหน่งแผนที่หุ่นยนต์',
    'พบระบบน้ำเสียของหุ่นยนต์มีปัญหา',
    'หุ่นยนต์ทำงานผิดปกติ',
    'อุปกรณ์สิ้นงาน',
    'ไม่สามารถ update software หุ่นยนต์',
    'อื่นๆ',
  ],
  types: ['Hardware', 'Software', 'Network', 'บริการทั่วไป', 'อื่นๆ'],
};
const optionSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true, maxlength: 200 } });
const schema = new mongoose.Schema({
  _id: { type: String, default: 'case-support' },
  subjects: [optionSchema],
  types: [optionSchema],
}, { optimisticConcurrency: true });
const CaseSupportOptions = mongoose.model('CaseSupportOptions', schema);

async function getOptions() {
  // Initialize once, including when every option has subsequently been deleted.
  try {
    return await CaseSupportOptions.findOneAndUpdate({ _id: 'case-support' }, {
      $setOnInsert: Object.fromEntries(Object.entries(defaults).map(([key, names]) =>
        [key, names.map(name => ({ name }))])),
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
  } catch (error) {
    if (error.code === 11000) return CaseSupportOptions.findById('case-support');
    throw error;
  }
}

module.exports = { getOptions };
