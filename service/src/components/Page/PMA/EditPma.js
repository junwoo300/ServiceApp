import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './AddPma.css'; // ใช้ CSS เดียวกับ AddPma

const EditPma = () => {
  const [formData, setFormData] = useState({
    nupma: '',
    codepma: '',
    name: '',
    customer: '',
    startdate: '',
    warranty: '',
    enddate: '',
    status: '',
    lease: '',
    document: '',
    sla: '',
    note: '',
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPma = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/pma/${id}`);
        setFormData(response.data);
      } catch (err) {
        console.error(err);
        alert('Error fetching data');
      }
    };

    fetchPma();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API}/pma/${id}`, formData);
      alert('Data updated successfully!');
      navigate('/PmaList'); // กลับไปที่หน้า PmaList หลังจากอัพเดตข้อมูลสำเร็จ
    } catch (err) {
      console.error(err);
      alert('Error updating data');
    }
  };

  return (
    <div className="pma-add-container">
      <h1>Edit PMA Data</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="pma-add-form-group">
          <label>NUPMA</label>
          <input
            type="text"
            name="nupma"
            value={formData.nupma}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>Code PMA</label>
          <input
            type="text"
            name="codepma"
            value={formData.codepma}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>Customer</label>
          <input
            type="text"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startdate"
            value={formData.startdate}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>Warranty</label>
          <input
            type="text"
            name="warranty"
            value={formData.warranty}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>End Date</label>
          <input
            type="date"
            name="enddate"
            value={formData.enddate}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>Status</label>
          <input
            type="text"
            name="status"
            value={formData.status}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>Lease</label>
          <input
            type="text"
            name="lease"
            value={formData.lease}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>Document</label>
          <input
            type="text"
            name="document"
            value={formData.document}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>SLA</label>
          <input
            type="text"
            name="sla"
            value={formData.sla}
            onChange={handleChange}
          />
        </div>
        <div className="pma-add-form-group">
          <label>Note</label>
          <input
            type="text"
            name="note"
            value={formData.note}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="pma-add-btn">Update PMA</button>
      </form>
    </div>
  );
};

export default EditPma;
