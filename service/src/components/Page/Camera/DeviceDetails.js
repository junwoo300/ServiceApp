import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DeviceDetails.css'; // Import CSS

const DeviceDetails = () => {
    const { siteId } = useParams(); // ดึง siteId จาก URL params
    const navigate = useNavigate(); // ประกาศ navigate
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // สถานะป๊อปอัพ
    const [newDevice, setNewDevice] = useState({
        name: '',
        ip: '',
        user: '',
        password: '',
        description: '',
    });
    const [successMessage, setSuccessMessage] = useState(''); // สถานะข้อความสำเร็จ

    // ดึง URL ของ API จากไฟล์ env
    const apiBaseUrl = process.env.REACT_APP_API;

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/sites/${siteId}/devices`);
                setDevices(response.data);
            } catch (error) {
                console.error('Error fetching devices:', error);
                setDevices([]); // ถ้ามีข้อผิดพลาด ตั้งค่าเป็นอาเรย์ว่าง
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, [siteId, apiBaseUrl]);

    const handleBack = () => {
        navigate(-1); // ใช้ navigate เพื่อกลับไปยังหน้าก่อนหน้า
    };

    const handleAdd = () => {
        setIsModalOpen(true); // เปิดป๊อปอัพ
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDevice({ ...newDevice, [name]: value });
    };

    // ส่ง POST request เพื่อเพิ่มอุปกรณ์ใหม่
    const handleAddDevice = async () => {
        console.log('Adding device:', newDevice);
    
        try {
            const response = await axios.post(`${apiBaseUrl}/devices/${siteId}`, {
                name: newDevice.name,
                ip: newDevice.ip || '', // ใช้ค่าเริ่มต้นถ้าไม่มี
                user: newDevice.user || '', // ใช้ค่าเริ่มต้นถ้าไม่มี
                password: newDevice.password || '', // ใช้ค่าเริ่มต้นถ้าไม่มี
                description: newDevice.description || '', // ใช้ค่าเริ่มต้นถ้าไม่มี
            });
            console.log('Response from API:', response.data);
    
            // เคลียร์ฟอร์มและปิดป๊อปอัพ
            setNewDevice({
                name: '',
                ip: '',
                user: '',
                password: '',
                description: '',
            });
            setIsModalOpen(false);
    
            setSuccessMessage('เพิ่มอุปกรณ์สำเร็จ!');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
    
            const updatedDevices = await axios.get(`${apiBaseUrl}/sites/${siteId}/devices`);
            setDevices(updatedDevices.data);
        } catch (error) {
            console.error('Error adding device:', error);
            if (error.response && error.response.data && error.response.data.error) {
                alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.response.data.error}`);
            } else {
                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="device-details-container">
            <button className="back-button" onClick={handleBack}>Back</button>
            <h2>Device Details</h2>
            <button className="add-button" onClick={handleAdd}>Add</button> {/* ปุ่มเพิ่ม */}
            {devices.length > 0 ? (
                <table className="device-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>IP</th>
                            <th>User</th>
                            <th>Password</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
    {devices.map((device) => (
        <tr key={device._id}>
            <td>{device.name}</td>
            <td>
                <a 
                    href={`http://${device.ip}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ip-link" // สามารถเพิ่ม class นี้เพื่อทำให้สวยงามขึ้นได้
                >
                    {device.ip}
                </a>
            </td>
            <td>{device.user}</td>
            <td>{device.password}</td>
            <td>{device.description}</td>
        </tr>
    ))}
</tbody>

                </table>
            ) : (
                <p>No device data found.</p>
            )}

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h2>Add New Device</h2>
                        <input
                            type="text"
                            name="name"
                            placeholder="Device Name"
                            value={newDevice.name}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="ip"
                            placeholder="Device IP"
                            value={newDevice.ip}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="user"
                            placeholder="User"
                            value={newDevice.user}
                            onChange={handleInputChange}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={newDevice.password}
                            onChange={handleInputChange}
                        />
                        <textarea
                            name="description"
                            placeholder="Description"
                            value={newDevice.description}
                            onChange={handleInputChange}
                        />
                        <button onClick={handleAddDevice}>Add Device</button>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}
        </div>
    );
};

export default DeviceDetails;
