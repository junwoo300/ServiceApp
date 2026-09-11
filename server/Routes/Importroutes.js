const express = require('express');
const multer = require('multer');
const router = express.Router();

const {
    importEmployees,
    importSites,
    importEquipment,
    importRobots,
    importOnsiteRecords
} = require('../Controllers/Importcontroller');

// ตั้งค่า Multer ให้รับไฟล์ใน memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// กำหนด Endpoint สำหรับการ Import แต่ละประเภท
// Middleware 'upload.single('file')' จะจัดการไฟล์ที่อัปโหลดมากับ key ชื่อ 'file'
router.post('/import/employees', upload.single('file'), importEmployees);
router.post('/import/sites', upload.single('file'), importSites);
router.post('/import/equipment', upload.single('file'), importEquipment);
router.post('/import/robots', upload.single('file'), importRobots);
router.post('/import/onsite-records', upload.single('file'), importOnsiteRecords);

module.exports = router;
