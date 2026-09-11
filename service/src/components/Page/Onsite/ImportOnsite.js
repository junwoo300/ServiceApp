import React, { useState } from 'react';
import axios from 'axios';
import './ImportOnsite.css';

const ImportOnsite = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    // ✅ เพิ่ม Refcode ในคอลัมน์
    const TEMPLATE_COLUMNS = [
        'วันที่ (dd/mm/yyyy)',
        'Implement (ดำเนินการโดย)',
        'Type',
        'Site',
        'Refcode',
        'Robot Name',
        'รายการอุปกรณ์',
        'Cost (ราคาของ)',
        'Shipping (ราคาขนส่ง)',
        'ค่าแรง',
        'ค่าเดินทาง',
        'Scope of Work',
        'การดำเนินการ'
    ];

    // ✅ เพิ่ม Refcode ในข้อมูลตัวอย่าง
    const TEMPLATE_DATA = [
        {
            date: '11/07/2025',
            implement: 'เมษ,ตั้น',
            type: 'ROBOT',
            site: 'สถานีราชปรารภ A7',
            refcode: 'REF-A7-01',
            robot: 'VIN-001',
            equipment: 'ไขควงไฟฟ้า,สว่าน',
            cost: '1200',
            shipping: 500,
            labor: '1050',
            travel: '150',
            scope: 'Installation',
            details: 'ติดตั้งระบบ Sensor ใหม่'
        },
        {
            date: '12/07/2025',
            implement: 'สายัญห์',
            type: 'Billboard',
            site: 'ป้ายบิลบอร์ด สุขุมวิท',
            refcode: 'REF-SKV-02',
            robot: '-',
            equipment: '',
            cost: '0',
            shipping: 0,
            labor: '500',
            travel: '100',
            scope: 'Maintenance',
            details: 'เปลี่ยนหลอดไฟ'
        }
    ];

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('กรุณาเลือกไฟล์ Excel');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        setMessage('');

        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/import/onsite-records`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(`Import สำเร็จ! สร้าง ${response.data.successCount} รายการ, ล้มเหลว ${response.data.errorCount} แถว`);
            setFile(null);
            document.getElementById('file-input').value = '';
        } catch (err) {
            console.error('Error importing onsite records:', err);
            setMessage(err.response?.data?.message || 'เกิดข้อผิดพลาดในการ Import');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="import-wrapper">
            <button className="import-back-btn" onClick={() => window.history.back()}>🔙 กลับ</button>
            <h1 className="import-title">Import ข้อมูล Onsite จาก Excel</h1>

            <div className="import-container">
                <div className="import-template">
                    <h3>1. เตรียมไฟล์ Excel (.xlsx)</h3>
                    <p>
                        ไฟล์ของคุณต้องมีข้อมูลเรียงตามคอลัมน์ดังนี้ (ไม่ต้องมี Header ในไฟล์ Excel)
                        <br/>
                        <span style={{color: '#e74c3c', fontWeight: 'bold'}}>*กรุณากรอกข้อมูลให้ครบทุกช่องตามความเป็นจริง*</span>
                    </p>
                    
                    <div className="import-template-table-wrapper">
                        <table className="import-template-table">
                            <thead>
                                <tr>
                                    {TEMPLATE_COLUMNS.map(col => <th key={col}>{col}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {TEMPLATE_DATA.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        <td>{row.date}</td>
                                        <td>{row.implement}</td>
                                        <td>{row.type}</td>
                                        <td>{row.site}</td>
                                        <td>{row.refcode}</td>
                                        <td>{row.robot}</td>
                                        <td>{row.equipment}</td>
                                        <td>{row.cost}</td>
                                        <td>{row.shipping}</td>
                                        <td>{row.labor}</td>
                                        <td>{row.travel}</td>
                                        <td>{row.scope}</td>
                                        <td>{row.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="import-upload-area">
                    <h3>2. อัปโหลดไฟล์</h3>
                    <input type="file" id="file-input" accept=".xlsx" onChange={handleFileChange} />
                    <button className="import-upload-btn" onClick={handleUpload} disabled={uploading || !file}>
                        {uploading ? 'กำลัง Import...' : 'เริ่ม Import ข้อมูล'}
                    </button>
                </div>

                {message && <div className="import-message">{message}</div>}
            </div>
        </div>
    );
};

export default ImportOnsite;
