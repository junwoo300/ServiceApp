import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './PmMaintenanceList.css';

const PmMaintenanceList = () => {
  const { id } = useParams();
  const [pmMaintenances, setPmMaintenances] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPmMaintenances();
  }, [id]);

  const fetchPmMaintenances = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/pm-maintenances/${id}`);
      console.log("Fetched PM Maintenances:", response.data);
      setPmMaintenances(response.data);
    } catch (err) {
      console.error('Error fetching PM Maintenance data:', err);
    }
  };

  const handleDelete = async (maintenanceId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this PM Maintenance?');
    
    if (confirmDelete) {
      try {
        await axios.delete(`${process.env.REACT_APP_API}/pm-maintenance/${maintenanceId}`);
        setPmMaintenances(pmMaintenances.filter(maintenance => maintenance._id !== maintenanceId));
      } catch (err) {
        console.error('Error deleting PM Maintenance:', err);
      }
    }
  };

  const handleEdit = (maintenanceId) => {
    navigate(`/edit-pm-maintenance/${maintenanceId}`);
  };

  return (
    <div className="container">
      <Link to="/PmaList" className="btn-home">Back to PMAs</Link>
      <h1>PM Maintenance List</h1>
      <Link to={`/add-pm-maintenance/${id}`} className="btn-add">Add New Maintenance</Link>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Project Name</th>
            <th>Description</th>
            <th>รายชื่อผู้เข้า</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pmMaintenances.length > 0 ? (
            pmMaintenances.map((maintenance, index) => (
              maintenance.entries.map((entry, entryIndex) => (
                <tr key={entryIndex}>
                  <td>{index + 1}</td>
                  <td>{maintenance.projectName}</td>
                  {/* ปรับ description ให้เป็นลิงก์ "คลิก" ไปยัง URL เว็บนอก */}
                  <td>
                    <a href={maintenance.description.startsWith('http') ? maintenance.description : `http://${maintenance.description}`} target="_blank" rel="noopener noreferrer">
                      คลิก
                    </a>
                  </td>
                  <td>{entry.count}</td>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>
                    
                    <button onClick={() => handleDelete(maintenance._id)}>ลบข้อมูล</button>
                  </td>
                </tr>
              ))
            ))
          ) : (
            <tr>
              <td colSpan="6">No maintenance data available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PmMaintenanceList;
