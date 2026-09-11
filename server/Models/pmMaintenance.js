const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pmMaintenanceSchema = new Schema({
  pmaId: { type: Schema.Types.ObjectId, ref: 'Pma' }, // ใช้ ID ของ PMA จากฐานข้อมูล pmas
  projectName: String,
  description: String, // เพิ่มฟิลด์ description
  entries: [
    {
      date: Date,
      count: String
    }
  ]
});

module.exports = mongoose.model('PmMaintenance', pmMaintenanceSchema);
