const mongoose = require('mongoose');
const { Schema } = mongoose;

// --- 1. Import RobotData Model ที่มีอยู่แล้ว ---
const RobotData = require('./RobotData'); // <-- ดึง Model ที่สร้างจากไฟล์ RobotData.js มาใช้

// 1. Employeeonsite Schema
const EmployeeonsiteSchema = new Schema({
    name: { type: String, required: true, unique: true },
    rate: { type: Number, required: true, default: 0 }
});

// 2. Equipmentonsite Schema
const EquipmentonsiteSchema = new Schema({
    name: { type: String, required: true, unique: true },
    cost: { type: Number, required: true, default: 0 },
    type: { type: String, required: true, trim: true }
});

// 3. Siteonsite Schema (ยังคงอ้างอิงไปที่ 'RobotData' เหมือนเดิม)
const SiteonsiteSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true, trim: true },
    travelCost: { type: Number, required: true, default: 0 },
    robot: {
        type: Schema.Types.ObjectId,
        ref: 'RobotData', 
        required: false
    },
    // ✅ เปลี่ยนชื่อฟิลด์เป็น Refcode
    Refcode: {
        type: String,
        default: '-', // กำหนดค่าเริ่มต้นเป็น '-'
        trim: true
    }
});


// 4. Onsite Schema (main record) - ไม่มีการเปลี่ยนแปลง
const OnsiteSchema = new Schema({
    selectedBy: { type: String, required: true },
    onsiteDate: { type: Date, required: true },
    employees: [{ type: Schema.Types.ObjectId, ref: 'Employeeonsite' }],
    site: { type: Schema.Types.ObjectId, ref: 'Siteonsite' },
    type: { type: String, required: true },
    
    // ✅ เพิ่มฟิลด์ Refcode เข้ามาใน Schema นี้โดยตรง
    Refcode: { 
        type: String, 
        default: '-' 
    },

    robotname: { type: String, default: '-' },
    equipment: [{ type: Schema.Types.ObjectId, ref: 'Equipmentonsite' }],
    Shipping: { type: Number, default: 0 },
    travelCost: { type: Number, default: 0 },
    scope: { type: String, default: '' },
    details: { type: String, required: true },
    totalLaborCost: { type: Number, required: true, default: 0 },
    totalEquipmentCost: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 }
}, { timestamps: true });



// --- Compile Model ที่เหลือ ---
const Onsite = mongoose.model('Onsite', OnsiteSchema);
const Siteonsite = mongoose.model('Siteonsite', SiteonsiteSchema);
const Employeeonsite = mongoose.model('Employeeonsite', EmployeeonsiteSchema);
const Equipmentonsite = mongoose.model('Equipmentonsite', EquipmentonsiteSchema);

// --- 3. ส่งออก RobotData ที่ import เข้ามาพร้อมกับ Model อื่นๆ ---
module.exports = {
    Onsite,
    Siteonsite,
    Employeeonsite,
    Equipmentonsite,
    RobotData // <-- ส่งออก RobotData ที่ดึงมาจากอีกไฟล์
};