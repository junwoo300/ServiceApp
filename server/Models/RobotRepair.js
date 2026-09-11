const mongoose = require("mongoose");

const RepairSchema = new mongoose.Schema({
  vin: { type: String, ref: "RobotData" },
  description: { type: String, }, // เพิ่มรายละเอียดของการซ่อม
  status: { type: String,  },
  repairDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("RobotRepair", RepairSchema);
