import React, { useState } from 'react';
import axios from 'axios';
import './AddPma.css';
import { useNavigate } from 'react-router-dom';

const AddPma = () => {
  const [formData, setFormData] = useState({
    nupma: '',
    codepma: '',
    name: '',
    startdate: '',
    warranty: '',
    enddate: '',
    status: '',
    lease: '',
    document: '',
    sla: '',
    note: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // เพิ่มข้อมูล PMA ใหม่
      const response = await axios.post(`${process.env.REACT_APP_API}/pma`, formData);
      alert('Data added successfully!');
      
      // ตรวจสอบว่าเราได้รับ _id กลับมาหรือไม่
      const newPmaId = response.data._id;
      if (!newPmaId) {
        throw new Error('PMA ID not returned');
      }

      // ข้อมูลที่ต้องการเพิ่มใน entryData
      const entryData = {
        name: formData.name,
        date: new Date().toISOString(),
        sequence: 1, // ค่าเริ่มต้นของลำดับ
        file: '' // ปล่อยเป็นค่าว่างหากไม่มีไฟล์
      };

      try {
        // เพิ่มข้อมูลเข้าใน PMA ที่เพิ่งเพิ่ม
        await axios.post(`${process.env.REACT_APP_API}/pma/${newPmaId}/entries`, entryData);
        alert('Entry added successfully!');
      } catch (entryError) {
        console.error('Error adding entry data:', entryError.response ? entryError.response.data : entryError.message);
        alert('Error adding entry data');
      }

      // กลับไปที่หน้า PmaList หลังจากเพิ่มข้อมูลสำเร็จ
      navigate('/PmaList');
    } catch (err) {
      console.error('Error adding PMA:', err.response ? err.response.data : err.message);
      alert('Error adding PMA data');
    }
  };

  return (
    <div className="container">
      <button className="btn-back" onClick={() => navigate('/PmaList')}>Back to List</button>
      <h1>Add New PMA Data</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>NUPMA</label>
          <input
            type="text"
            name="nupma"
            value={formData.nupma}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Code PMA</label>
          <input
            type="text"
            name="codepma"
            value={formData.codepma}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startdate"
            value={formData.startdate}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Warranty</label>
          <input
            type="text"
            name="warranty"
            value={formData.warranty}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="enddate"
            value={formData.enddate}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <input
            type="text"
            name="status"
            value={formData.status}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Lease</label>
          <input
            type="text"
            name="lease"
            value={formData.lease}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Document</label>
          <input
            type="text"
            name="document"
            value={formData.document}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>SLA</label>
          <input
            type="text"
            name="sla"
            value={formData.sla}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Note</label>
          <input
            type="text"
            name="note"
            value={formData.note}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn">Add PMA</button>
      </form>
    </div>
  );
};

export default AddPma;
