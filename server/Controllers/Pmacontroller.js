const Pma = require('../models/PMA');
const XLSX = require('xlsx');

const createPma = async (req, res) => {
  try {
    const pma = new Pma(req.body);
    await pma.save();
    res.status(201).json(pma);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listPmas = async (req, res) => {
  try {
    const pmas = await Pma.find();
    res.json(pmas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPmaById = async (req, res) => {
  try {
    const pma = await Pma.findById(req.params.id);
    if (!pma) {
      return res.status(404).json({ error: 'PMA not found' });
    }
    res.json(pma);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePma = async (req, res) => {
  try {
    const pma = await Pma.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pma) {
      return res.status(404).json({ error: 'PMA not found' });
    }
    res.json(pma);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deletePma = async (req, res) => {
  try {
    const pma = await Pma.findByIdAndDelete(req.params.id);
    if (!pma) {
      return res.status(404).json({ error: 'PMA not found' });
    }
    res.json({ message: 'PMA deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const importPmas = async (req, res) => {
  try {
    const pmas = req.body;

    console.log('Data Received:', pmas); // เพิ่มการบันทึกข้อมูลที่ได้รับ

    if (!pmas || !Array.isArray(pmas) || pmas.length === 0) {
      return res.status(400).json({ error: 'No data found in the file' });
    }

    for (const pma of pmas) {
      if (!pma.NUPMA || !pma.CodePMa || !pma.Name || !pma['Start Date'] || !pma['End Date']) {
        return res.status(400).json({ error: 'Missing required fields in data' });
      }

      if (isNaN(new Date(pma['Start Date'])) || isNaN(new Date(pma['End Date']))) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    await Pma.insertMany(pmas.map(pma => ({
      nupma: pma.NUPMA,
      codepma: pma.CodePMa,
      name: pma.Name,
      customer: pma.Customer || '',
      employer: pma.Employer || '',
      subcontract: pma.Subcontract || '',
      startdate: new Date(pma['Start Date']),
      enddate: new Date(pma['End Date']),
      status: pma.Status || '',
      lease: pma.Lease || '',
      document: pma.Document || '',
      sla: pma.SLA || '',
      note: pma.Note || '',
    })));
    res.status(201).json({ message: 'Data imported successfully!' });
  } catch (err) {
    console.error('Error importing data:', err.message || err);
    res.status(500).json({ error: 'Failed to import data' });
  }
};



module.exports = {
  createPma,
  listPmas,
  getPmaById,
  updatePma,
  deletePma,
  importPmas,
  
};
