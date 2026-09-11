const mongoose = require('mongoose');

// สร้าง Schema สำหรับ Project
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

// สร้าง Schema สำหรับ Site
const siteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // เชื่อมกับ Project
});

// สร้าง Schema สำหรับ Device
const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ip: { type: String, default: null },
  site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' }, // เชื่อมกับ Site
  user: { type: String, default: null },
  password: { type: String, default: null },
  description: { type: String, default: null },
});

// สร้างโมเดล
const Project = mongoose.model('Project', projectSchema);
const Site = mongoose.model('Site', siteSchema);
const Device = mongoose.model('Device', deviceSchema);

module.exports = { Project, Site, Device };
