import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './casefix.css';

const Casefix = () => {
    const location = useLocation();
    const projectName = location.state?.projectName || 'Unknown Project';
    const { projectId } = useParams();
    const [casefixData, setCasefixData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [newCase, setNewCase] = useState({ casename: '', casedescription: '' });
    const navigate = useNavigate();

    const fetchCasefix = async () => {
        if (!projectId) {
            setError('Project ID is missing');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/casefix-by-project/${projectId}`);
            if (response.status === 200 && Array.isArray(response.data)) {
                setCasefixData(response.data);
            } else {
                setError('ข้อมูลไม่ถูกต้องจาก API');
            }
        } catch (error) {
            console.error('Error fetching casefix:', error);
            setError('ไม่สามารถโหลดข้อมูลจาก API ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCasefix();
    }, [projectId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCase({ ...newCase, [name]: value });
    };

    const handleAddCasefix = async () => {
        if (!newCase.casename || !newCase.casedescription) {
            alert('กรุณากรอกข้อมูลให้ครบ');
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API}/createCasefix`, {
                ...newCase,
                projectfix: projectId
            });
            setNewCase({ casename: '', casedescription: '' });
            setShowModal(false);
            fetchCasefix();
        } catch (error) {
            console.error('Error adding casefix:', error);
            alert('ไม่สามารถเพิ่ม Casefix ได้');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewCase({ casename: '', casedescription: '' });
    };

    const handleCardClick = (id, casename) => {
        navigate(`/howtofix/${id}`, { state: { casename } });
    };

    return (
        <div className="casefix-container">
            <div className="casefix-header-with-button">
                <button className="casefix-back-button" onClick={() => navigate(-1)}>
                     ย้อนกลับ
                </button>
                <h2 className="casefix-title">โปรเจกต์ {projectName}</h2>
                <button className="casefix-add-button" onClick={() => setShowModal(true)}>
                    เพิ่ม Casefix
                </button>
            </div>

            {showModal && (
                <div className="casefix-modal-overlay">
                    <div className="casefix-modal-content">
                        <h3>เพิ่ม Casefix</h3>
                        <input
                            type="text"
                            name="casename"
                            placeholder="ชื่อเคส"
                            value={newCase.casename}
                            onChange={handleInputChange}
                        />
                        <textarea
                            name="casedescription"
                            placeholder="รายละเอียด"
                            value={newCase.casedescription}
                            onChange={handleInputChange}
                            rows={4}
                        />
                        <div className="casefix-modal-buttons">
                            <button className="casefix-save-btn" onClick={handleAddCasefix}>บันทึก</button>
                            <button className="casefix-cancel-btn" onClick={handleCloseModal}>ยกเลิก</button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <p>กำลังโหลด...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : casefixData.length > 0 ? (
                <>
                    <p>พบทั้งหมด {casefixData.length} เคส</p>
                    <div className="casefix-card-grid">
                        {casefixData.map((item) => (
                            <div className="casefix-card" key={item._id} onClick={() => handleCardClick(item._id, item.casename)}>
                                <h4 className="casefix-card-title">{item.casename}</h4>
                                <p className="casefix-card-desc">{item.casedescription}</p>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <p>ไม่มี Casefix สำหรับโปรเจกต์นี้</p>
            )}
        </div>
    );
};

export default Casefix;
