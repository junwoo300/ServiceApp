// EquipmentDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EquipmentDashboard.css';

const EquipmentDashboard = () => {
  const [equipmentData, setEquipmentData] = useState({});

  const fetchEquipment = () => {
    axios.get(`${process.env.REACT_APP_API}/onsite/equipment`)
      .then(res => {
        const grouped = {};
        res.data.forEach(item => {
          if (!grouped[item.type]) grouped[item.type] = [];
          grouped[item.type].push(item);
        });
        setEquipmentData(grouped);
      })
      .catch(err => {
        console.error('Failed to fetch equipment:', err);
      });
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบอุปกรณ์นี้?')) {
      axios.delete(`${process.env.REACT_APP_API}/onsite/equipment/${id}`)
        .then(() => fetchEquipment())
        .catch(err => {
          console.error('Error deleting equipment:', err);
        });
    }
  };

  return (
    <div>
        <button className="equipment-back-btn" onClick={() => window.history.back()}>🔙 กลับ</button>
        <h2 className='equipment-title2' > รายการอุปกรณ์ Onsite    </h2>
    <div className="equipment-dashboard-container">
      {Object.entries(equipmentData).map(([type, items]) => (
        <div key={type} className="equipment-table-block">
          <h2 className="equipment-title">{type}</h2>
          <table className="equipment-table">
            <thead>
              <tr>
                <th className="equipment-th">Name</th>
                <th className="equipment-th">Cost</th>
                <th className="equipment-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="equipment-row">
                  <td className="equipment-td">{item.name}</td>
                  <td className="equipment-td">{item.cost}</td>
                  <td className="equipment-td">
                    <button
                      className="equipment-delete-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
    </div>
  );
};

export default EquipmentDashboard;
