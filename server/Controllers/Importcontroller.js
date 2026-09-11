const xlsx = require('xlsx');
const { Onsite, Employeeonsite, Siteonsite, Equipmentonsite, RobotData } = require('../Models/Onsitemodels');

// ฟังก์ชันกลางสำหรับจัดการการ Import ข้อมูล Master
const createImportController = (Model, uniqueField, columns) => {
    return async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'ไม่พบไฟล์ที่อัปโหลด' });
        }
        try {
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
            const newRecords = data.map(row => {
                let record = {};
                columns.forEach((col, index) => { record[col] = row[index]; });
                return record;
            });
            const existingRecords = await Model.find({}, `${uniqueField}`).lean();
            const existingValues = new Set(existingRecords.map(rec => rec[uniqueField]));
            const recordsToInsert = newRecords.filter(rec => rec[uniqueField] && !existingValues.has(rec[uniqueField]));
            let insertedCount = 0;
            if (recordsToInsert.length > 0) {
                const result = await Model.insertMany(recordsToInsert, { ordered: false }).catch(err => {
                    if (err.code === 11000) return err.result.insertedIds;
                    throw err;
                });
                insertedCount = result.length || result.nInserted || 0;
            }
            const skippedCount = newRecords.length - insertedCount;
            res.status(200).json({ message: 'Import ข้อมูลสำเร็จ', insertedCount, skippedCount });
        } catch (error) {
            console.error('Import error:', error);
            res.status(500).json({ message: 'เกิดข้อผิดพลาดระหว่างการประมวลผลไฟล์ Excel' });
        }
    };
};

// สร้าง Controller สำหรับแต่ละ Model Master
exports.importEmployees = createImportController(Employeeonsite, 'name', ['name', 'rate']);
exports.importSites = createImportController(Siteonsite, 'name', ['name', 'type', 'travelCost', 'Refcode']);
exports.importEquipment = createImportController(Equipmentonsite, 'name', ['name', 'type', 'cost']);
exports.importRobots = createImportController(RobotData, 'vin', ['type', 'model', 'lot', 'vin', 'location', 'note']);


// ✅✅✅ แก้ไขลำดับการอ่านข้อมูลในฟังก์ชันนี้ทั้งหมด ✅✅✅
exports.importOnsiteRecords = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'ไม่พบไฟล์ที่อัปโหลด' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        const employeeMap = new Map((await Employeeonsite.find({}).lean()).map(e => [e.name.trim(), e._id]));
        const siteMap = new Map((await Siteonsite.find({}).lean()).map(s => [s.name.trim(), s._id]));
        const equipmentMap = new Map((await Equipmentonsite.find({}).lean()).map(e => [e.name.trim(), e._id]));

        let successCount = 0;
        let errorCount = 0;
        let errorDetails = [];

        for (const [index, row] of rows.entries()) {
            try {
                // แก้ไขลำดับการอ่านข้อมูลจากแถวใน Excel ให้ถูกต้อง (13 คอลัมน์)
                const [
                    excelDate,
                    employeeNamesStr = '',
                    type = '',
                    siteName = '',
                    refcode = '-',
                    robotName = '-',
                    equipmentNamesStr = '',
                    totalEquipmentCost = 0,
                    shippingCost = 0,
                    totalLaborCost = 0,
                    travelCost = 0,
                    scope = '',
                    details = ''
                ] = row;

                if (!excelDate || !siteName || !employeeNamesStr || !type) {
                    errorDetails.push(`แถวที่ ${index + 2}: ข้อมูลไม่ครบ (วันที่, ชื่อไซต์, พนักงาน, ประเภท)`);
                    errorCount++;
                    continue;
                }

                let onsiteDate;
                if (typeof excelDate === 'number') {
                    onsiteDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
                } else if (typeof excelDate === 'string') {
                    const parts = excelDate.split('/');
                    if (parts.length === 3) {
                        onsiteDate = new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                }
                if (!onsiteDate || isNaN(onsiteDate.getTime())) {
                    errorDetails.push(`แถวที่ ${index + 2}: รูปแบบวันที่ผิดพลาด - "${excelDate}"`);
                    errorCount++;
                    continue;
                }

                const siteId = siteMap.get(siteName.trim());
                if (!siteId) {
                    errorDetails.push(`แถวที่ ${index + 2}: ไม่พบไซต์งานชื่อ - "${siteName}"`);
                    errorCount++;
                    continue;
                }

                const employeeNames = employeeNamesStr.split(',').map(name => name.trim()).filter(Boolean);
                const employeeIds = employeeNames.map(name => employeeMap.get(name)).filter(Boolean);
                if (employeeIds.length !== employeeNames.length) {
                    errorDetails.push(`แถวที่ ${index + 2}: ไม่พบพนักงานบางคนในรายชื่อ - "${employeeNamesStr}"`);
                    errorCount++;
                    continue;
                }

                const equipmentNames = (equipmentNamesStr || '').split(',').map(name => name.trim()).filter(Boolean);
                const equipmentIds = equipmentNames.map(name => equipmentMap.get(name)).filter(Boolean);
                if (equipmentIds.length !== equipmentNames.length) {
                    errorDetails.push(`แถวที่ ${index + 2}: ไม่พบอุปกรณ์บางชิ้นในรายชื่อ - "${equipmentNamesStr}"`);
                    errorCount++;
                    continue;
                }
                
                const numTotalEquipmentCost = parseFloat(totalEquipmentCost) || 0;
                const numShippingCost = parseFloat(shippingCost) || 0;
                const numTotalLaborCost = parseFloat(totalLaborCost) || 0;
                const numTravelCost = parseFloat(travelCost) || 0;
                // คำนวณ grandTotal จากค่าใช้จ่าย 4 ส่วน
                const grandTotal = numTotalEquipmentCost + numShippingCost + numTotalLaborCost + numTravelCost;

                await Onsite.create({
                    onsiteDate,
                    employees: employeeIds,
                    site: siteId,
                    type,
                    Refcode: refcode,
                    scope,
                    robotname: robotName,
                    details,
                    equipment: equipmentIds,
                    Shipping: numShippingCost,
                    travelCost: numTravelCost,
                    totalLaborCost: numTotalLaborCost,
                    totalEquipmentCost: numTotalEquipmentCost,
                    grandTotal, // ใช้ grandTotal ที่คำนวณได้
                    selectedBy: 'Excel Import'
                });
                
                successCount++;
            } catch (rowError) {
                errorDetails.push(`แถวที่ ${index + 2}: เกิดข้อผิดพลาดในการประมวลผล - ${rowError.message}`);
                errorCount++;
            }
        }

        res.status(200).json({
            message: 'ประมวลผลไฟล์สำเร็จ',
            successCount,
            errorCount,
            errors: errorDetails
        });

    } catch (error) {
        console.error('Onsite Import error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดร้ายแรงระหว่างการ Import' });
    }
};
