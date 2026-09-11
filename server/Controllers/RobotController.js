const Robot = require("../Models/RobotData");
const Repair  = require("../Models/RobotRepair"); // Import Model การซ่อม

// ดึงข้อมูลหุ่นยนต์ทั้งหมด
exports.getAllRobots = async (req, res) => {
  try {
    const robots = await Robot.find();
    res.status(200).json(robots);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch robots", error: error.message });
  }
};

// เพิ่มหุ่นยนต์ใหม่
exports.addRobot = async (req, res) => {
  try {
    const { type, model, vin, location, lot, note } = req.body;

    if (!type || !model || !vin || !location || !lot) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRobot = new Robot({ type, model, vin, location, lot, note });
    await newRobot.save();

    res.status(201).json({ message: "Robot added successfully", robot: newRobot });
  } catch (error) {
    res.status(500).json({ message: "Failed to add robot", error: error.message });
  }
};

// ลบหุ่นยนต์
exports.deleteRobot = async (req, res) => {
  try {
    const { vin } = req.params;
    const deletedRobot = await Robot.findOneAndDelete({ vin });

    if (!deletedRobot) {
      return res.status(404).json({ message: "Robot not found" });
    }

    res.status(200).json({ message: "Robot deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete robot", error: error.message });
  }
};

// แก้ไขข้อมูลหุ่นยนต์
exports.updateRobot = async (req, res) => {
  try {
    const { vin } = req.params;
    const updatedData = req.body;

    const updatedRobot = await Robot.findOneAndUpdate(
      { vin },
      updatedData,
      { new: true }
    );

    if (!updatedRobot) {
      return res.status(404).json({ message: "Robot not found" });
    }

    res.status(200).json({ message: "Robot updated successfully", robot: updatedRobot });
  } catch (error) {
    res.status(500).json({ message: "Failed to update robot", error: error.message });
  }
};


// ดึงข้อมูลการซ่อมของหุ่นยนต์ตาม VIN
exports.getRepairsByVIN = async (req, res) => {
    try {
      const { vin } = req.params;
      const repairs = await Repair.find({ vin });
  
      if (!repairs.length) {
        return res.status(404).json({ message: "No repair records found" });
      }
  
      res.status(200).json(repairs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch repair data", error: error.message });
    }
  };
  
  // เพิ่มข้อมูลการซ่อม
  exports.addRepair = async (req, res) => {
    try {
        const { vin, repairDate, description, status } = req.body; // ดึง status มาด้วย

        if (!vin || !description || !status) { // ตรวจสอบให้ครบถ้วน
            return res.status(400).json({ message: "All fields are required" });
        }

        const newRepair = new Repair({
            vin,
            description,
            status, // เพิ่มสถานะเข้าไป
            repairDate: repairDate || new Date() // ถ้าไม่มี repairDate ให้ใช้วันปัจจุบัน
        });

        await newRepair.save();
        res.status(201).json({ message: "Repair record added", repair: newRepair });
    } catch (error) {
        res.status(500).json({ message: "Failed to add repair record", error: error.message });
    }
};

  
  // แก้ไขข้อมูลการซ่อม
exports.updateRepair = async (req, res) => {
    try {
      const { id } = req.params; // รับ id ของ repair record
      const updatedData = req.body;
  
      const updatedRepair = await Repair.findByIdAndUpdate(id, updatedData, { new: true });
  
      if (!updatedRepair) {
        return res.status(404).json({ message: "Repair record not found" });
      }
  
      res.status(200).json({ message: "Repair record updated successfully", repair: updatedRepair });
    } catch (error) {
      res.status(500).json({ message: "Failed to update repair record", error: error.message });
    }
  };
  
  // ลบข้อมูลการซ่อม
  
  exports.deleteRepair = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedRepair = await Repair.findByIdAndDelete(id); // ลบด้วย _id
  
      if (!deletedRepair) {
        return res.status(404).json({ message: "Repair record not found" });
      }
  
      res.status(200).json({ message: "Repair record deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete repair record", error: error.message });
    }
  };
  
  
  