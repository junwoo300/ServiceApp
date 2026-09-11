const mongoose = require('mongoose');

// สร้าง Schema สำหรับ Project
const projectfixSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Schema สำหรับ Case
const casefixSchema = new mongoose.Schema({
    casename: { type: String, required: true },
    casedescription: { type: String, required: true },
    projectfix: { type: mongoose.Schema.Types.ObjectId, ref: 'Projectfix' },
});


// Schema สำหรับ Howtofix
const howtofixSchema = new mongoose.Schema({
  // ชื่อเรื่องของ Howtofix
  title: { type: String, required: true },

  // การอ้างอิงไปยัง Casefix
  casefix: { type: mongoose.Schema.Types.ObjectId, ref: 'Casefix' },

  // รายละเอียดเพิ่มเติม
  description: { type: String, default: null },

});


// สร้างโมเดล (ใช้ตัวพิมพ์ใหญ่)
const Projectfix = mongoose.model('Projectfix', projectfixSchema);
const Casefix = mongoose.model('Casefix', casefixSchema);
const Howtofix = mongoose.model('Howtofix', howtofixSchema);

module.exports = { Projectfix, Casefix, Howtofix };








  