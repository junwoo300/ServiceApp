const mongoose = require('mongoose');

const caseSupportSchema = new mongoose.Schema(
  {
    caseNo: { type: String, required: true, unique: true, index: true },
    openedDate: { type: Date, required: true, default: Date.now },
    completedDate: { type: Date, default: null },
    subject: {
      type: String,
      enum: [
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
      required: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    site: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Hardware', 'Software', 'Network', 'บริการทั่วไป', 'อื่นๆ'],
      required: true,
      trim: true,
    },
    category: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ['ต่ำ', 'ปกติ', 'สูง', 'เร่งด่วน'],
      default: 'ปกติ',
    },
    status: {
      type: String,
      enum: ['เปิดเคส', 'กำลังดำเนินการ', 'รอลูกค้า', 'เสร็จสิ้น', 'ยกเลิก'],
      default: 'เปิดเคส',
    },
    assignee: { type: String, default: '', trim: true },
    dueDate: { type: Date, default: null },
    resolution: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CaseSupport', caseSupportSchema);
