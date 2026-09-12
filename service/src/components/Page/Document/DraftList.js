import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './DraftList.css';
import Select from 'react-select';

const DraftList = () => {
  const [drafts, setDrafts] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [groupedDrafts, setGroupedDrafts] = useState({});
  const [siteOptions, setSiteOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [formData, setFormData] = useState({
    siteName: '',
    recipientEmails: '',
    ccEmails: '',
    subjectTemplate: '',
    messageTemplate: ''
  });

  const fetchDrafts = useCallback(async () => {
    try {


      const res = await axios.get(`${process.env.REACT_APP_API}/allmail`);
      const data = res.data;
      setDrafts(data);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    }
  }, []);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  useEffect(() => {
    const grouped = groupBySite(drafts);
    setGroupedDrafts(grouped);
    setSiteOptions(Object.keys(grouped));
    setSelectedSite(current => grouped[current] ? current : Object.keys(grouped)[0] || '');
  }, [drafts]);

  const groupBySite = (data) => {
    return data.reduce((acc, draft) => {
      const key = draft.siteName || 'ไม่ระบุไซต์';
      acc[key] = acc[key] ? [...acc[key], draft] : [draft];
      return acc;
    }, {});
  };

  const addNonBreakingSpaces = (text) => {
    return text.split('\n').map(line => {
      const leadingSpacesCount = line.match(/^ */)[0].length;
      const nbsp = '\u00A0'.repeat(leadingSpacesCount);
      return nbsp + line.trimStart();
    }).join('\r\n');
  };

  const handleDraftClick = (draft) => {
    const to = encodeURIComponent(draft.recipientEmails.join(','));
    const cc = encodeURIComponent(draft.ccEmails.join(','));
    const subject = encodeURIComponent(draft.subjectTemplate);
    const bodyText = addNonBreakingSpaces(draft.messageTemplate);
    const body = encodeURIComponent(bodyText);
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${to}&cc=${cc}&subject=${subject}&body=${body}`;
    window.open(outlookUrl, '_blank');
  };

  const handleDeleteDraft = async (id) => {
    if (!window.confirm('คุณต้องการลบร่างเมลนี้หรือไม่?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API}/deletemail/${id}`);
      fetchDrafts();
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const handleAddClick = () => {
    handleCloseModal();
    setNotice('');
    setShowModal(true);
  };

  const handleEditClick = draft => {
    setEditingId(draft._id);
    setFormData({ siteName: draft.siteName || '', recipientEmails: (draft.recipientEmails || []).join(', '),
      ccEmails: (draft.ccEmails || []).join(', '), subjectTemplate: draft.subjectTemplate || '',
      messageTemplate: draft.messageTemplate || '' });
    setFormError(''); setNotice(''); setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormError('');
    setFormData({
      siteName: '',
      recipientEmails: '',
      ccEmails: '',
      subjectTemplate: '',
      messageTemplate: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true); setFormError('');
    try {
      const payload = {
        ...formData,
        siteName: formData.siteName.trim(),
        recipientEmails: formData.recipientEmails.split(',').map(email => email.trim()).filter(Boolean),
        ccEmails: formData.ccEmails.split(',').map(email => email.trim()).filter(Boolean)
      };
      if (!payload.siteName || !payload.subjectTemplate.trim() || !payload.messageTemplate.trim() || !payload.recipientEmails.length) {
        setFormError('กรุณากรอกไซต์ ผู้รับ หัวข้อ และเนื้อหาให้ครบ'); return;
      }
      const response = editingId
        ? await axios.put(`${process.env.REACT_APP_API}/updatemail/${editingId}`, payload)
        : await axios.post(`${process.env.REACT_APP_API}/createmail`, payload);
      if (!response.data?._id) { setFormError('ไม่พบร่างเมลที่จะบันทึก กรุณาโหลดรายการใหม่'); return; }
      setDrafts(current => editingId ? current.map(draft => draft._id === editingId ? response.data : draft) : [...current, response.data]);
      setSelectedSite(response.data.siteName || 'ไม่ระบุไซต์');
      setNotice(editingId ? 'บันทึกการแก้ไขร่างเมลแล้ว' : 'เพิ่มร่างเมลแล้ว');
      handleCloseModal();
    } catch (error) {
      setFormError('บันทึกไม่สำเร็จ กรุณาลองใหม่ ข้อมูลที่กรอกยังอยู่ครบ');
    } finally { setSaving(false); }
  };

  return (
    <div className="mail-container">
      <div className="mail-header">
        <button className="mail-back-btn" onClick={() => window.history.back()}>🔙 กลับ</button>
        <h2>ระบบร่างเมล</h2>

        <button className="mail-add-btn" onClick={handleAddClick}>+ เพิ่มข้อมูล</button>
      </div>

      {notice && <p role="status">{notice}</p>}

      <div className="mail-filter">
        <label htmlFor="siteSelect">เลือกไซต์:</label>
        <Select
          inputId="siteSelect"
          options={siteOptions.map(site => ({ value: site, label: site }))}
          value={{ value: selectedSite, label: selectedSite }}
          onChange={(selectedOption) => setSelectedSite(selectedOption.value)}
          placeholder="ค้นหาไซต์..."
          styles={{
            control: (base) => ({ ...base, fontSize: '16px', padding: '2px' }),
            menu: (base) => ({ ...base, fontSize: '16px' }),
          }}
        />
      </div>


      {selectedSite && groupedDrafts[selectedSite] ? (
        <div className="mail-draft-list">
          {groupedDrafts[selectedSite].map((draft) => (
            <div key={draft._id} className="mail-draft-card">
              <div className="mail-draft-header">
                <div className="mail-draft-subject">{draft.subjectTemplate}</div>
                <div className="mail-draft-actions">
                  <button className="mail-edit-btn" onClick={() => handleEditClick(draft)}>แก้ไข</button>
                  <button className="mail-draft-btn" onClick={() => handleDraftClick(draft)}>✉️ ร่างเมล</button>
                  <button className="mail-delete-btn" onClick={() => handleDeleteDraft(draft._id)}>🗑️ ลบ</button>
                </div>
              </div>
              <div className="mail-draft-meta">
                <div><strong>To:</strong> {draft.recipientEmails.join(', ')}</div>
                {draft.ccEmails.length > 0 && (
                  <div><strong>CC:</strong> {draft.ccEmails.join(', ')}</div>
                )}
              </div>
              <div className="mail-draft-message">
                {draft.messageTemplate}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mail-no-draft">ไม่พบร่างเมลในไซต์นี้</p>
      )}

      {showModal && (
        <div className="mail-modal-overlay">
          <div className="mail-modal" role="dialog" aria-modal="true" aria-labelledby="mail-editor-title">
            <h3 id="mail-editor-title">{editingId ? 'แก้ไขร่างเมล' : 'เพิ่มร่างเมลใหม่'}</h3>
            {formError && <p role="alert">{formError}</p>}
            <form onSubmit={handleSubmit} className="mail-form">
              <label htmlFor="mail-siteName">Site Name:</label>
              <input type="text" id="mail-siteName" disabled={saving} autoFocus value={formData.siteName} onChange={(e) => setFormData({ ...formData, siteName: e.target.value })} required />

              <label htmlFor="mail-recipientEmails">Recipient Emails (คั่นด้วย ,):</label>
              <input type="text" id="mail-recipientEmails" disabled={saving} value={formData.recipientEmails} onChange={(e) => setFormData({ ...formData, recipientEmails: e.target.value })} required />

              <label htmlFor="mail-ccEmails">CC Emails (คั่นด้วย ,):</label>
              <input type="text" id="mail-ccEmails" disabled={saving} value={formData.ccEmails} onChange={(e) => setFormData({ ...formData, ccEmails: e.target.value })} />

              <label htmlFor="mail-subjectTemplate">Subject Template:</label>
              <input type="text" id="mail-subjectTemplate" disabled={saving} value={formData.subjectTemplate} onChange={(e) => setFormData({ ...formData, subjectTemplate: e.target.value })} required />

              <label htmlFor="mail-messageTemplate">Message Template:</label>
              <textarea rows="4" id="mail-messageTemplate" disabled={saving} value={formData.messageTemplate} onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })} required />

              <div className="mail-modal-buttons">
                <button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก…' : 'บันทึก'}</button>
                <button type="button" disabled={saving} onClick={handleCloseModal}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftList;
