const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const { uploadImage, getAllImages } = require('../Controllers/imageControllers');
const router = express.Router();
router.post('/upload', upload.single('image'), uploadImage);
router.get('/images', getAllImages);
module.exports = router;
