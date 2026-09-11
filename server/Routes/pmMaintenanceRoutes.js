const express = require('express');
const router = express.Router();
const {
  createPmMaintenance,
  listPmMaintenances,
  getPmMaintenanceById,
  updatePmMaintenance,
  deletePmMaintenance,
  listPmMaintenancesByPmaId
} = require('../Controllers/pmMaintenanceController');

// เส้นทางสำหรับการสร้าง PM Maintenance ใหม่
router.post('/pm-maintenance', createPmMaintenance);

// เส้นทางสำหรับการดึง PM Maintenance ทั้งหมด d
router.get('/pm-maintenances', listPmMaintenances);

// เส้นทางสำหรับการดึงข้อมูล PM Maintenance ตาม ID
router.get('/pm-maintenance/:id', getPmMaintenanceById);

// เส้นทางสำหรับการอัปเดต PM Maintenance ตาม ID
router.put('/pm-maintenance/:id', updatePmMaintenance);

// เส้นทางสำหรับการลบ PM Maintenance ตาม ID
router.delete('/pm-maintenance/:id', deletePmMaintenance);

router.get('/pm-maintenances/:id', listPmMaintenancesByPmaId);

module.exports = router;
