import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // เพิ่มการใช้งาน useNavigate
import './Projectfix.css';

const Projectfix = ({ pageTitle = 'เลือกเคสที่ต้องการแก้ไข' }) => {
    const [projectData, setProjectData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [casefixData, setCasefixData] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // เพิ่ม state สำหรับคำค้นหา
    const navigate = useNavigate();  // สร้างตัวแปร navigate เพื่อใช้เปลี่ยนหน้า

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/getAllProjectsfix`);
            setProjectData(response.data);
        } catch (error) {
            console.error('Error fetching projectfix data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCasefixByProjectId = async (projectId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/casefix-by-project/${projectId}`);
            setCasefixData(response.data);
            setSelectedProjectId(projectId);
        } catch (error) {
            console.error('Error fetching casefix:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleAddProject = async () => {
        if (!newProject.name || !newProject.description) {
            alert('กรุณากรอกชื่อและรายละเอียดโปรเจกต์');
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API}/createProjectfix`, newProject);
            setNewProject({ name: '', description: '' });
            setIsModalOpen(false);
            fetchProjects();
        } catch (error) {
            console.error('Error adding project:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject({ ...newProject, [name]: value });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value); // อัพเดทคำค้นหาตามการกรอก
    };

    const handleProjectClick = (projectId, projectName) => {
        navigate(`/projectfix/${projectId}`, { state: { projectName } });
    };

    // ฟังก์ชันกรองข้อมูลตามคำค้นหาที่กรอก
    const filteredProjects = projectData.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="projectfix-container">
            
            <div className="projectfix-header">
  <a href="/" className="robot-home-link">
    <img src="/imagenakub/home.png" alt="Home" className="robot-home-icon" />
  </a>
  <h2 className="projectfix-site-title">{pageTitle}</h2>
  <button type="button" className="projectfix-add-button" onClick={() => setIsModalOpen(true)}>
    ADD PROJECT
  </button>
</div>
            {/* ช่องกรอกค้นหา */}
            <div className="projectfix-search-container">
                <input
                    type="text"
                    placeholder="ค้นหาโปรเจกต์..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="projectfix-search-input"
                />
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : filteredProjects.length > 0 ? (
                <div className="projectfix-table">
                    {filteredProjects.map((project) => (
                        <div
                            className="projectfix-project-card"
                            key={project._id}
                            onClick={() => handleProjectClick(project._id, project.name)}  // เรียกใช้ handleProjectClick เมื่อคลิก
                        >
                            <h3>{project.name}</h3>
                            <p>{project.description}</p>

                            {selectedProjectId === project._id && (
                                <div className="casefix-list">
                                    <h4>Casefix ที่เกี่ยวข้อง:</h4>
                                    {casefixData.length > 0 ? (
                                        casefixData.map((item) => (
                                            <div key={item._id} className="casefix-card">
                                                <strong>{item.casename}</strong>
                                                <p>{item.casedescription}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>ไม่มี Casefix สำหรับโปรเจกต์นี้</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>ไม่พบข้อมูล Projectfix</p>
            )}

            {isModalOpen && (
                <div className="projectfix-modal">
                    <div className="projectfix-modal-content">
                        <button type="button" className="projectfix-close" aria-label="ปิดหน้าต่าง" onClick={() => setIsModalOpen(false)}>&times;</button>
                        <h2>เพิ่มโปรเจกต์ใหม่</h2>
                        <input
                            type="text"
                            name="name"
                            placeholder="ชื่อโปรเจกต์"
                            value={newProject.name}
                            onChange={handleInputChange}
                        />
                        <textarea
                            name="description"
                            placeholder="รายละเอียดโปรเจกต์"
                            value={newProject.description}
                            onChange={handleInputChange}
                            rows={4}
                        />
                        <button onClick={handleAddProject}>เพิ่มโปรเจกต์</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projectfix;
