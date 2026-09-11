const CaseSupport = require('../Models/CaseSupportModels');

const getNextCaseNo = async () => {
  const prefix = `CS-${new Date().toISOString().slice(0, 7).replace('-', '')}-`;
  const latestCase = await CaseSupport.findOne({ caseNo: new RegExp(`^${prefix}`) })
    .sort({ caseNo: -1 })
    .select('caseNo')
    .lean();
  const latestNumber = latestCase ? Number(latestCase.caseNo.slice(-4)) : 0;
  return `${prefix}${String(latestNumber + 1).padStart(4, '0')}`;
};

const getCaseSupports = async (req, res) => {
  try {
    const cases = await CaseSupport.find().sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    console.error('Error fetching case support records:', error);
    res.status(500).json({ error: 'ไม่สามารถโหลดข้อมูล Case Support ได้' });
  }
};

const createCaseSupport = async (req, res) => {
  try {
    const {
      subject,
      description,
      openedDate,
      completedDate,
      site,
      type,
      category,
      priority,
      assignee,
    } = req.body;

    if (!subject || !description || !site || !type || !category) {
      return res.status(400).json({
        error: 'กรุณากรอกหัวข้อ รายละเอียด ไซต์งาน ประเภท และหมวดหมู่',
      });
    }

    const newCase = await CaseSupport.create({
      caseNo: await getNextCaseNo(),
      openedDate: openedDate || new Date(),
      completedDate: completedDate || null,
      subject,
      description,
      site,
      type,
      category,
      priority,
      assignee,
    });

    res.status(201).json(newCase);
  } catch (error) {
    console.error('Error creating case support record:', error);
    res.status(500).json({ error: 'ไม่สามารถบันทึก Case Support ได้' });
  }
};

const updateCaseSupport = async (req, res) => {
  try {
    const {
      subject,
      description,
      openedDate,
      completedDate,
      site,
      type,
      category,
      priority,
      assignee,
    } = req.body;

    if (!subject || !description || !site || !type || !category) {
      return res.status(400).json({
        error: 'กรุณากรอกหัวข้อ รายละเอียด ไซต์งาน ประเภท และหมวดหมู่',
      });
    }

    const updatedCase = await CaseSupport.findByIdAndUpdate(
      req.params.id,
      {
        subject,
        description,
        openedDate,
        completedDate: completedDate || null,
        site,
        type,
        category,
        priority,
        assignee,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ error: 'ไม่พบเคสที่ต้องการแก้ไข' });
    }

    res.json(updatedCase);
  } catch (error) {
    console.error('Error updating case support record:', error);
    res.status(500).json({ error: 'ไม่สามารถแก้ไข Case Support ได้' });
  }
};

const updateCaseSupportStatus = async (req, res) => {
  try {
    const { status, resolution, completedDate } = req.body;
    const updatedCase = await CaseSupport.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution,
        completedDate: status === 'เสร็จสิ้น' ? (completedDate || new Date()) : completedDate || null,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ error: 'ไม่พบเคสที่ต้องการแก้ไข' });
    }

    res.json(updatedCase);
  } catch (error) {
    console.error('Error updating case support status:', error);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะเคสได้' });
  }
};

const deleteCaseSupport = async (req, res) => {
  try {
    const deletedCase = await CaseSupport.findByIdAndDelete(req.params.id);

    if (!deletedCase) {
      return res.status(404).json({ error: 'ไม่พบเคสที่ต้องการลบ' });
    }

    res.json({ message: 'ลบเคสเรียบร้อยแล้ว', id: deletedCase._id });
  } catch (error) {
    console.error('Error deleting case support record:', error);
    res.status(500).json({ error: 'ไม่สามารถลบ Case Support ได้' });
  }
};

module.exports = {
  getCaseSupports,
  createCaseSupport,
  updateCaseSupport,
  updateCaseSupportStatus,
  deleteCaseSupport,
};
