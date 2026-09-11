import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Employee.css';

const Employee = () => {
    const [employees, setEmployees] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false); // สถานะเปิด/ปิด Modal
    const [currentEmployee, setCurrentEmployee] = useState(null); // เก็บข้อมูลพนักงานที่กำลังแก้ไข
    const [editName, setEditName] = useState(''); // สถานะสำหรับ input ชื่อ
    const [editRate, setEditRate] = useState(''); // สถานะสำหรับ input อัตรา

    // ดึงข้อมูลพนักงานทั้งหมด
    const fetchEmployees = () => {
        axios.get(`${process.env.REACT_APP_API}/onsite/employees`)
            .then(res => setEmployees(res.data))
            .catch(err => console.error('Failed to fetch employees:', err));
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // ฟังก์ชันสำหรับลบพนักงาน
    const handleDelete = (id) => {
        if (window.confirm('คุณแน่ใจว่าต้องการลบพนักงานคนนี้หรือไม่?')) {
            axios.delete(`${process.env.REACT_APP_API}/onsite/employees/${id}`)
                .then(() => {
                    fetchEmployees(); // โหลดข้อมูลใหม่หลังลบ
                    alert('ลบพนักงานสำเร็จ');
                })
                .catch(err => {
                    console.error('Error deleting employee:', err);
                    alert('เกิดข้อผิดพลาดในการลบพนักงาน');
                });
        }
    };

    // ฟังก์ชันเมื่อคลิกปุ่ม "แก้ไข"
    const handleEditClick = (employee) => {
        setCurrentEmployee(employee); // ตั้งค่าพนักงานที่เลือก
        setEditName(employee.name); // ตั้งค่าชื่อในฟอร์ม
        setEditRate(employee.rate); // ตั้งค่าอัตราในฟอร์ม
        setShowEditModal(true); // เปิด Modal
    };

    // ฟังก์ชันเมื่อส่งฟอร์มแก้ไข
    const handleUpdate = (e) => {
        e.preventDefault(); // ป้องกันการ reload หน้าเว็บ
        if (!currentEmployee) return;

        const updatedData = {
            name: editName,
            rate: parseFloat(editRate) // แปลงเป็นตัวเลข
        };

        axios.put(`${process.env.REACT_APP_API}/onsite/employees/${currentEmployee._id}`, updatedData)
            .then(() => {
                fetchEmployees(); // โหลดข้อมูลใหม่หลังอัปเดต
                setShowEditModal(false); // ปิด Modal
                alert('อัปเดตข้อมูลพนักงานสำเร็จ');
            })
            .catch(err => {
                console.error('Error updating employee:', err);
                // จัดการ Error กรณีชื่อซ้ำ (จาก handleError ใน Backend)
                if (err.response && err.response.status === 409) {
                    alert('ไม่สามารถแก้ไขได้: ชื่อพนักงานนี้มีอยู่แล้วในระบบ');
                } else {
                    alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูลพนักงาน');
                }
            });
    };

    return (
        <div>
            <button className="back-btn" onClick={() => window.history.back()}>
                🔙 กลับ
            </button>
            <div className="employee-dashboard-container">
                <div className="employee-table-block">
                    <h2 className="employee-title">พนักงานทั้งหมด</h2>
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th className="employee-th">ชื่อ</th>
                                <th className="employee-th">อัตรา (บาท)</th>
                                <th className="employee-th">การดำเนินการ</th> {/* เปลี่ยนเป็น "การดำเนินการ" */}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp._id} className="employee-row"> {/* ใช้ emp._id เป็น key */}
                                    <td className="employee-td">{emp.name}</td>
                                    <td className="employee-td">{emp.rate}</td>
                                    <td className="employee-td action-buttons"> {/* เพิ่ม class สำหรับจัดปุ่ม */}
                                        <button
                                            className="employee-edit-btn" // เพิ่ม class สำหรับปุ่มแก้ไข
                                            onClick={() => handleEditClick(emp)}
                                        >
                                            แก้ไข
                                        </button>
                                        <button
                                            className="employee-delete-btn"
                                            onClick={() => handleDelete(emp._id)}
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>แก้ไขข้อมูลพนักงาน</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label htmlFor="editName">ชื่อพนักงาน:</label>
                                <input
                                    type="text"
                                    id="editName"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editRate">อัตรา (บาท):</label>
                                <input
                                    type="number"
                                    id="editRate"
                                    value={editRate}
                                    onChange={(e) => setEditRate(e.target.value)}
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="submit-btn">บันทึก</button>
                                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>ยกเลิก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employee;