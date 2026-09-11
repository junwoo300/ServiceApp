const express = require("express");
const router = express.Router();
const RobotController = require("../Controllers/RobotController");

// 🟢 Routes สำหรับหุ่นยนต์
router.get("/robots", RobotController.getAllRobots);
router.post("/robots", RobotController.addRobot);
router.delete("/robots/:vin", RobotController.deleteRobot);
router.put("/robots/:vin", RobotController.updateRobot);

// 🟠 Routes สำหรับการซ่อมบำรุง
router.get("/repairs/:vin", RobotController.getRepairsByVIN); // ดึงข้อมูลการซ่อม
router.post("/repairs", RobotController.addRepair); // เพิ่มข้อมูลการซ่อม

// Routes ที่เพิ่มใหม่
router.put("/repairs/:id", RobotController.updateRepair); // แก้ไขการซ่อม
router.delete("/repairs/:id", RobotController.deleteRepair);


module.exports = router;
