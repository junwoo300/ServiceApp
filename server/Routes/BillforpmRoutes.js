const express = require("express");
const router = express.Router();
const BillforpmController = require("../Controllers/BillforpmController");

// 📌 เพิ่มบิลใหม่
router.post("/addBill", BillforpmController.addBill);

// 📌 ดึงบิลทั้งหมด
router.get("/getAllBill", BillforpmController.getAllBill);

// 📌 Toggle สถานะระหว่าง Done ↔ Pending
router.put('/toggleStatus/:id', BillforpmController.toggleStatus);

// ✅ เส้นทางลบบิล
router.delete("/deleteBill/:id", BillforpmController.deleteBill);

module.exports = router; // ✅ ส่ง router ออกไปให้ไฟล์หลักใช้งาน
