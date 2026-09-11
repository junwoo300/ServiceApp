// Routes/imageRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadImage, getAllImages } = require('../Controllers/imageControllers'); // นำเข้าฟังก์ชันจาก controllers

const router = express.Router();

// ตั้งค่า multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // ที่เก็บภาพ
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์
  },
});

const upload = multer({ storage });

// Route สำหรับการอัปโหลดภาพ
router.post('/upload', upload.single('image'), uploadImage); // เรียกใช้งานฟังก์ชัน uploadImage

// Route สำหรับดึงภาพทั้งหมด
router.get('/images', getAllImages); // เรียกใช้งานฟังก์ชัน getAllImages

module.exports = router;
