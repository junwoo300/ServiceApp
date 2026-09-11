// 📦 ดึงโมเดล Billforpm ที่เราสร้างไว้
const Billforpm = require('../Models/BillforpmModels'); // ดึง Model เข้ามา

exports.addBill = async (req, res) => {
  try {
    const newBill = new Billforpm(req.body);       // รับข้อมูลจาก body แล้วสร้างเอกสารใหม่
    const saved = await newBill.save();            // บันทึกลง MongoDB
    res.status(201).json(saved);                   // ส่ง response กลับ client
  } catch (err) {
    res.status(400).json({ message: 'Error creating bill', error: err });
  }
};

// 📄 ฟังก์ชันเพื่อดึงข้อมูลทั้งหมดจาก MongoDB
exports.getAllBill = async (req, res) => {
  try {
    // 🔍 ดึงเอกสารทั้งหมดจาก collection Billforpm
    const Bills = await Billforpm.find();

    // ✅ ส่งข้อมูลทั้งหมดกลับไปยัง client พร้อม status 200 (OK)
    res.status(200).json(Bills);
  } catch (error) {
    // ❌ หากเกิดข้อผิดพลาด เช่น database ล่ม ส่ง error กลับไปพร้อม status 500 (Internal Server Error)
    res.status(500).json({ message: "Failed to fetch Bills", error: error.message });
  }
};


exports.toggleStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const bill = await Billforpm.findById(id);
    if (!bill) {
      return res.status(404).json({ message: "ไม่พบบิลนี้" });
    }

    // วนสถานะ: Pending -> wait -> Done -> Pending
    switch (bill.status) {
      case "Pending":
        bill.status = "wait";
        break;
      case "wait":
        bill.status = "Done";
        break;
      case "Done":
        bill.status = "Pending";
        break;
      default:
        bill.status = "Pending"; // fallback กรณีสถานะไม่ถูกต้อง
    }

    await bill.save();
    res.status(200).json({ message: "อัปเดตสถานะสำเร็จ", status: bill.status });
  } catch (error) {
    console.error("Toggle Status Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

  

  exports.deleteBill = async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Billforpm.findByIdAndDelete(id);
  
      if (!deleted) {
        return res.status(404).json({ message: "ไม่พบบิลที่จะลบ" });
      }
  
      res.status(200).json({ message: "ลบสำเร็จ", deletedId: id });
    } catch (error) {
      res.status(500).json({ message: "ลบไม่สำเร็จ", error: error.message });
    }
  };
