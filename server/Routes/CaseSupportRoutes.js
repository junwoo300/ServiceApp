const express = require('express');
const {
  getCaseSupports,
  createCaseSupport,
  updateCaseSupport,
  updateCaseSupportStatus,
  deleteCaseSupport,
} = require('../Controllers/CaseSupportController');

const router = express.Router();

router.get('/case-support', getCaseSupports);
router.post('/case-support', createCaseSupport);
router.put('/case-support/:id', updateCaseSupport);
router.patch('/case-support/:id/status', updateCaseSupportStatus);
router.delete('/case-support/:id', deleteCaseSupport);

module.exports = router;
