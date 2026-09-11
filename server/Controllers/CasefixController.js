const { Projectfix, Casefix, Howtofix } = require('../Models/CasefixModels');

const createProjectfix = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required.' });
        }

        const newProjectfix = new Projectfix({ name, description });
        await newProjectfix.save();

        res.status(201).json(newProjectfix);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllProjectsfix = async (req, res) => {
    try {
        const allProjectsfix = await Projectfix.find();
        res.json(allProjectsfix);
    } catch (error) {
        console.error('Error fetching projectsfix:', error);
        res.status(500).json({ error: error.message });
    }
};

const createcasefix = async (req, res) => {
    try {
        const { casename, casedescription, projectfix } = req.body;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (!casename || !casedescription || !projectfix) {
            return res.status(400).json({ error: 'casename, casedescription, and projectfix are required.' });
        }

        // ตรวจสอบว่า projectfix ที่อ้างถึงมีอยู่จริง
        const project = await Projectfix.findById(projectfix);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // สร้าง Casefix ใหม่และเชื่อม projectfix ให้ตรงกับ schema
        const newcasefix = new Casefix({
            casename,
            casedescription,
            projectfix: project._id, // หรือใช้ projectfix ก็ได้ เพราะมันคือ ID อยู่แล้ว
        });

        await newcasefix.save();
        res.status(201).json(newcasefix);
    } catch (error) {
        console.error('Error creating casefix:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ฟังก์ชัน getCasefixByProjectId ที่ขาดไป
const getCasefixByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;
        const casefixes = await Casefix.find({ projectfix: projectId });
        res.json(casefixes);
    } catch (error) {
        console.error('Error fetching casefix by project ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const addHowtofix = async (req, res) => {
    try {
      const { title, casefix, description } = req.body;  // แก้ไขจาก descriptio เป็น description
  
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!title || !casefix || !description) {  // ตรวจสอบ description ด้วย
        return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
      }
  
      // สร้าง Howtofix ใหม่
      const newHowtofix = new Howtofix({
        title,
        casefix,
        description,
      });
  
      // บันทึกข้อมูลลงในฐานข้อมูล
      const savedHowtofix = await newHowtofix.save();
  
      // ส่งผลลัพธ์กลับไป
      res.status(201).json({
        message: 'Howtofix added successfully',
        data: savedHowtofix,
      });
    } catch (error) {
      console.error('Error adding Howtofix:', error);
      res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่ม Howtofix' });
    }
};

  const getHowtofixByCasefixId = async (req, res) => {
    const { casefixId } = req.params;

    try {
        // ค้นหาข้อมูล Howtofix โดยอ้างอิงจาก casefixId
        const howtofix = await Howtofix.find({ casefix: casefixId });

        if (!howtofix) {
            return res.status(404).json({ message: 'ไม่พบข้อมูล Howtofix สำหรับ Casefix นี้' });
        }

        // ส่งข้อมูลกลับไป
        res.status(200).json(howtofix);
    } catch (error) {
        console.error('Error fetching howtofix:', error);
        res.status(500).json({ message: 'ไม่สามารถโหลดข้อมูล Howtofix ได้' });
    }
};


module.exports = {
    createProjectfix,
    getAllProjectsfix,
    createcasefix,
    getCasefixByProjectId,  // อย่าลืม export ฟังก์ชันนี้ด้วย
    addHowtofix,
    getHowtofixByCasefixId,
};
