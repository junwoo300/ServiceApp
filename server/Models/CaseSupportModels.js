const mongoose = require('mongoose');

const caseSupportSchema = new mongoose.Schema(
  {
    caseNo: { type: String, required: true, unique: true, index: true },
    openedDate: { type: Date, required: true, default: Date.now },
    completedDate: { type: Date, default: null },
    subject: {
      type: String,
      maxlength: 200,
      required: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    site: { type: String, required: true, trim: true },
    type: {
      type: String,
      maxlength: 200,
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
    assignees: [{ type: String, trim: true }],
    dueDate: { type: Date, default: null },
    resolution: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CaseSupport', caseSupportSchema);
