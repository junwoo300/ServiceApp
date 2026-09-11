const express = require('express');
const router = express.Router();
const { 
    createProjectfix, 
    getAllProjectsfix,
    createcasefix,
    getCasefixByProjectId,
    addHowtofix,
    getHowtofixByCasefixId,
} = require('../Controllers/CasefixController');

// เส้นทางสำหรับการสร้าง PMA ใหม่
router.post('/createProjectfix', createProjectfix);

router.get('/getAllProjectsfix', getAllProjectsfix);

router.post('/createcasefix', createcasefix);

// ใช้ getCasefixByProjectId ที่ได้ import มาแล้ว
router.get('/casefix-by-project/:projectId', getCasefixByProjectId);

router.post('/add-howtofix', addHowtofix);

router.get('/howtofix-by-case/:casefixId', getHowtofixByCasefixId);


module.exports = router;
