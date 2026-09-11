const PmMaintenance = require('../models/pmMaintenance'); // นำเข้าโมเดล PmMaintenance

// ฟังก์ชันสร้าง PM Maintenance ใหม่
const createPmMaintenance = async (req, res) => {
  try {
    const newMaintenance = new PmMaintenance(req.body);
    const savedMaintenance = await newMaintenance.save();
    res.status(201).json(savedMaintenance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ฟังก์ชันดึง PM Maintenance ทั้งหมด
const listPmMaintenances = async (req, res) => {
  try {
    const maintenances = await PmMaintenance.find();
    res.json(maintenances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ฟังก์ชันดึง PM Maintenance ตาม ID
const getPmMaintenanceById = async (req, res) => {
  try {
    const maintenance = await PmMaintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ error: 'PM Maintenance not found' });
    }
    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ฟังก์ชันอัปเดต PM Maintenance ตาม ID
const updatePmMaintenance = async (req, res) => {
  try {
    const maintenance = await PmMaintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!maintenance) {
      return res.status(404).json({ error: 'PM Maintenance not found' });
    }
    res.json(maintenance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ฟังก์ชันลบ PM Maintenance ตาม ID
const deletePmMaintenance = async (req, res) => {
  try {
    const maintenance = await PmMaintenance.findByIdAndDelete(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ error: 'PM Maintenance not found' });
    }
    res.json({ message: 'PM Maintenance deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ฟังก์ชันดึง PM Maintenances ตาม pmaId
const listPmMaintenancesByPmaId = async (req, res) => {
  try {
    // ตรวจสอบว่ามี pmaId หรือไม่
    if (!req.params.id) {
      return res.status(400).json({ error: 'pmaId is required' });
    }

    const maintenances = await PmMaintenance.find({ pmaId: req.params.id });

    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (maintenances.length === 0) {
      return res.status(404).json({ error: 'PM Maintenance not found' });
    }

    res.json(maintenances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  

module.exports = {
  createPmMaintenance,
  listPmMaintenances,
  getPmMaintenanceById,
  updatePmMaintenance,
  deletePmMaintenance,
  listPmMaintenancesByPmaId
};
