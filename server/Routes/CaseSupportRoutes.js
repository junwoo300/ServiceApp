const express = require('express');
const multer = require('multer');
const {
  getCaseSupports,
  createCaseSupport,
  updateCaseSupport,
  updateCaseSupportStatus,
  deleteCaseSupport,
  exportCaseSupports,
  importCaseSupports,
} = require('../Controllers/CaseSupportController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, cb) {
    cb(/\.(xlsx|xls)$/i.test(file.originalname) ? null : Object.assign(new Error('Only .xlsx and .xls files are allowed'), { status: 400 }), /\.(xlsx|xls)$/i.test(file.originalname));
  },
});

router.get('/case-support', getCaseSupports);
router.get('/case-support/export', exportCaseSupports);
router.post('/case-support/import', upload.single('file'), importCaseSupports);
router.post('/case-support', createCaseSupport);
router.put('/case-support/:id', updateCaseSupport);
router.patch('/case-support/:id/status', updateCaseSupportStatus);
router.delete('/case-support/:id', deleteCaseSupport);

module.exports = router;
