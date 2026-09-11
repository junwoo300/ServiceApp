// routes/Onsiteroutes.js

const express = require('express');
const router = express.Router();

// ✅ (ไม่มีการเปลี่ยนแปลงในส่วน import นี้ ตามที่คุณระบุ)
const {
    getAllEmployees, createEmployee, updateEmployee, deleteEmployee,
    getAllSites, createSite, updateSite, deleteSite,
    getAllEquipment, createEquipment, updateEquipment, deleteEquipment,
    getAllOnsiteRecords,
    getOnsiteRecordById,
    deleteOnsiteRecord,
    exportOnsiteRecords,
    exportOnsiteRecordsByYear,
    getOnsiteRecordsByYear,
    // สมมติว่า updateOnsiteRecord ถูก import ไว้แล้วในไฟล์ของคุณ
    updateOnsiteRecord // <-- สันนิษฐานว่าคุณมีบรรทัดนี้อยู่แล้วและจะจัดการเอง
} = require('../Controllers/Onsitecontroller');

// --- Employee, Site, Equipment Routes (คงเดิม) ---
router.get('/onsite/employees', getAllEmployees);
router.post('/onsite/employees', createEmployee);
router.put('/onsite/employees/:id', updateEmployee);
router.delete('/onsite/employees/:id', deleteEmployee);

router.get('/onsite/sites', getAllSites);
router.post('/onsite/sites', createSite);
router.put('/onsite/sites/:id', updateSite);
router.delete('/onsite/sites/:id', deleteSite);

router.get('/onsite/equipment', getAllEquipment);
router.post('/onsite/equipment', createEquipment);
router.put('/onsite/equipment/:id', updateEquipment);
router.delete('/onsite/equipment/:id', deleteEquipment);


// --- Onsite Record Routes ---

// Route ที่มี path เฉพาะเจาะจงต้องอยู่ก่อน dynamic route เสมอ
router.get('/onsite/records', getAllOnsiteRecords);
router.get('/onsite/records/export', exportOnsiteRecords);
router.get('/onsite/records/export-year', exportOnsiteRecordsByYear);
router.get('/onsite/records/get-by-year', getOnsiteRecordsByYear);

// Dynamic route ที่มี :id ต้องอยู่ท้ายสุด
router.get('/onsite/records/:id', getOnsiteRecordById);

// ✅ เพิ่ม Route สำหรับการอัปเดต Onsite Record
// ใช้ HTTP PUT method เพื่ออัปเดตข้อมูลของ Record ที่ระบุด้วย :id
router.put('/onsite/records/:id', updateOnsiteRecord);

router.delete('/onsite/records/:id', deleteOnsiteRecord);


module.exports = router;