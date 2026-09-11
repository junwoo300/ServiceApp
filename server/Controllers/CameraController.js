const { Project, Site, Device } = require('../Models/CameraModels'); // เปลี่ยนจาก CameraProject เป็น CameraModels

// ฟังก์ชันสร้างโปรเจค
const createProject = async (req, res) => {
    try {
        const { name, description } = req.body; // รับข้อมูลข้อความจาก body
        const imageUrl = req.file.path; // รับเส้นทางของไฟล์ที่อัปโหลด

        // ตรวจสอบว่าข้อมูลที่จำเป็นถูกส่งเข้ามา
        if (!name || !description || !imageUrl) {
            return res.status(400).json({ error: 'Name, description, and imageUrl are required.' });
        }

        // สร้างโปรเจคใหม่
        const project = new Project({ name, description, imageUrl });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ฟังก์ชันสร้างไซต์
const createSite = async (req, res) => {
    try {
        const { name } = req.body;
        const projectId = req.params.projectId; // ดึง projectId จาก params

        // ตรวจสอบว่าข้อมูลที่จำเป็นถูกส่งเข้ามา
        if (!name || !projectId) {
            return res.status(400).json({ error: 'Name and projectId are required.' });
        }

        // ตรวจสอบว่าโปรเจกต์ที่อ้างถึงมีอยู่จริง
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // สร้าง site ใหม่และเชื่อมกับโปรเจกต์ที่ส่งมา
        const newSite = new Site({
            name,
            project: projectId, // เชื่อม site กับโปรเจกต์
        });

        // บันทึก site ลงในฐานข้อมูล
        await newSite.save();
        res.status(201).json(newSite); // ส่งข้อมูล site ที่ถูกสร้างกลับไปยัง client
    } catch (error) {
        console.error('Error creating site:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// controller.js
const getSitesByProjectId = async (projectId) => {
    try {
        const sites = await Site.find({ project: projectId });
        return sites; // ส่งกลับไซต์ที่พบ
    } catch (error) {
        console.error('Error fetching sites:', error);
        throw new Error('Error fetching sites'); // ปล่อยข้อผิดพลาด
    }
};

  

// ฟังก์ชันสร้างอุปกรณ์
const createDevice = async (req, res) => {
    const { name, ip, user, password, description } = req.body;
    const siteId = req.params.siteId;

    // ตรวจสอบว่า name ถูกส่งเข้ามา
    if (!name) {
        return res.status(400).json({ error: 'Name is required.' });
    }

    try {
        const site = await Site.findById(siteId);
        if (!site) {
            return res.status(404).json({ error: 'Site not found' });
        }

        // สร้าง device ใหม่และเชื่อมกับ site ที่ส่งมา
        const newDevice = new Device({
            name,
            ip: ip || '', // กำหนดให้ ip มีค่าเป็นสตริงว่างหากไม่มีการป้อน
            site: siteId,
            user: user || '', // กำหนดให้ user มีค่าเป็นสตริงว่างหากไม่มีการป้อน
            password: password || '', // กำหนดให้ password มีค่าเป็นสตริงว่างหากไม่มีการป้อน
            description: description || '', // กำหนดให้ description มีค่าเป็นสตริงว่างหากไม่มีการป้อน
        });

        await newDevice.save();
        res.status(201).json(newDevice);
    } catch (error) {
        console.error('Error creating device:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getDeviceBySite = async (req, res) => {
    const { siteId } = req.params; // ดึง siteId จาก params
    try {
        const devices = await Device.find({ site: siteId }); // ค้นหาอุปกรณ์ที่เชื่อมโยงกับ siteId
  
        // ตรวจสอบว่ามีอุปกรณ์ที่พบหรือไม่
        if (!devices || devices.length === 0) {
            return res.status(404).json({ message: 'No devices found for this site' });
        }
  
        // ส่งข้อมูลอุปกรณ์กลับ
        res.json(devices);
    } catch (error) {
        console.error('Error fetching devices:', error); // แสดงข้อผิดพลาดใน console
        res.status(500).json({ message: 'Error fetching devices', error: error.message }); // ส่งข้อความข้อผิดพลาดกลับ
    }
  };

// ฟังก์ชันเพื่อรับโปรเจคทั้งหมด
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: error.message });
    }
};

// ฟังก์ชันเพื่อรับไซต์ทั้งหมด
const getAllSites = async (req, res) => {
    try {
        const sites = await Site.find().populate('project');
        res.json(sites);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ error: error.message });
    }
};

// ฟังก์ชันเพื่อรับอุปกรณ์ทั้งหมด
const getAllDevices = async (req, res) => {
    try {
        const devices = await Device.find().populate('site');
        res.json(devices);
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProject,
    createSite,
    createDevice,
    getAllProjects,
    getAllSites,
    getAllDevices,
    getSitesByProjectId,
    getDeviceBySite
};
