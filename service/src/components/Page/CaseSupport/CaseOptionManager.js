import React, { useState } from 'react';
import axios from 'axios';

export default function CaseOptionManager({ kind, options, onUpdate, onClose, embedded = false }) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const title = kind === 'subjects' ? 'จัดการหัวข้อ' : 'จัดการประเภท';

  const change = async (method, id, value) => {
    setBusy(true);
    setError('');
    try {
      const response = await axios({ method,
        url: `${process.env.REACT_APP_API}/case-support-options/${kind}${id ? `/${id}` : ''}`,
        data: { name: value },
      });
      onUpdate(response.data);
      setName('');
      setEditingId(null);
    } catch (failure) {
      setError(failure.response?.data?.error || 'ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่');
    } finally { setBusy(false); }
  };

  return (
    <div className={embedded ? 'case-support-options-page' : 'case-support-modal'} role={embedded ? 'region' : 'dialog'} aria-modal={embedded ? undefined : true} aria-labelledby="case-options-title">
      <div className="case-support-form">
        <div className="case-support-form-header">
          <h3 id="case-options-title">{title}</h3>
          {!embedded && <button type="button" aria-label="ปิดหน้าจัดการ" disabled={busy} onClick={onClose}>×</button>}
        </div>
        <p>การแก้ไขหรือลบตัวเลือกจะไม่เปลี่ยนข้อความที่บันทึกไว้ในเคสเดิม</p>
        {error && <div className="case-support-error" role="alert">{error}</div>}
        <form onSubmit={event => { event.preventDefault(); change(editingId ? 'put' : 'post', editingId, name.trim()); }}>
          <label>ชื่อตัวเลือก<input value={name} maxLength={200} required disabled={busy} onChange={event => setName(event.target.value)} /></label>
          <div className="case-support-form-actions">
            {editingId && <button type="button" disabled={busy} onClick={() => { setEditingId(null); setName(''); }}>ยกเลิกแก้ไข</button>}
            <button className="case-support-primary-button" disabled={busy || !name.trim()}>{busy ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มตัวเลือก'}</button>
          </div>
        </form>
        <ul className="case-support-options-list">
          {options[kind].map(item => <li key={item._id}>
            <span>{item.name}</span>
            <div className="case-support-actions">
              <button className="case-support-edit-button" disabled={busy} onClick={() => { setEditingId(item._id); setName(item.name); }}>แก้ไข</button>
              <button className="case-support-delete-button" disabled={busy} onClick={() => {
                if (window.confirm(`ต้องการลบตัวเลือก “${item.name}” ใช่หรือไม่? เคสเดิมจะยังคงข้อมูลเดิม`)) change('delete', item._id);
              }}>ลบ</button>
            </div>
          </li>)}
        </ul>
        {!options[kind].length && <p>ยังไม่มีตัวเลือก กรุณาเพิ่มรายการ</p>}
      </div>
    </div>
  );
}
