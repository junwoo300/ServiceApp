// controllers/Onsitecontroller.js

// Import models ทั้งหมด
const { Onsite, Employeeonsite, Equipmentonsite, Siteonsite } = require('../Models/Onsitemodels');
const xlsx = require('xlsx'); // เพิ่ม: import ไลบรารี xlsx

// ฟังก์ชันสำหรับจัดการ Error แบบใช้ซ้ำ
const handleError = (res, error) => {
    console.error(error);
    // ตรวจจับ Duplicate Key Error
    if (error.code === 11000) {
        return res.status(409).json({ message: "ข้อมูลซ้ำซ้อน", error: error.keyValue });
    }
    res.status(500).json({ message: "เกิดข้อผิดพลาดใน Server", error: error.message });
};

// --- Employee, Site, Equipment Controllers (คงเดิม ไม่มีการเปลี่ยนแปลง) ---

exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employeeonsite.find();
        res.status(200).json(employees);
    } catch (error) { handleError(res, error); }
};

exports.createEmployee = async (req, res) => {
    try {
        const newEmployee = new Employeeonsite(req.body);
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (error) { handleError(res, error); }
};

exports.updateEmployee = async (req, res) => {
    try {
        const updatedEmployee = await Employeeonsite.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedEmployee) return res.status(404).json({ message: "ไม่พบข้อมูลพนักงาน" });
        res.status(200).json(updatedEmployee);
    } catch (error) { handleError(res, error); }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const deletedEmployee = await Employeeonsite.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) return res.status(404).json({ message: "ไม่พบข้อมูลพนักงาน" });
        res.status(200).json({ message: "ลบพนักงานสำเร็จ" });
    } catch (error) { handleError(res, error); }
};

exports.getAllSites = async (req, res) => {
    try {
        const sites = await Siteonsite.find().sort('type name');
        res.status(200).json(sites);
    } catch (error) { handleError(res, error); }
};

exports.createSite = async (req, res) => {
    try {
        const newSite = new Siteonsite(req.body);
        await newSite.save();
        res.status(201).json(newSite);
    } catch (error) { handleError(res, error); }
};

exports.updateSite = async (req, res) => {
    try {
        const updatedSite = await Siteonsite.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedSite) return res.status(404).json({ message: "ไม่พบข้อมูลไซต์" });
        res.status(200).json(updatedSite);
    } catch (error) { handleError(res, error); }
};

exports.deleteSite = async (req, res) => {
    try {
        const deletedSite = await Siteonsite.findByIdAndDelete(req.params.id);
        if (!deletedSite) return res.status(404).json({ message: "ไม่พบข้อมูลไซต์" });
        res.status(200).json({ message: "ลบไซต์สำเร็จ" });
    } catch (error) { handleError(res, error); }
};

exports.getAllEquipment = async (req, res) => {
    try {
        const equipment = await Equipmentonsite.find().sort('type name');
        res.status(200).json(equipment);
    } catch (error) { handleError(res, error); }
};

exports.createEquipment = async (req, res) => {
    try {
        const newEquipment = new Equipmentonsite(req.body);
       await newEquipment.save();
        res.status(201).json(newEquipment);
    } catch (error) { handleError(res, error); }
};

exports.updateEquipment = async (req, res) => {
    try {
        const updatedEquipment = await Equipmentonsite.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedEquipment) return res.status(404).json({ message: "ไม่พบข้อมูลอุปกรณ์" });
        res.status(200).json(updatedEquipment);
    } catch (error) { handleError(res, error); }
};

exports.deleteEquipment = async (req, res) => {
    try {
        const deletedEquipment = await Equipmentonsite.findByIdAndDelete(req.params.id);
        if (!deletedEquipment) return res.status(404).json({ message: "ไม่พบข้อมูลอุปกรณ์" });
        res.status(200).json({ message: "ลบอุปกรณ์สำเร็จ" });
    } catch (error) { handleError(res, error); }
};


// --- Onsite Record Controllers ---

// ✅ เพิ่ม: ฟังก์ชันสำหรับอัปเดต Onsite Record
// ฟังก์ชันนี้จะรับข้อมูลที่ส่งมาจาก Frontend และทำการอัปเดต Record ในฐานข้อมูล
// โดยใช้ findByIdAndUpdate ซึ่งจะอัปเดตเฉพาะฟิลด์ที่มีอยู่ใน req.body
// และใช้ { new: true } เพื่อให้คืนค่า Record ที่ถูกอัปเดตแล้ว
// และ { runValidators: true } เพื่อให้ Mongoose รัน validation ตาม Schema
exports.updateOnsiteRecord = async (req, res) => {
    try {
        const updatedRecord = await Onsite.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedRecord) {
            return res.status(404).json({ message: "ไม่พบบันทึก Onsite ที่ต้องการอัปเดต" });
        }
        res.status(200).json(updatedRecord);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getAllOnsiteRecords = async (req, res) => {
    try {
        const { page = 1, limit = 50, site, employee, startDate, endDate, type } = req.query;
        const filters = {};
        if (site) filters.site = site;
        if (employee) filters.employees = employee;
        if (type) filters.type = type;
        if (startDate || endDate) {
            filters.onsiteDate = {};
            if (startDate) filters.onsiteDate.$gte = new Date(startDate);
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                filters.onsiteDate.$lte = endOfDay;
            }
        }
        const totalRecords = await Onsite.countDocuments(filters);
        const totalPages = Math.ceil(totalRecords / limit);
        const records = await Onsite.find(filters)
            .populate('employees', 'name')
            .populate('site', 'name Refcode') // ✅ เพิ่ม Refcode เพื่อให้หน้า Dashboard แสดงผลได้
            .populate('equipment', 'name')
            .sort({ onsiteDate: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.status(200).json({ records, totalPages, currentPage: parseInt(page), totalRecords });
    } catch (error) {
        handleError(res, error);
    }
};

// ✅✅✅ เพิ่มฟังก์ชันนี้สำหรับหน้ากราฟโดยเฉพาะ ✅✅✅
exports.getOnsiteRecordsByYear = async (req, res) => {
    const { year } = req.query;
    if (!year) {
        return res.status(400).json({ msg: 'กรุณาระบุปี' });
    }
    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        const records = await Onsite.find({
            onsiteDate: { $gte: startDate, $lte: endDate }
        })
        .populate('employees', 'name')
        .populate('site', 'name')
        .lean(); // .lean() เพื่อ performance ที่ดีขึ้น
        res.status(200).json(records);
    } catch (error) {
        handleError(res, error);
    }
};

exports.exportOnsiteRecords = async (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ msg: 'กรุณาระบุปีและเดือน' });
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, parseInt(month, 10), 0, 23, 59, 59);
        const recordsToExport = await Onsite.find({ onsiteDate: { $gte: startDate, $lte: endDate } })
            .populate('employees', 'name').populate('site', 'name Refcode').populate('equipment', 'name').sort({ onsiteDate: 'asc' });
        if (recordsToExport.length === 0) return res.status(404).json({ msg: 'ไม่พบข้อมูลในเดือนที่เลือก' });

        const dataToExport = recordsToExport.map(rec => ({
            'วันที่': rec.onsiteDate ? new Date(rec.onsiteDate).toLocaleDateString('th-TH') : '-',
            'Implement (ดำเนินการโดย)': rec.employees?.map(emp => emp.name).join(', ') || '-',
            'Type': rec.type || '-',
            'Site': rec.site?.name || '-',
            'Ref Code': rec.site?.Refcode || '-', // ✅ เพิ่ม Refcode ใน Export
            'Robot Name': rec.robotname || '-',
            'รายการอุปกรณ์': rec.equipment?.map(eq => eq.name).join(', ') || '-',
            'Cost (ราคาของ)': rec.totalEquipmentCost || 0,
            'Shipping (ราคาขนส่ง)': rec.Shipping || 0,
            'ค่าแรง': rec.totalLaborCost || 0,
            'ค่าเดินทาง': rec.travelCost || 0,
            'ค่ารวม': rec.grandTotal || 0,
            'Scope of Work': rec.scope || '-',
            'รายละเอียด': rec.details || '-',
        }));

        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "OnsiteRecords");
        const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Disposition', `attachment; filename="Onsite_Export_${year}-${month}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        handleError(res, error);
    }
};

exports.exportOnsiteRecordsByYear = async (req, res) => {
    const { year } = req.query;
    if (!year) return res.status(400).json({ msg: 'กรุณาระบุปี' });
    try {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        const recordsToExport = await Onsite.find({ onsiteDate: { $gte: startDate, $lte: endDate } })
            .populate('employees', 'name').populate('site', 'name Refcode').populate('equipment', 'name').sort({ onsiteDate: 'asc' });
        if (recordsToExport.length === 0) return res.status(404).json({ msg: 'ไม่พบข้อมูลในปีที่เลือก' });

        const dataToExport = recordsToExport.map(rec => ({
            'วันที่': rec.onsiteDate ? new Date(rec.onsiteDate).toLocaleDateString('th-TH') : '-',
            'Implement (ดำเนินการโดย)': rec.employees?.map(emp => emp.name).join(', ') || '-',
            'Type': rec.type || '-',
            'Site': rec.site?.name || '-',
            'Ref Code': rec.site?.Refcode || '-', // ✅ เพิ่ม Refcode ใน Export
            'Robot Name': rec.robotname || '-',
            'รายการอุปกรณ์': rec.equipment?.map(eq => eq.name).join(', ') || '-',
            'Cost (ราคาของ)': rec.totalEquipmentCost || 0,
            'Shipping (ราคาขนส่ง)': rec.Shipping || 0,
            'ค่าแรง': rec.totalLaborCost || 0,
            'ค่าเดินทาง': rec.travelCost || 0,
            'ค่ารวม': rec.grandTotal || 0,
            'Scope of Work': rec.scope || '-',
            'รายละเอียด': rec.details || '-',
        }));

        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "OnsiteRecords");
        const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        res.setHeader('Content-Disposition', `attachment; filename="Onsite_Export_Year_${year}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getOnsiteRecordById = async (req, res) => {
    try {
        const record = await Onsite.findById(req.params.id)
            .populate('employees').populate('site').populate('equipment');
        if (!record) return res.status(404).json({ message: "ไม่พบบันทึก Onsite" });
        res.status(200).json(record);
    } catch (error) { handleError(res, error); }
};

exports.deleteOnsiteRecord = async (req, res) => {
    try {
        const deletedRecord = await Onsite.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: "ไม่พบบันทึก Onsite" });
        res.status(200).json({ message: "ลบบันทึก Onsite สำเร็จ" });
    } catch (error) { handleError(res, error); }
};