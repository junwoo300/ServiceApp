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
const upload = multer({ storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 5, parts: 6, fieldSize: 1024 },
    fileFilter(req, file, cb) {
        const allowed = /\.(xlsx|xls)$/i.test(file.originalname);
        cb(allowed ? null : Object.assign(new Error('Only .xlsx and .xls files are allowed'), { status: 400 }), allowed);
    }
});

// กำหนด Endpoint สำหรับการ Import แต่ละประเภท
// Middleware 'upload.single('file')' จะจัดการไฟล์ที่อัปโหลดมากับ key ชื่อ 'file'
router.post('/import/employees', upload.single('file'), importEmployees);
router.post('/import/sites', upload.single('file'), importSites);
router.post('/import/equipment', upload.single('file'), importEquipment);
router.post('/import/robots', upload.single('file'), importRobots);
router.post('/import/onsite-records', upload.single('file'), importOnsiteRecords);

module.exports = router;
