const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const {
  createProject,
  createSite,
  createDevice,
  getAllProjects,
  getAllSites,
  getAllDevices,
  getSitesByProjectId,
  getDeviceBySite,
} = require('../Controllers/CameraController');

const router = express.Router();

// ตั้งค่า multer สำหรับจัดการการอัปโหลดไฟล์


// Middleware สำหรับจัดการข้อผิดพลาด


// เส้นทางสำหรับโปรเจค
router.post('/projects', upload.single('image'), createProject); // ใช้ middleware สำหรับการอัปโหลดไฟล์
router.get('/projects', getAllProjects);

// Route สำหรับแสดงข้อมูลไซต์ตาม projectId
router.get('/projects/:projectId/sites', async (req, res) => {
  const { projectId } = req.params;
  try {
      const sites = await getSitesByProjectId(projectId); // เรียกใช้ฟังก์ชันที่คุณมี

      // ตรวจสอบว่ามีไซต์ที่พบหรือไม่
      if (!sites || sites.length === 0) {
          return res.status(404).json({ message: 'No sites found for this project' });
      }

      // ส่งข้อมูลไซต์กลับ
      res.json(sites);
  } catch (error) {
      console.error('Error fetching sites:', error); // แสดงข้อผิดพลาดใน console
      res.status(500).json({ message: 'Error fetching sites', error: error.message }); // ส่งข้อความข้อผิดพลาดกลับ
  }
});


// เส้นทางสำหรับไซต์
router.post('/projects/:projectId/sites', createSite); // เปลี่ยนเส้นทางเพื่อเชื่อมโยงกับ projectId
router.get('/sites', getAllSites);

// เส้นทางสำหรับอุปกรณ์


router.get('/sites/:siteId/devices', getDeviceBySite);
router.post('/devices/:siteId', createDevice);

router.get('/devices', getAllDevices);

// ใช้งาน middleware สำหรับจัดการข้อผิดพลาด


module.exports = router;
