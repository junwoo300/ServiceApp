import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import './CaseSupport.css';

const toLocalDateTimeInput = (value = new Date()) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const initialForm = {
  openedDate: toLocalDateTimeInput(),
  completedDate: '',
  subject: '',
  description: '',
  site: '',
  type: 'บริการทั่วไป',
  category: 'แจ้งซ่อม',
  priority: 'ปกติ',
  assignee: '',
  assignees: [],
};

const formatAssignees = (item) => (item.assignees?.length ? item.assignees : (item.assignee ? [item.assignee] : [])).join(', ');
const statusClass = (status) => ({
  'เปิดเคส': 'open',
  'กำลังดำเนินการ': 'in-progress',
  'รอลูกค้า': 'waiting',
  'เสร็จสิ้น': 'done',
  'ยกเลิก': 'cancelled',
}[status] || 'open');

const statuses = ['เปิดเคส', 'กำลังดำเนินการ', 'รอลูกค้า', 'เสร็จสิ้น', 'ยกเลิก'];

const CaseSupport = () => {
  const [cases, setCases] = useState([]);
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [editingCase, setEditingCase] = useState(null);
  const importInput = useRef(null);
  const [options, setOptions] = useState({ subjects: [], types: [] });
  const [optionsReady, setOptionsReady] = useState(false);

  const fetchOptions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/case-support-options`);
      setOptions(response.data);
      setOptionsReady(true);
      return true;
    } catch (failure) {
      setError('ไม่สามารถโหลดหัวข้อและประเภทได้ กรุณารีเฟรชหน้าเว็บเพื่อลองใหม่');
      return false;
    }
  };
  const openNewCase = () => {
    setEditingCase(null);
    setForm({ ...initialForm, openedDate: toLocalDateTimeInput(),
      type: options.types.some(item => item.name === initialForm.type) ? initialForm.type : options.types[0]?.name || '' });
    setIsFormOpen(true);
  };

  const fetchCases = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/case-support`);
      setCases(response.data);
    } catch (fetchError) {
      console.error('Error fetching case support records:', fetchError);
      setError('ไม่สามารถโหลดรายการเคสได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/onsite/sites`);
      setSites(response.data);
    } catch (fetchError) {
      console.error('Error fetching siteonsites:', fetchError);
      setError('ไม่สามารถโหลดรายการไซต์งานได้');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/onsite/employees`);
      setEmployees(response.data);
    } catch (fetchError) {
      console.error('Error fetching employeeonsites:', fetchError);
      setError('ไม่สามารถโหลดรายชื่อผู้รับผิดชอบได้');
    }
  };

  useEffect(() => {
    fetchCases();
    fetchSites();
    fetchEmployees();
    fetchOptions();
  }, []);

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();
    return cases.filter((item) => {
      const matchesSearch =
        !query ||
        [item.caseNo, item.subject, item.site, item.assignee]
          .join(' ')
          .toLowerCase()
          .includes(query);
      return matchesSearch && (statusFilter === 'ทั้งหมด' || item.status === statusFilter);
    });
  }, [cases, search, statusFilter]);

  const summary = statuses.reduce(
    (result, status) => ({ ...result, [status]: cases.filter((item) => item.status === status).length }),
    {}
  );

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const toggleAssignee = (name) => {
    const assignees = form.assignees.includes(name)
      ? form.assignees.filter((assignee) => assignee !== name)
      : [...form.assignees, name];
    setForm({ ...form, assignees, assignee: assignees.join(', ') });
  };

  const exportCases = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/case-support/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url; link.download = 'case-support.xlsx'; link.click();
      URL.revokeObjectURL(url);
    } catch (failure) { setError('ไม่สามารถ Export ข้อมูล Case Support ได้'); }
  };

  const importCases = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = new FormData(); data.append('file', file);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API}/case-support/import`, data);
      await fetchCases();
      setError(`Import สำเร็จ ${response.data.imported} รายการ`);
    } catch (failure) { setError(failure.response?.data?.error || 'ไม่สามารถ Import ไฟล์ Excel ได้'); }
    finally { event.target.value = ''; }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const request = editingCase
        ? axios.put(`${process.env.REACT_APP_API}/case-support/${editingCase._id}`, form)
        : axios.post(`${process.env.REACT_APP_API}/case-support`, form);
      await request;
      setForm(initialForm);
      setIsFormOpen(false);
      setEditingCase(null);
      await fetchCases();
    } catch (saveError) {
      console.error('Error creating case support record:', saveError);
      setError(saveError.response?.data?.error || 'ไม่สามารถบันทึกเคสได้');
    } finally {
      setSaving(false);
    }
  };

  const openEditForm = (item) => {
    setSelectedCase(null);
    setEditingCase(item);
    setForm({
      ...item,
      openedDate: item.openedDate ? toLocalDateTimeInput(item.openedDate) : '',
      completedDate: item.completedDate ? toLocalDateTimeInput(item.completedDate) : '',
      assignees: item.assignees?.length ? item.assignees : (item.assignee ? [item.assignee] : []),
    });
    setIsFormOpen(true);
  };

  const deleteCase = async (item) => {
    if (!window.confirm(`ต้องการลบเคส ${item.caseNo} ใช่หรือไม่?`)) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API}/case-support/${item._id}`);
      setSelectedCase(null);
      await fetchCases();
    } catch (deleteError) {
      console.error('Error deleting case support record:', deleteError);
      setError(deleteError.response?.data?.error || 'ไม่สามารถลบเคสได้');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.patch(`${process.env.REACT_APP_API}/case-support/${id}/status`, { status });
      setCases((currentCases) => currentCases.map((item) => (item._id === id ? response.data : item)));
      setSelectedCase((currentCase) => (currentCase?._id === id ? response.data : currentCase));
    } catch (updateError) {
      console.error('Error updating case support status:', updateError);
      setError('ไม่สามารถอัปเดตสถานะเคสได้');
    }
  };

  return (
    <div className="case-support-page">
      <a href="/CaseSupport" className="case-support-back-link">← กลับเมนู Case Support</a>
      <div className="case-support-heading">
        <div>
          <span className="case-support-eyebrow">Service Operations / ERP</span>
          <h2>ระบบ Case Support</h2>
          <p>บันทึก ติดตาม และปิดเคสงานบริการในที่เดียว</p>
        </div>
        <div className="case-support-heading-actions">
          <button className="case-support-primary-button" disabled={!optionsReady} onClick={openNewCase}>
            + เปิดเคสใหม่
          </button>
          <button type="button" onClick={exportCases}>Export Excel</button>
          <button type="button" onClick={() => importInput.current?.click()}>Import Excel</button>
          <input ref={importInput} type="file" accept=".xlsx,.xls" onChange={importCases} hidden />
        </div>
      </div>

      <div className="case-support-summary">
        <div><span>เคสทั้งหมด</span><strong>{cases.length}</strong></div>
        <div className="case-summary-open"><span>เปิดเคส</span><strong>{summary['เปิดเคส'] || 0}</strong></div>
        <div className="case-summary-in-progress"><span>กำลังดำเนินการ</span><strong>{summary['กำลังดำเนินการ'] || 0}</strong></div>
        <div className="case-summary-done"><span>เสร็จสิ้น</span><strong>{summary['เสร็จสิ้น'] || 0}</strong></div>
      </div>

      <div className="case-support-toolbar">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาเลขที่เคส หัวข้อ ลูกค้า หรือไซต์งาน" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option>ทั้งหมด</option>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>

      {error && <div className="case-support-error">{error}</div>}
      {loading ? <p>กำลังโหลดข้อมูล...</p> : (
        <div className="case-support-table-wrap">
          <table className="case-support-table">
            <thead><tr><th>เลขที่เคส</th><th>หัวข้อ</th><th>ไซต์งาน</th><th>ประเภท</th><th>ความสำคัญ</th><th>ผู้รับผิดชอบ</th><th>วันเปิด</th><th>วันเสร็จ</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
            <tbody>
              {filteredCases.map((item) => (
                <tr key={item._id} className="case-support-row" onClick={() => setSelectedCase(item)}>
                  <td className="case-number">{item.caseNo}</td>
                  <td><strong>{item.subject}</strong></td>
                  <td>{item.site}</td>
                  <td>{item.type || '-'}</td>
                  <td><span className={`case-priority priority-${item.priority}`}>{item.priority}</span></td>
                  <td>{formatAssignees(item) || '-'}</td>
                  <td>{new Date(item.openedDate || item.createdAt).toLocaleString('th-TH')}</td>
                  <td>{item.completedDate ? new Date(item.completedDate).toLocaleString('th-TH') : '-'}</td>
                  <td>
                    <div className="case-status-control">
                      <span className={`case-status-dot case-status-dot-${statusClass(item.status)}`} aria-hidden="true" />
                      <select aria-label={`สถานะเคส ${item.caseNo}`} className={`case-status status-${statusClass(item.status)}`} value={item.status} onClick={(event) => event.stopPropagation()} onChange={(event) => updateStatus(item._id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                    </div>
                  </td>
                  <td className="case-support-actions" onClick={(event) => event.stopPropagation()}>
                    <button type="button" className="case-support-edit-button" onClick={() => openEditForm(item)}>แก้ไข</button>
                    <button type="button" className="case-support-delete-button" onClick={() => deleteCase(item)}>ลบ</button>
                  </td>
                </tr>
              ))}
              {!filteredCases.length && <tr><td colSpan="10" className="case-support-empty">ยังไม่มีรายการเคส</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {selectedCase && (
        <div className="case-support-modal" role="dialog" aria-modal="true" aria-labelledby="case-detail-title">
          <div className="case-support-detail">
            <div className="case-support-form-header">
              <div>
                <span className="case-support-eyebrow">Case Support</span>
                <h3 id="case-detail-title">{selectedCase.caseNo}</h3>
              </div>
              <button type="button" aria-label="ปิดรายละเอียดเคส" onClick={() => setSelectedCase(null)}>×</button>
            </div>
            <div className="case-support-detail-status">
              <span>สถานะ</span>
              <strong className={`case-status status-${statusClass(selectedCase.status)}`}>{selectedCase.status}</strong>
            </div>
            <div className="case-support-detail-grid">
              <div><span>หัวข้อเคส</span><strong>{selectedCase.subject}</strong></div>
              <div><span>ไซต์งาน</span><strong>{selectedCase.site}</strong></div>
              <div><span>ประเภท</span><strong>{selectedCase.type || '-'}</strong></div>
              <div><span>หมวดหมู่</span><strong>{selectedCase.category || '-'}</strong></div>
              <div><span>ความสำคัญ</span><strong>{selectedCase.priority || '-'}</strong></div>
              <div><span>ผู้รับผิดชอบ</span><strong>{formatAssignees(selectedCase) || '-'}</strong></div>
              <div><span>วันเวลาเปิดเคส</span><strong>{new Date(selectedCase.openedDate || selectedCase.createdAt).toLocaleString('th-TH')}</strong></div>
              <div><span>วันดำเนินการเสร็จ</span><strong>{selectedCase.completedDate ? new Date(selectedCase.completedDate).toLocaleDateString('th-TH') : '-'}</strong></div>
              <div className="case-support-detail-description"><span>รายละเอียดปัญหา</span><p>{selectedCase.description || '-'}</p></div>
              {selectedCase.resolution && <div className="case-support-detail-description"><span>วิธีแก้ไข</span><p>{selectedCase.resolution}</p></div>}
            </div>
            <div className="case-support-form-actions">
              <button type="button" className="case-support-edit-button" onClick={() => openEditForm(selectedCase)}>แก้ไข</button>
              <button type="button" className="case-support-delete-button" onClick={() => deleteCase(selectedCase)}>ลบ</button>
              <button type="button" onClick={() => setSelectedCase(null)}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="case-support-modal" role="dialog" aria-modal="true">
          <form className="case-support-form" onSubmit={handleSubmit}>
            <div className="case-support-form-header"><h3>{editingCase ? 'แก้ไขเคส' : 'เปิดเคสใหม่'}</h3><button type="button" onClick={() => { setIsFormOpen(false); setEditingCase(null); }}>×</button></div>
            <div className="case-support-form-grid">
              <label>หัวข้อเคส
                <select name="subject" value={form.subject} onChange={handleChange} required>
                  <option value="">เลือกหัวข้อเคส</option>
                  {form.subject && !options.subjects.some(item => item.name === form.subject) && <option value={form.subject}>{form.subject} (ค่าเดิม)</option>}
                  {options.subjects.map(item => <option key={item._id} value={item.name}>{item.name}</option>)}
                </select>
              </label>
              <label>ไซต์งาน
                <input
                  name="site"
                  list="case-support-sites"
                  value={form.site}
                  onChange={handleChange}
                  placeholder="พิมพ์ค้นหาไซต์งาน..."
                  required
                />
                <datalist id="case-support-sites">
                  {sites.map((site) => (
                    <option key={site._id} value={site.name}>
                      {site.type ? `ประเภท: ${site.type}` : ''}
                    </option>
                  ))}
                </datalist>
              </label>
              <label>ประเภท
                <select name="type" value={form.type} onChange={handleChange} required>
                  <option value="">เลือกประเภท</option>
                  {form.type && !options.types.some(item => item.name === form.type) && <option value={form.type}>{form.type} (ค่าเดิม)</option>}
                  {options.types.map(item => <option key={item._id} value={item.name}>{item.name}</option>)}
                </select>
              </label>
              <label>หมวดหมู่<select name="category" value={form.category} onChange={handleChange}><option>แจ้งซ่อม</option><option>ติดตั้ง</option><option>สอบถามการใช้งาน</option><option>ร้องเรียน</option><option>อื่นๆ</option></select></label>
              <label>ความสำคัญ<select name="priority" value={form.priority} onChange={handleChange}><option>ต่ำ</option><option>ปกติ</option><option>สูง</option><option>เร่งด่วน</option></select></label>
              <label>ผู้รับผิดชอบ (เลือกได้หลายคน)
                <div className="case-support-assignee-list">
                  {employees.map((employee) => (
                    <label key={employee._id} className="case-support-assignee-option">
                      <input type="checkbox" checked={form.assignees.includes(employee.name)} onChange={() => toggleAssignee(employee.name)} />
                      <span>{employee.name}</span>
                    </label>
                  ))}
                  {!employees.length && <span className="case-support-assignee-empty">ยังไม่มีรายชื่อผู้รับผิดชอบ</span>}
                </div>
              </label>
              <label>วันเวลาเปิดเคส<input type="datetime-local" name="openedDate" value={form.openedDate} onChange={handleChange} required /></label>
              <label>วันเวลาดำเนินการเสร็จ<input type="datetime-local" name="completedDate" value={form.completedDate} onChange={handleChange} /></label>
              <label className="case-support-full-width">รายละเอียดปัญหา<textarea name="description" value={form.description} onChange={handleChange} rows="4" required /></label>
            </div>
            <div className="case-support-form-actions"><button type="button" onClick={() => { setIsFormOpen(false); setEditingCase(null); }}>ยกเลิก</button><button className="case-support-primary-button" disabled={saving}>{saving ? 'กำลังบันทึก...' : editingCase ? 'บันทึกการแก้ไข' : 'บันทึกเคส'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CaseSupport;
