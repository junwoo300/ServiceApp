const express = require('express');
const router = express.Router();
const draftEmailController = require('../Controllers/draftEmailController');

// เส้นทางสำหรับจัดการร่างอีเมล
router.post('/createmail', draftEmailController.createDraft);           // POST    /api/email-draft/createmail
router.get('/allmail', draftEmailController.getAllDrafts);              // GET     /api/email-draft/allmail
router.get('/getmail/:id', draftEmailController.getDraftById);          // GET     /api/email-draft/getmail/:id
router.put('/updatemail/:id', draftEmailController.updateDraft);        // PUT     /api/email-draft/updatemail/:id
router.delete('/deletemail/:id', draftEmailController.deleteDraft);     // DELETE  /api/email-draft/deletemail/:id

module.exports = router;
