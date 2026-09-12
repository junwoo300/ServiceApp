import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AddPmMaintenance.css';

const AddPmMaintenance = () => {
  const { id } = useParams(); // รับ ID ของ PMA จาก URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    entries: [{ date: '', count: '' }] // เปลี่ยน count เป็น string
  });

  const handleChange = (event) => {
    const { name, value, dataset } = event.target;
    if (name === 'date') {
      const newEntries = [...formData.entries];
      newEntries[dataset.index].date = value;
      setFormData({ ...formData, entries: newEntries });
    } else if (name === 'count') {
      const newEntries = [...formData.entries];
      newEntries[dataset.index].count = value; // เก็บ count เป็น string
      setFormData({ ...formData, entries: newEntries });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddEntry = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, { date: '', count: '' }] // เปลี่ยน count เป็น string
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API}/pm-maintenance`, { ...formData, pmaId: id });
      console.log('Response:', response); // ตรวจสอบผลลัพธ์
      navigate(`/pma-info/${id}`); // กลับไปที่หน้า PMA หลังจากเพิ่มข้อมูล
    } catch (err) {
      console.error('Error adding PM Maintenance:', err);
      alert('Error adding PM Maintenance: ' + err.message); // แสดงข้อผิดพลาด
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Add PM Maintenance</h1>
      <form className="maintenance-form" onSubmit={handleSubmit}>
        <div className="maintenance-add-form-group">
          <label>Project Name:</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="maintenance-add-form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        {formData.entries.map((entry, index) => (
          <div key={index} className="entry-section">
            <div className="maintenance-add-form-group">
              <label>รายชื่อผู้เข้าดำเนินการ:</label>
              <input
                type="text" // เปลี่ยนเป็น text
                name="count"
                data-index={index}
                value={entry.count}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="maintenance-add-form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                data-index={index}
                value={entry.date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        ))}

        <div className="form-buttons">
          <button type="submit" className="btn-submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPmMaintenance;
