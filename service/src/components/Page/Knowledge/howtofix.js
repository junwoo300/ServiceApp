import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams,useLocation, useNavigate } from 'react-router-dom';
import './howtofix.css';

const Howtofix = () => {
        const location = useLocation();
        const casename = location.state?.casename || 'Unknown Project';

    const { casefixId } = useParams(); // ดึง casefixId จาก URL
    const [howtofixData, setHowtofixData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    const navigate = useNavigate();

    const fetchHowtofix = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/howtofix-by-case/${casefixId}`);
            if (response.status === 200 && Array.isArray(response.data)) {
                setHowtofixData(response.data);
            } else {
                setError('ไม่พบข้อมูล Howtofix สำหรับ Casefix นี้');
            }
        } catch (error) {
            console.error('Error fetching howtofix:', error);
            setError('ไม่สามารถโหลดข้อมูล Howtofix ได้');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddHowtofix = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/add-howtofix`, {
                ...formData,
                casefix: casefixId
            });
    
            if (response.status >= 200 && response.status < 300) {
                setFormData({ title: '', description: '' });
                setShowForm(false);
                window.location.reload(); // รีเฟรชหน้าใหม่
            } else {
                alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
            }
        } catch (error) {
            console.error('Error adding howtofix:', error);
            alert('ไม่สามารถเพิ่มข้อมูลได้');
        }
    };
    

    useEffect(() => {
        fetchHowtofix();
    }, [casefixId]);

    return (
        <div className="howtofix-container">
    <h2 className="howtofix-title">วิธีการแก้ไขสำหรับเคส {casename}</h2>

    {/* กลุ่มปุ่มย้อนกลับ + เพิ่ม */}
    <div className="howtofix-button-group">
        <button className="howtofix-back-button" onClick={() => navigate(-1)}>ย้อนกลับ</button>
        <button className="howtofix-add-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'ยกเลิก' : 'เพิ่มข้อมูล'}
        </button>
    </div>
    
    {showForm && (
    <div className="howtofix-modal-overlay" onClick={() => setShowForm(false)}>
        <div className="howtofix-modal" onClick={(e) => e.stopPropagation()}>
            <h3>เพิ่มวิธีการแก้ไข</h3>
            <form className="howtofix-form" onSubmit={handleAddHowtofix}>
                <input
                    type="text"
                    name="title"
                    placeholder="ชื่อหัวข้อการแก้ไข"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="รายละเอียดเพิ่มเติม"
                    value={formData.description}
                    onChange={handleInputChange}
                ></textarea>
                <div className="howtofix-form-buttons">
                    <button type="submit">บันทึก</button>
                    <button type="button" onClick={() => setShowForm(false)}>ยกเลิก</button>
                </div>
            </form>
        </div>
    </div>
)}


    {/* ส่วนแสดงข้อมูล */}
    {loading ? (
        <p>กำลังโหลด...</p>
    ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
    ) : howtofixData.length > 0 ? (
        <div className="howtofix-card-grid">
            {howtofixData.map((item) => (
                <div className="howtofix-card" key={item._id}>
                    <h4 className="howtofix-card-title">{item.title}</h4>
                    <pre className="howtofix-card-desc">{item.description}</pre>

                  {/*  <p>Casefix ID: {item.casefix}</p> */}
                </div>
            ))}
        </div>
    ) : (
        <p>ไม่มีข้อมูล Howtofix สำหรับ Casefix นี้</p>
    )}
</div>

    );
};

export default Howtofix;
