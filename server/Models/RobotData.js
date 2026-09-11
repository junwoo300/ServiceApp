const mongoose = require("mongoose");

const RobotSchema = new mongoose.Schema({
  type: { type: String, required: true },
  model: { type: String, required: true },
  lot: { type: String, required: false } ,
  vin: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  note: { type: String, default: "" }, // เพิ่ม note สำหรับบันทึกข้อมูลเพิ่มเติม
}, { timestamps: true });

module.exports = mongoose.model("RobotData", RobotSchema);
