import { apiFetch } from '../../../apiClient';
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Robotwarehouse.css";
import { useNavigate } from "react-router-dom";



const Robotwarehouse = () => {

  const [editRepairData, setEditRepairData] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("vin"); // ค่าเริ่มต้นค้นหา VIN

  const editRepair = (repair) => {
    setEditRepairData(repair); // เก็บข้อมูลที่จะแก้ไข
    setShowEditForm(true); // เปิดฟอร์มแก้ไข
  };



  const handleUpdateRepair = async () => {
    if (!editRepairData) return;

    try {
      const response = await apiFetch(`${process.env.REACT_APP_API}/repairs/${editRepairData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRepairData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        // 🔄 รีเฟรชข้อมูลเฉพาะใน Popup
        setRepairData((prevData) =>
          prevData.map((repair) =>
            repair._id === editRepairData._id ? { ...repair, ...editRepairData } : repair
          )
        );

        setShowEditForm(false); // ปิด Popup
      } else {
        alert("Failed to update repair record: " + data.message);
      }
    } catch (error) {
      console.error("Error updating repair record:", error);
      alert("An error occurred while updating the repair record.");
    }
  };





  const deleteRepair = async (id) => {
    if (window.confirm("Are you sure you want to delete this repair record?")) {
      try {
        const response = await apiFetch(`${process.env.REACT_APP_API}/repairs/${id}`, { method: "DELETE" });

        const data = await response.json();
        if (response.ok) {
          alert(data.message);

          // 🔄 รีเฟรชข้อมูลเฉพาะใน Popup
          setRepairData((prevData) => prevData.filter((repair) => repair._id !== id));
        } else {
          alert("Failed to delete repair record: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting repair:", error);
        alert("An error occurred while deleting the repair record.");
      }
    }
  };








  const navigate = useNavigate();

  const [robots, setRobots] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVIN, setCurrentVIN] = useState("");
  const [robotData, setRobotData] = useState({
    type: "",
    model: "",
    lot: "",
    vin: "",
    location: "",
    note: "",
  });
  const [showInfo, setShowInfo] = useState(false);
  const [repairData, setRepairData] = useState([]);

  const [showRepairForm, setShowRepairForm] = useState(false);
  const [repairRecord, setRepairRecord] = useState({
    vin: "",
    description: "",
    status: "",
    repairDate: "",
  });

  const openRepairForm = (vin) => {

    setRepairRecord({ vin, description: "", status: "", repairDate: "" });
    setShowRepairForm(true);
  };



  const closeRepairForm = () => {
    setShowRepairForm(false);
  };

  const addRepairRecord = async () => {
    // ตรวจสอบว่าแต่ละฟิลด์มีค่าหรือไม่
    if (!repairRecord.vin || !repairRecord.description || !repairRecord.status || !repairRecord.repairDate) {
      alert("All fields are required");
      return; // หยุดการทำงานถ้าฟิลด์ไหนว่าง
    }

    try {
      await axios.post(`${process.env.REACT_APP_API}/repairs`, repairRecord);
      closeRepairForm();
      openInfo(repairRecord.vin); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error("Error adding repair record:", error);
    }
  };



  useEffect(() => {
    fetchRobots();
  }, []);

  const fetchRobots = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/robots`);
      setRobots(response.data);
    } catch (error) {
      console.error("Error fetching robots:", error);
    }
  };

  // กรองข้อมูลตามค่าที่ค้นหา
  const filteredRobots = robots.filter((robot) =>
    robot[searchField]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    setRobotData({ ...robotData, [e.target.name]: e.target.value });
  };

  const addRobot = async () => {
    try {
      const existingRobot = robots.find((robot) => robot.vin === robotData.vin);
      if (existingRobot) {
        alert("VIN already exists!");
        return;
      }
      await axios.post(`${process.env.REACT_APP_API}/robots`, robotData);
      fetchRobots();
      closeForm();
    } catch (error) {
      console.error("Error adding robot:", error);
    }
  };

  const editRobot = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API}/robots/${currentVIN}`, robotData);
      fetchRobots();
      closeForm();
    } catch (error) {
      console.error("Error updating robot:", error);
    }
  };

  const deleteRobot = async (vin) => {
    if (window.confirm("Are you sure you want to delete this robot?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API}/robots/${vin}`);
        fetchRobots();
      } catch (error) {
        console.error("Error deleting robot:", error);
      }
    }
  };

  const openForm = (robot = null) => {
    if (robot) {
      setIsEditing(true);
      setCurrentVIN(robot.vin);
      setRobotData(robot);
    } else {
      setIsEditing(false);
      setRobotData({ type: "", model: "", lot: "", vin: "", location: "", note: "" });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setRobotData({ type: "", model: "", lot: "", vin: "", location: "", note: "" });
  };

  const openInfo = async (vin) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/repairs/${vin}`);
      setRepairData(response.data.length > 0 ? response.data : []);
    } catch (error) {
      console.error("Error fetching repair info:", error);
      setRepairData([]); // กรณีเกิด error ก็ยังให้เปิด popup ได้
    }
    setShowInfo(true); // เปิด popup แม้ไม่มีข้อมูล
  };

  const closeInfo = () => {
    setShowInfo(false);
  };

  return (

    

    <div className="robot-container">
      <button className="robot-btn-back" onClick={() => navigate(-1)}>Back</button>
      <h1 className="robot-title">Robot Warehouse</h1>

      <div className="search-container">
        <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
          <option value="vin">Search by VIN</option>
          <option value="location">Search by Location</option>
          <option value="lot">Search by Lot</option>
        </select>

        <input
          type="text"
          placeholder={`Search by ${searchField}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="robot-header">
      
        

        <button className="robot-btn-add" onClick={() => openForm()}>Add Robot</button>
      </div>
      <div className="robot-table-container">
        <table className="robot-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Type</th>
              <th>Robot Model</th>
              <th>Lot</th>
              <th>VIN</th>
              <th>Location</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRobots.map((robot, index) => (
              <tr key={robot.vin}>
                <td>{index + 1}</td>
                <td>{robot.type}</td>
                <td>{robot.model}</td>
                <td>{robot.lot}</td>
                <td>{robot.vin}</td>
                <td>{robot.location}</td>
                <td>{robot.note}</td>
                <td>
                  <button className="robot-btn-edit" onClick={() => openForm(robot)}>Edit</button>
                  <button className="robot-btn-delete" onClick={() => deleteRobot(robot.vin)}>Delete</button>
                  <button className="robot-btn-info" onClick={() => openInfo(robot.vin)}>Info</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="robot-popup">
          <div className="robot-popup-content">
            <h2>{isEditing ? "Edit Robot" : "Add Robot"}</h2>
            <input type="text" name="type" placeholder="Type" value={robotData.type} onChange={handleInputChange} />
            <input type="text" name="model" placeholder="Model" value={robotData.model} onChange={handleInputChange} />
            <input type="text" name="lot" placeholder="Lot" value={robotData.lot} onChange={handleInputChange} />
            <input type="text" name="vin" placeholder="VIN" value={robotData.vin} onChange={handleInputChange} disabled={isEditing} />
            <input type="text" name="location" placeholder="Location" value={robotData.location} onChange={handleInputChange} />
            <input type="text" name="note" placeholder="Note" value={robotData.note} onChange={handleInputChange} />
            <div className="robot-popup-buttons">
              <button onClick={isEditing ? editRobot : addRobot}>{isEditing ? "Update" : "Submit"}</button>
              <button onClick={closeForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}



      {showInfo && (
        <div className="robot-info-popup">
          <div className="robot-info-content">
            <div className="robot-info-header">
              <h2>Repair Information</h2>
              <button className="add-repair-btn" onClick={() => openRepairForm(repairData[0]?.vin)}>
                + Add Repair Record
              </button>
            </div>
            {repairData.length > 0 ? (
              <div className="robot-repair-table-container">
                <table className="robot-repair-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>VIN</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Repair Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairData.map((repair, index) => (
                      <tr key={repair._id}>
                        <td>{index + 1}</td>
                        <td>{repair.vin}</td>
                        <td>{repair.description}</td>
                        <td>{repair.status}</td>
                        <td>{new Date(repair.repairDate).toLocaleDateString("en-GB")}</td>
                        <td>
                          <button onClick={() => editRepair(repair)}>Edit</button>
                          <button onClick={() => deleteRepair(repair._id)}>Delete</button> {/* ส่ง _id ไป */}
                        </td>
                      </tr>
                    ))}
                  </tbody>


                </table>
              </div>
            ) : (
              <p className="no-data-text">No repair records found.</p>
            )}
            <div className="robot-info-buttons">
              <button onClick={closeInfo}>Close</button>
            </div>
          </div>
        </div>
      )}


      {showRepairForm && (
        <div className="repair-popup">
          <div className="repair-popup-content">
            <h2>Add Repair Record</h2>
            {/* เพิ่ม onChange ให้กับ input ของ VIN */}
            <input
              type="text"
              placeholder="VIN"
              value={repairRecord.vin}
              onChange={(e) => setRepairRecord({ ...repairRecord, vin: e.target.value })}
            />
            <input
              type="text"
              placeholder="Description"
              value={repairRecord.description}
              onChange={(e) => setRepairRecord({ ...repairRecord, description: e.target.value })}
            />
            <div className="repair-form-group">
              <label>Status</label>
              <select
                value={repairRecord.status}
                onChange={(e) => setRepairRecord({ ...repairRecord, status: e.target.value })}
                className="repair-status-select"
              >
                <option value=""> ----</option>
                <option value="กำลังดำเนินการ">🔧 กำลังดำเนินการ</option>
                <option value="ซ่อมแล้ว">✅ ซ่อมแล้ว</option>
              </select>
            </div>
            <input
              type="date"
              value={repairRecord.repairDate}
              onChange={(e) => setRepairRecord({ ...repairRecord, repairDate: e.target.value })}
            />
            <div className="repair-popup-buttons">
              <button onClick={addRepairRecord}>Submit</button>
              <button onClick={closeRepairForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showEditForm && (
        <>
          <div className="robot-edit-repair-overlay" onClick={() => setShowEditForm(false)}></div>
          <div className="robot-edit-repair-popup">
            <div className="robot-edit-repair-content">
              <h2>Edit Repair</h2>
              <label>Description</label>
              <input
                type="text"
                value={editRepairData?.description || ""}
                onChange={(e) => setEditRepairData({ ...editRepairData, description: e.target.value })}
              />
              <label>Status</label>
              <select
                value={editRepairData?.status || ""}
                onChange={(e) => setEditRepairData({ ...editRepairData, status: e.target.value })}
              >
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="ซ่อมแล้ว">ซ่อมแล้ว</option>
              </select>

              <div className="robot-edit-repair-buttons">
                <button onClick={handleUpdateRepair}>Save</button> {/* ✅ อัปเดต + รีเฟรช */}
                <button onClick={() => setShowEditForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}







    </div>
  );
};

export default Robotwarehouse;
