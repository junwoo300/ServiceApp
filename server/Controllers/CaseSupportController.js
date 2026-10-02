const CaseSupport = require('../Models/CaseSupportModels');
const xlsx = require('xlsx');

const normalizeAssignees = (assignees, assignee = '') => {
  const values = Array.isArray(assignees) ? assignees : String(assignees || assignee).split(/[;,]/);
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
};
const assigneeText = (assignees, assignee) => normalizeAssignees(assignees, assignee).join(', ');

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
      assignees,
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
      assignee: assigneeText(assignees, assignee),
      assignees: normalizeAssignees(assignees, assignee),
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
      assignees,
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
        assignee: assigneeText(assignees, assignee),
        assignees: normalizeAssignees(assignees, assignee),
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

const exportCaseSupports = async (req, res) => {
  try {
    const cases = await CaseSupport.find().sort({ createdAt: -1 }).lean();
    const rows = cases.map(item => ({
      'Case No': item.caseNo,
      'Opened At': item.openedDate,
      'Completed At': item.completedDate || '',
      Subject: item.subject,
      Description: item.description,
      Site: item.site,
      Type: item.type,
      Category: item.category,
      Priority: item.priority,
      Status: item.status,
      Assignees: assigneeText(item.assignees, item.assignee),
      'Due Date': item.dueDate || '',
      Resolution: item.resolution || '',
    }));
    const sheet = xlsx.utils.json_to_sheet(rows.length ? rows : [{
      'Case No': '', 'Opened At': '', 'Completed At': '', Subject: '', Description: '', Site: '', Type: '', Category: '', Priority: '', Status: '', Assignees: '', 'Due Date': '', Resolution: '',
    }]);
    sheet['!cols'] = [14, 20, 20, 32, 48, 24, 18, 18, 14, 20, 30, 16, 48].map(wch => ({ wch }));
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, sheet, 'Case Support');
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer', cellDates: true });
    res.setHeader('Content-Disposition', 'attachment; filename="case-support.xlsx"');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(buffer);
  } catch (error) {
    console.error('Error exporting case support records:', error);
    res.status(500).json({ error: 'ไม่สามารถ Export ข้อมูล Case Support ได้' });
  }
};

const importCaseSupports = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'กรุณาเลือกไฟล์ Excel' });
  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '', raw: false });
    if (!rows.length) return res.status(400).json({ error: 'ไม่พบข้อมูลในไฟล์ Excel' });
    const documents = [];
    const firstGeneratedCaseNo = await getNextCaseNo();
    const generatedPrefix = firstGeneratedCaseNo.slice(0, -4);
    let generatedNumber = Number(firstGeneratedCaseNo.slice(-4));
    for (const [index, row] of rows.entries()) {
      const subject = String(row.Subject || row['หัวข้อเคส'] || '').trim();
      const description = String(row.Description || row['รายละเอียดปัญหา'] || '').trim();
      const site = String(row.Site || row['ไซต์งาน'] || '').trim();
      const type = String(row.Type || row['ประเภท'] || '').trim();
      const category = String(row.Category || row['หมวดหมู่'] || '').trim();
      if (!subject || !description || !site || !type || !category) {
        return res.status(400).json({ error: `แถวที่ ${index + 2} ต้องมี Subject, Description, Site, Type และ Category` });
      }
      const assignees = normalizeAssignees(row.Assignees || row['ผู้รับผิดชอบ']);
      documents.push({
        caseNo: String(row['Case No'] || '').trim() || `${generatedPrefix}${String(generatedNumber++).padStart(4, '0')}`,
        openedDate: row['Opened At'] || row['วันเวลาเปิดเคส'] || new Date(),
        completedDate: row['Completed At'] || row['วันเวลาปิดเคส'] || null,
        subject, description, site, type, category,
        priority: String(row.Priority || row['ความสำคัญ'] || 'ปกติ').trim(),
        status: String(row.Status || row['สถานะ'] || 'เปิดเคส').trim(),
        assignees, assignee: assigneeText(assignees),
        dueDate: row['Due Date'] || null,
        resolution: String(row.Resolution || row['วิธีแก้ไข'] || '').trim(),
      });
    }
    await CaseSupport.insertMany(documents, { ordered: true });
    res.status(201).json({ imported: documents.length });
  } catch (error) {
    console.error('Error importing case support records:', error);
    res.status(400).json({ error: error.code === 11000 ? 'พบ Case No ซ้ำในไฟล์หรือระบบ' : 'ไม่สามารถ Import ข้อมูล Case Support ได้' });
  }
};

module.exports = {
  getCaseSupports,
  createCaseSupport,
  updateCaseSupport,
  updateCaseSupportStatus,
  deleteCaseSupport,
  exportCaseSupports,
  importCaseSupports,
};
