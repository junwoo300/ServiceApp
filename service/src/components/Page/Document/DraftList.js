import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DraftList.css';
import Select from 'react-select';

const DraftList = () => {
  const [drafts, setDrafts] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [groupedDrafts, setGroupedDrafts] = useState({});
  const [siteOptions, setSiteOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    recipientEmails: '',
    ccEmails: '',
    subjectTemplate: '',
    messageTemplate: ''
  });

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {


      const res = await axios.get(`${process.env.REACT_APP_API}/allmail`);
      const data = res.data;
      setDrafts(data);
      const grouped = groupBySite(data);
      setGroupedDrafts(grouped);
      setSiteOptions(Object.keys(grouped));
      if (Object.keys(grouped).length > 0) {
        setSelectedSite(Object.keys(grouped)[0]);
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
    }
  };

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
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
    try {
      await axios.post(`${process.env.REACT_APP_API}/createmail`, {
        ...formData,
        recipientEmails: formData.recipientEmails.split(',').map((email) => email.trim()),
        ccEmails: formData.ccEmails ? formData.ccEmails.split(',').map((email) => email.trim()) : []
      });
      handleCloseModal();
      fetchDrafts();
    } catch (error) {
      console.error('Error creating draft:', error);
    }
  };

  return (
    <div className="mail-container">
      <div className="mail-header">
        <button className="mail-back-btn" onClick={() => window.history.back()}>🔙 กลับ</button>
        <h2>ระบบร่างเมล</h2>

        <button className="mail-add-btn" onClick={handleAddClick}>+ เพิ่มข้อมูล</button>
      </div>

      <div className="mail-filter">
        <label htmlFor="siteSelect">เลือกไซต์:</label>
        <Select
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
          <div className="mail-modal">
            <h3>เพิ่มร่างเมลใหม่</h3>
            <form onSubmit={handleSubmit} className="mail-form">
              <label>Site Name:</label>
              <input type="text" value={formData.siteName} onChange={(e) => setFormData({ ...formData, siteName: e.target.value })} required />

              <label>Recipient Emails (คั่นด้วย ,):</label>
              <input type="text" value={formData.recipientEmails} onChange={(e) => setFormData({ ...formData, recipientEmails: e.target.value })} required />

              <label>CC Emails (คั่นด้วย ,):</label>
              <input type="text" value={formData.ccEmails} onChange={(e) => setFormData({ ...formData, ccEmails: e.target.value })} />

              <label>Subject Template:</label>
              <input type="text" value={formData.subjectTemplate} onChange={(e) => setFormData({ ...formData, subjectTemplate: e.target.value })} required />

              <label>Message Template:</label>
              <textarea rows="4" value={formData.messageTemplate} onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })} required />

              <div className="mail-modal-buttons">
                <button type="submit">บันทึก</button>
                <button type="button" onClick={handleCloseModal}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftList;
