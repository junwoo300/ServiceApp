import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './SiteDetails.css'; // เพิ่มไฟล์ CSS

const SiteDetails = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [siteData, setSiteData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSite, setNewSite] = useState({
        name: '',
    });

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/projects/${projectId}/sites`);
                setSiteData(response.data);
            } catch (error) {
                console.error('Error fetching site data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSiteData();
    }, [projectId]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleAddSite = async () => {
        if (!newSite.name) {
            alert('Please enter a site name.');
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API}/projects/${projectId}/sites`, newSite);
            setNewSite({ name: '' });
            setIsModalOpen(false);
            const response = await axios.get(`${process.env.REACT_APP_API}/projects/${projectId}/sites`);
            setSiteData(response.data);
        } catch (error) {
            console.error('Error adding site:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSite({ ...newSite, [name]: value });
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    // จัดกลุ่มข้อมูลเป็นคู่
    const groupedSites = [];
    for (let i = 0; i < siteData.length; i += 2) {
        groupedSites.push(siteData.slice(i, i + 2));
    }

    return (
        <div>
            <div className="camera-site-button-container">
                <button className="camera-site-back-button" onClick={handleBack}>
                    BACK
                </button>
                <button className="camera-site-add-button" onClick={() => setIsModalOpen(true)}>
                    ADD SITE
                </button>
            </div>
            
            <h2 className="site-title">รายชื่อ Site</h2>
            {siteData.length > 0 ? (
                <div className="camera-site-site-table">
                    {groupedSites.map((group, index) => (
                        <div className="camera-site-site-row" key={index}>
                            {group.map((site) => (
                                <div className="site-cell" key={site._id}>
                                    <Link to={`/site/${site._id}`}>
                                        <p>{site.name}</p>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <p>ไม่พบข้อมูล Site</p>
            )}

            {isModalOpen && (
                <div className="camera-site-modal">
                    <div className="camera-site-modal-content">
                        <span className="camera-site-close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h2>Add New Site</h2>
                        <input
                            type="text"
                            name="name"
                            placeholder="Site Name"
                            value={newSite.name}
                            onChange={handleInputChange}
                        />
                        <button onClick={handleAddSite}>Add Site</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SiteDetails;
