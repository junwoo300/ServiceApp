import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Siteonsite.css';

const SiteDashboard = () => {
    const [siteData, setSiteData] = useState({});
    
    // State สำหรับแก้ไข
    const [isEditing, setIsEditing] = useState(false);
    const [currentSite, setCurrentSite] = useState(null);

    // State สำหรับการสร้างใหม่
    const [isCreating, setIsCreating] = useState(false);
    // ✅ เพิ่ม Refcode ใน State เริ่มต้น
    const [newSite, setNewSite] = useState({ name: '', type: '', travelCost: 0, Refcode: '' });

    const fetchSites = () => {
        axios.get(`${process.env.REACT_APP_API}/onsite/sites`)
            .then(res => {
                const grouped = {};
                res.data.forEach(item => {
                    if (!grouped[item.type]) {
                        grouped[item.type] = [];
                    }
                    grouped[item.type].push(item);
                });
                setSiteData(grouped);
            })
            .catch(err => console.error('Failed to fetch sites:', err));
    };

    useEffect(() => {
        fetchSites();
    }, []);

    // --- ฟังก์ชันสำหรับจัดการการลบ ---
    const handleDelete = (id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบไซต์งานนี้?')) {
            axios.delete(`${process.env.REACT_APP_API}/onsite/sites/${id}`)
                .then(() => fetchSites())
                .catch(err => {
                    console.error('Error deleting site:', err);
                    alert('เกิดข้อผิดพลาดในการลบไซต์');
                });
        }
    };

    // --- ฟังก์ชันสำหรับจัดการการแก้ไข ---
    const handleEditClick = (site) => {
        setCurrentSite({ ...site });
        setIsEditing(true);
    };
    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentSite(null);
    };
    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentSite({ ...currentSite, [name]: value });
    };
    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        axios.put(`${process.env.REACT_APP_API}/onsite/sites/${currentSite._id}`, currentSite)
            .then(() => {
                setIsEditing(false);
                fetchSites();
                alert('อัปเดตข้อมูลไซต์งานสำเร็จ!');
            })
            .catch(err => {
                console.error('Error updating site:', err);
                alert('อัปเดตข้อมูลไม่สำเร็จ');
            });
    };

    // --- ฟังก์ชันสำหรับจัดการการสร้างใหม่ ---
    const handleOpenCreateModal = () => {
        setIsCreating(true);
    };
    const handleCancelCreate = () => {
        setIsCreating(false);
        setNewSite({ name: '', type: '', travelCost: 0, Refcode: '' }); // Reset form
    };
    const handleNewSiteInputChange = (e) => {
        const { name, value } = e.target;
        setNewSite({ ...newSite, [name]: value });
    };
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        axios.post(`${process.env.REACT_APP_API}/onsite/sites`, newSite)
            .then(() => {
                setIsCreating(false);
                setNewSite({ name: '', type: '', travelCost: 0, Refcode: '' });
                fetchSites();
                alert('เพิ่มไซต์ใหม่สำเร็จ!');
            })
            .catch(err => {
                console.error('Error creating site:', err);
                alert('เพิ่มไซต์ใหม่ไม่สำเร็จ');
            });
    };


    return (
        <div>
            <div className="header-bar">
                <button className="onsite-site-back-btn" onClick={() => window.history.back()}>🔙 กลับ</button>
                <h2 className='site-main-title'>รายการไซต์งาน Onsite</h2>
                <button className="site-create-new-btn" onClick={handleOpenCreateModal}>
                    ✚ เพิ่มไซต์ใหม่
                </button>
            </div>

            <div className="site-dashboard-container">
                {Object.entries(siteData).map(([type, items]) => (
                    <div key={type} className="site-table-block">
                        <h3 className="site-type-title">{type}</h3>
                        <table className="site-table">
                            <thead>
                                <tr>
                                    {/* ✅ เพิ่มหัวตาราง Refcode */}
                                    <th className="site-th">ชื่อไซต์</th>
                                    <th className="site-th">Ref Code</th>
                                    <th className="site-th">ค่าเดินทาง (บาท)</th>
                                    <th className="site-th">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item._id} className="site-row">
                                        {/* ✅ เพิ่มคอลัมน์แสดง Refcode */}
                                        <td className="site-td">{item.name}</td>
                                        <td className="site-td">{item.Refcode || '-'}</td>
                                        <td className="site-td">{(item.travelCost || 0).toLocaleString()}</td>
                                        <td className="site-td action-cell">
                                            <button className="site-edit-btn" onClick={() => handleEditClick(item)}>แก้ไข</button>
                                            <button className="site-delete-btn" onClick={() => handleDelete(item._id)}>ลบ</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* --- Modal สำหรับแก้ไข --- */}
            {isEditing && currentSite && (
                <div className="onsite-site-modal-overlay" onClick={handleCancelEdit}>
                    <div className="onsite-site-modal-content" onClick={e => e.stopPropagation()}>
                        <h2>แก้ไขข้อมูลไซต์</h2>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="onsite-site-form-group"><label>ชื่อไซต์</label><input type="text" name="name" className="form-input" value={currentSite.name} onChange={handleEditInputChange} required /></div>
                            <div className="onsite-site-form-group"><label>ประเภท</label><input type="text" name="type" className="form-input" value={currentSite.type} onChange={handleEditInputChange} required /></div>
                            {/* ✅ เพิ่มช่องแก้ไข Refcode */}
                            <div className="onsite-site-form-group"><label>Ref Code</label><input type="text" name="Refcode" className="form-input" value={currentSite.Refcode} onChange={handleEditInputChange} /></div>
                            <div className="onsite-site-form-group"><label>ค่าเดินทาง (บาท)</label><input type="number" name="travelCost" className="form-input" value={currentSite.travelCost} onChange={handleEditInputChange} required min="0"/></div>
                            <div className="onsite-site-modal-actions"><button type="submit" className="btn-save">บันทึกการเปลี่ยนแปลง</button><button type="button" className="btn-cancel" onClick={handleCancelEdit}>ยกเลิก</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Modal สำหรับสร้างใหม่ --- */}
            {isCreating && (
                 <div className="onsite-site-modal-overlay" onClick={handleCancelCreate}>
                    <div className="onsite-site-modal-content" onClick={e => e.stopPropagation()}>
                        <h2>เพิ่มไซต์งานใหม่</h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="onsite-site-form-group"><label>ชื่อไซต์</label><input type="text" name="name" className="form-input" value={newSite.name} onChange={handleNewSiteInputChange} required /></div>
                            <div className="onsite-site-form-group"><label>ประเภท</label><input type="text" name="type" className="form-input" value={newSite.type} onChange={handleNewSiteInputChange} required /></div>
                            {/* ✅ เพิ่มช่องสร้าง Refcode */}
                            <div className="onsite-site-form-group"><label>Ref Code</label><input type="text" name="Refcode" className="form-input" value={newSite.Refcode} onChange={handleNewSiteInputChange} /></div>
                            <div className="onsite-site-form-group"><label>ค่าเดินทาง (บาท)</label><input type="number" name="travelCost" className="form-input" value={newSite.travelCost} onChange={handleNewSiteInputChange} required min="0"/></div>
                            <div className="onsite-site-modal-actions"><button type="submit" className="btn-save">สร้างไซต์</button><button type="button" className="btn-cancel" onClick={handleCancelCreate}>ยกเลิก</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SiteDashboard;
