const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ตรวจสอบและสร้างโฟลเดอร์ 'uploads/' ถ้าไม่มี
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true }, (err) => {
    if (err) throw err;  // เพิ่มการตรวจสอบข้อผิดพลาดในการสร้างโฟลเดอร์
  });
}

// กำหนดที่เก็บไฟล์และตั้งชื่อไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // เก็บไฟล์ในโฟลเดอร์ 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ชื่อไฟล์ไม่ซ้ำกันโดยใช้เวลา
  }
});

// ฟังก์ชันตรวจสอบประเภทไฟล์
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|bmp/; // กำหนดประเภทไฟล์ที่รับ (สามารถปรับเพิ่มได้)
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase()); // ตรวจสอบนามสกุลไฟล์
  const mimeType = fileTypes.test(file.mimetype); // ตรวจสอบ MIME type

  if (extname && mimeType) {
    cb(null, true);  // ถ้าไฟล์ถูกต้อง ให้ผ่าน
  } else {
    cb(new Error('Only images (jpeg, jpg, png, gif, bmp) are allowed'), false); // แจ้งข้อผิดพลาดที่ชัดเจนขึ้น
  }
};

// สร้างการอัปโหลดด้วย multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // จำกัดขนาดไฟล์ที่ 5MB
  onError: (err, next) => {
    console.error(err);  // แสดงข้อผิดพลาด
    next(err);
  }
});

// ส่งออก upload
module.exports = upload;
