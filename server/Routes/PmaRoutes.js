const express = require('express');
const router = express.Router();
const { 
  createPma, 
  listPmas, 
  getPmaById, 
  updatePma, 
  deletePma, 
  importPmas,
 
} = require('../Controllers/Pmacontroller');

// เส้นทางสำหรับการสร้าง PMA ใหม่
router.post('/pma', createPma);

// เส้นทางสำหรับการดึง PMA ทั้งหมด
router.get('/pmas', listPmas);

// เส้นทางสำหรับการดึงข้อมูล PMA ตาม ID
router.get('/pma/:id', getPmaById);

// เส้นทางสำหรับการอัปเดต PMA ตาม ID
router.put('/pma/:id', updatePma);

// เส้นทางสำหรับการลบ PMA ตาม ID
router.delete('/pma/:id', deletePma);

// เส้นทางสำหรับการนำเข้าข้อมูล PMAs จากไฟล์
router.post('/import-pmas', importPmas);



module.exports = router;
