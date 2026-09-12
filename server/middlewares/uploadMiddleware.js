const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs/promises');
const { randomUUID } = require('node:crypto');
const directory = path.join(__dirname, '..', 'uploads');
const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.bmp': 'image/bmp' };
const invalid = () => Object.assign(new Error('Only valid JPEG, PNG, GIF or BMP images are allowed'), { status: 400 });
function validSignature(buffer, ext) {
  if (ext === '.jpg' || ext === '.jpeg') return buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
  if (ext === '.png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (ext === '.gif') return ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString());
  return ext === '.bmp' && buffer.subarray(0, 2).toString() === 'BM';
}
const upload = multer({ storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20, fieldSize: 64 * 1024, parts: 21 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(types[ext] === file.mimetype ? null : invalid(), types[ext] === file.mimetype);
  }
});
module.exports = {
  single(field) {
    const receive = upload.single(field);
    return (req, res, next) => receive(req, res, async error => {
      if (error) return next(error);
      if (!req.file) return next(Object.assign(new Error('Image is required'), { status: 400 }));
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!validSignature(req.file.buffer, ext)) return next(invalid());
      try {
        await fs.mkdir(directory, { recursive: true });
        const filename = `${randomUUID()}${ext}`;
        await fs.writeFile(path.join(directory, filename), req.file.buffer, { flag: 'wx' });
        req.file.path = `uploads/${filename}`;
        delete req.file.buffer;
        next();
      } catch (err) { next(err); }
    });
  }
};
