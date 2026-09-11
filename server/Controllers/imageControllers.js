// Controllers/imageControllers.js
const Image = require('../Models/imageModels'); // ปรับเส้นทางให้ตรงกับที่ตั้งของโมเดล

// ฟังก์ชันสำหรับอัปโหลดภาพ
const uploadImage = async (req, res) => {
  try {
    const newImage = new Image({ imageUrl: req.file.path });
    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

// ฟังก์ชันสำหรับดึงภาพทั้งหมด
const getAllImages = async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong!' });
  }
};

module.exports = {
  uploadImage,
  getAllImages,
};
