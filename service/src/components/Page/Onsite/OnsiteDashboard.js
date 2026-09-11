import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import './OnsiteDashboard.css'; // นำเข้าไฟล์ CSS

// Debounce hook
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const OnsiteDashboard = () => {
    // --- State Management ---
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sites, setSites] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [filterSite, setFilterSite] = useState('');
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterType, setFilterType] = useState('');
    const [exportMonth, setExportMonth] = useState('');
    const [exportYear, setExportYear] = useState(new Date().getFullYear());
    const [isExporting, setIsExporting] = useState(false);
    const ITEMS_PER_PAGE = 50;

    // State สำหรับ Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);

    // Edit Form states (อ้างอิงตาม Onsite Schema ของคุณ)
    const [editOnsiteDate, setEditOnsiteDate] = useState('');
    const [editScope, setEditScope] = useState('');
    const [editTravelCost, setEditTravelCost] = useState(0);
    const [editShipping, setEditShipping] = useState(0);
    const [editTotalEquipmentCost, setEditTotalEquipmentCost] = useState(0);
    const [editSelectedEmployee, setEditSelectedEmployee] = useState(''); // เปลี่ยนเป็นเลือกได้คนเดียว

    // ฟิลด์ที่แสดงผลเท่านั้น (Read-only)
    const [displaySelectedBy, setDisplaySelectedBy] = useState('');
    const [displaySiteName, setDisplaySiteName] = useState('');
    const [displayRefcode, setDisplayRefcode] = useState('');
    const [displayType, setDisplayType] = useState('');
    const [displayRobotName, setDisplayRobotName] = useState('');
    const [displayEquipmentNames, setDisplayEquipmentNames] = useState('');
    const [displayDetails, setDisplayDetails] = useState('');
    const [displayTotalLaborCost, setDisplayTotalLaborCost] = useState(0);
    const [displayGrandTotal, setDisplayGrandTotal] = useState(0);


    const debouncedFilterSite = useDebounce(filterSite, 500);
    const debouncedFilterEmployee = useDebounce(filterEmployee, 500);
    const debouncedFilterStartDate = useDebounce(filterStartDate, 500);
    const debouncedFilterEndDate = useDebounce(filterEndDate, 500);
    const debouncedFilterType = useDebounce(filterType, 500);

    // --- Data Fetching ---
    const fetchDropdownData = async () => {
        try {
            const [sitesRes, employeesRes, equipmentRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API}/onsite/sites`),
                axios.get(`${process.env.REACT_APP_API}/onsite/employees`),
                axios.get(`${process.env.REACT_APP_API}/onsite/equipment`),
            ]);
            setSites(sitesRes.data || []);
            setEmployees(employeesRes.data || []);
            setEquipment(equipmentRes.data || []);
        } catch (err) {
            console.error('❌ Error fetching dropdown data:', err);
            setError("โหลดข้อมูลตัวเลือก (Dropdown) ไม่สำเร็จ");
        }
    };

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            if (debouncedFilterSite) params.append('site', debouncedFilterSite);
            if (debouncedFilterEmployee) params.append('employee', debouncedFilterEmployee);
            if (debouncedFilterStartDate) params.append('startDate', debouncedFilterStartDate);
            if (debouncedFilterEndDate) params.append('endDate', debouncedFilterEndDate);
            if (debouncedFilterType) params.append('type', debouncedFilterType);

            const res = await axios.get(`${process.env.REACT_APP_API}/onsite/records?${params.toString()}`);
            setRecords(res.data?.records || []);
            setTotalPages(res.data?.totalPages || 0);
            setError("");
        } catch (err) {
            console.error('❌ Error fetching records:', err);
            setError("โหลดข้อมูล Records ไม่สำเร็จ กรุณาลองใหม่");
            setRecords([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [
        currentPage, debouncedFilterSite, debouncedFilterEmployee,
        debouncedFilterStartDate, debouncedFilterEndDate, debouncedFilterType
    ]);

    // --- Effects ---
    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [
        debouncedFilterSite, debouncedFilterEmployee,
        debouncedFilterStartDate, debouncedFilterEndDate, debouncedFilterType
    ]);

    // --- Event Handlers ---
    const handleDelete = async (id) => {
        if (!window.confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) return;
        try {
            await axios.delete(`${process.env.REACT_APP_API}/onsite/records/${id}`);
            fetchRecords();
            alert('ลบข้อมูลสำเร็จ');
        } catch (err) {
            console.error('❌ Error deleting record:', err);
            alert("ลบข้อมูลไม่สำเร็จ");
        }
    };

    const handleEditClick = (record) => {
        setCurrentRecord(record);
        // ฟิลด์ที่แก้ไขได้
        const onsiteDateFormatted = record.onsiteDate ? new Date(record.onsiteDate).toISOString().split('T')[0] : '';
        setEditOnsiteDate(onsiteDateFormatted);
        setEditScope(record.scope || '');
        setEditTravelCost(record.travelCost || 0);
        setEditShipping(record.Shipping || 0);
        setEditTotalEquipmentCost(record.totalEquipmentCost || 0);
        // เลือกพนักงานคนแรกจาก array หรือเป็นค่าว่างถ้าไม่มี
        setEditSelectedEmployee(record.employees && record.employees.length > 0 ? record.employees[0]._id : '');

        // ฟิลด์ที่แสดงผลเท่านั้น (Read-only)
        setDisplaySelectedBy(record.selectedBy || '—');
        setDisplaySiteName(record.site?.name || '—');
        setDisplayRefcode(record.site?.Refcode || '—');
        setDisplayType(record.type || '—');
        setDisplayRobotName(record.robotname || '—');
        setDisplayEquipmentNames(record.equipment?.map(eq => eq.name).join(', ') || '—');
        setDisplayDetails(record.details || '—');
        setDisplayTotalLaborCost(record.totalLaborCost || 0);
        setDisplayGrandTotal(record.grandTotal || 0);

        setShowEditModal(true);
    };

    const handleUpdateRecord = async (e) => {
        e.preventDefault();
        if (!currentRecord) return;

        // คำนวณค่ารวม (grandTotal) และค่าแรง (totalLaborCost) ใน Frontend ก่อนส่งไป Backend
        // สมมติว่า totalLaborCost คำนวณจาก rate ของพนักงานที่เลือก x จำนวนชั่วโมง
        // แต่ในฟอร์มนี้เราให้แก้ไขเฉพาะ travelCost, Shipping, totalEquipmentCost
        // ดังนั้น grandTotal = travelCost + Shipping + totalEquipmentCost + totalLaborCost

        // หากคุณต้องการให้ totalLaborCost คำนวณจาก rate ของพนักงานที่เลือก
        // คุณจะต้องดึง rate ของพนักงานที่เลือกมาคำนวณที่นี่
        // สำหรับตอนนี้ ผมจะใช้ค่า totalLaborCost เดิมของ record ที่กำลังแก้ไขอยู่ เพื่อไม่ให้เกิดความซับซ้อนเกินไป
        // ถ้าต้องการให้คำนวณใหม่ต้องส่ง employee rate และชั่วโมงมาด้วย
        const laborCostFromOriginalRecord = currentRecord.totalLaborCost || 0;


        const newGrandTotal = parseFloat(editTravelCost) +
                              parseFloat(editShipping) +
                              parseFloat(editTotalEquipmentCost) +
                              laborCostFromOriginalRecord; // ใช้ค่าเดิมของค่าแรง

        const updatedData = {
            onsiteDate: editOnsiteDate,
            scope: editScope,
            travelCost: parseFloat(editTravelCost),
            Shipping: parseFloat(editShipping),
            totalEquipmentCost: parseFloat(editTotalEquipmentCost),
            employees: editSelectedEmployee ? [editSelectedEmployee] : [], // ส่งเป็น Array ที่มี 1 ID
            
            // ฟิลด์อื่น ๆ ใช้ค่าเดิมจาก currentRecord
            selectedBy: currentRecord.selectedBy,
            site: currentRecord.site?._id,
            type: currentRecord.type,
            robotname: currentRecord.robotname,
            equipment: currentRecord.equipment?.map(eq => eq._id),
            details: currentRecord.details,
            
            // ค่าที่คำนวณใหม่
            totalLaborCost: laborCostFromOriginalRecord, // ยังคงใช้ค่าเดิม หรือคำนวณใหม่ตาม logic ของคุณ
            grandTotal: newGrandTotal, // คำนวณใหม่
        };

        try {
            await axios.put(`${process.env.REACT_APP_API}/onsite/records/${currentRecord._id}`, updatedData);
            fetchRecords(); // โหลดข้อมูลใหม่
            setShowEditModal(false); // ปิด Modal
            alert('อัปเดตข้อมูล Onsite Record สำเร็จ');
        } catch (err) {
            console.error('❌ Error updating onsite record:', err);
            alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล Onsite Record');
        }
    };


    const handleExportByMonth = async () => {
        if (!exportMonth) return alert("กรุณาเลือกเดือนที่ต้องการ Export");
        setIsExporting(true);
        const [year, month] = exportMonth.split('-');
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/onsite/records/export?year=${year}&month=${month}`, {
                responseType: 'blob',
            });
            saveAs(response.data, `Onsite_Records_${year}-${month}.xlsx`);
            alert('Export ข้อมูลรายเดือนสำเร็จ');
        } catch (err) {
            console.error('❌ Error exporting monthly data:', err);
            alert("Export ข้อมูลรายเดือนไม่สำเร็จ อาจไม่มีข้อมูลในเดือนที่เลือก");
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportByYear = async () => {
        if (!exportYear) return alert("กรุณาเลือกปีที่ต้องการ Export");
        setIsExporting(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/onsite/records/export-year?year=${exportYear}`, {
                responseType: 'blob',
            });
            saveAs(response.data, `Onsite_Records_Year_${exportYear}.xlsx`);
            alert('Export ข้อมูลรายปีสำเร็จ');
        } catch (err) {
            console.error('❌ Error exporting yearly data:', err);
            alert("Export ข้อมูลรายปีไม่สำเร็จ อาจไม่มีข้อมูลในปีที่เลือก");
        } finally {
            setIsExporting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // 5 ปีย้อนหลังรวมปีปัจจุบัน

    // --- Render ---
    return (
        <>
            <div className="onsite-dashboard-wrapper">
                <button className="mail-back-btn" onClick={() => window.history.back()}>🔙 กลับ</button>
                <h2 className="onsite-dashboard-title">Onsite Records</h2>

                <div className="onsite-controls-container">
                    <div className="onsite-filter-container">
                        {/* Filter controls */}
                        <label>ประเภทไซต์งาน:
                            <select className="onsite-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option value="">-- ทั้งหมด --</option>
                                {[...new Set(sites.map(site => site.type))].filter(Boolean).map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                ))}
                            </select>
                        </label>
                        <label>ไซต์งาน:
                            <select className="onsite-filter-select" value={filterSite} onChange={e => setFilterSite(e.target.value)}>
                                <option value="">-- ทั้งหมด --</option>
                                {sites.map(site => <option key={site._id} value={site._id}>{site.name}</option>)}
                            </select>
                        </label>
                        <label>พนักงาน:
                            <select className="onsite-filter-select" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
                                <option value="">-- ทั้งหมด --</option>
                                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                            </select>
                        </label>
                        <label>วันที่เริ่มต้น:
                            <input className="onsite-filter-date" type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
                        </label>
                        <label>วันที่สิ้นสุด:
                            <input className="onsite-filter-date" type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
                        </label>
                    </div>

                    <div className="onsite-export-container">
                        <label>Export ประจำเดือน:
                            <input type="month" className="onsite-filter-date" value={exportMonth} onChange={e => setExportMonth(e.target.value)} />
                        </label>
                        <button className="onsite-action-button onsite-export-button" onClick={handleExportByMonth} disabled={!exportMonth || isExporting}>
                            {isExporting ? 'กำลัง Export...' : 'ดาวน์โหลดรายเดือน'}
                        </button>

                        <div style={{width: '30px'}}></div>

                        <label>Export ประจำปี:
                            <select className="onsite-filter-select" value={exportYear} onChange={e => setExportYear(e.target.value)}>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </label>
                        <button className="onsite-action-button onsite-export-button" onClick={handleExportByYear} disabled={isExporting}>
                            {isExporting ? 'กำลัง Export...' : 'ดาวน์โหลดรายปี'}
                        </button>

                        <div style={{width: '30px'}}></div>
                        <button
                            className="onsite-action-button onsite-import-button"
                            onClick={() => window.location.href = '/ImportOnsite'}
                        >
                            Import ข้อมูล
                        </button>
                    </div>
                </div>

                <div className="onsite-dashboard-table-wrapper">
                    {loading ? (
                        <p className="onsite-status-message">⏳ กำลังโหลดข้อมูล...</p>
                    ) : error ? (
                        <p className="onsite-status-message">{error}</p>
                    ) : records.length === 0 ? (
                        <p className="onsite-status-message">ไม่พบข้อมูลตามเงื่อนไขที่กำหนด</p>
                    ) : (
                        <table className="onsite-dashboard-table">
                            <thead>
                                <tr>
                                    <th>ลำดับ</th>
                                    <th>วันที่</th>
                                    <th>ประเภท</th>
                                    <th>ไซต์งาน</th>
                                    <th className='wrap-text'>ขอบเขต</th>
                                    <th>Ref Code</th>
                                    <th>หุ่นยนต์</th>
                                    <th className='wrap-text'>รายละเอียด</th>
                                    <th>พนักงาน</th>
                                    <th>อุปกรณ์</th>
                                    <th>ค่าเดินทาง</th>
                                    <th>ค่าขนส่ง</th>
                                    <th>ค่าอุปกรณ์</th>
                                    <th>ค่าแรง</th>
                                    <th>รวม</th>
                                    <th>การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((rec, index) => {
                                    // ✅ แก้ไขส่วนนี้เพื่อแสดงชื่อพนักงานที่ถูกต้อง
                                    const employeeNames = rec.employees?.length > 0 
                                        ? rec.employees.map(emp => emp.name).join(', ')
                                        : '—';
                                    
                                    const isExpenseRecord = rec.employees?.[0]?.name === 'ค่าใช้จ่าย';

                                    return (
                                        <tr key={rec._id}>
                                            <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                            <td>{formatDate(rec.onsiteDate)}</td>
                                            <td>{rec.type || '—'}</td>
                                            <td className='wrap-text'>{rec.site?.name || '—'}</td>
                                            <td>{rec.scope || '—'}</td>
                                            <td>{rec.site?.Refcode || '—'}</td>
                                            <td>{rec.robotname || '—'}</td>
                                            <td className='wrap-text'>{rec.details || '—'}</td>
                                            <td className='wrap-text'>{employeeNames}</td>
                                            <td className='wrap-text'>{rec.equipment?.map(eq => eq.name).join(', ') || '—'}</td>
                                            <td style={{ textAlign: 'right' }}>{(rec.travelCost || 0).toLocaleString()}</td>
                                            <td style={{ textAlign: 'right' }}>{(rec.Shipping || 0).toLocaleString()}</td>
                                            <td style={{ textAlign: 'right' }}>{(rec.totalEquipmentCost || 0).toLocaleString()}</td>
                                            <td style={{ textAlign: 'right' }}>{(rec.totalLaborCost || 0).toLocaleString()}</td>
                                            <td style={{ textAlign: 'right' }}>{(rec.grandTotal || 0).toLocaleString()}</td>
                                            <td className="actions-column">
                                                <button onClick={() => handleEditClick(rec)} className="onsite-edit-button" title="แก้ไขข้อมูลนี้">แก้ไข</button>
                                                <button onClick={() => handleDelete(rec._id)} className="onsite-delete-button" title="ลบข้อมูลนี้">❌</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && !loading && (
                    <div className="onsite-pagination-controls">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>⬅️ หน้าก่อนหน้า</button>
                        <span>หน้า {currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>หน้าถัดไป ➡️</button>
                    </div>
                )}
            </div>

            {/* Edit Modal สำหรับ Onsite Record */}
            {showEditModal && currentRecord && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>แก้ไข Onsite Record</h3>
                        <form onSubmit={handleUpdateRecord}>
                            {/* ฟิลด์ที่แก้ไขได้ */}
                            <div className="form-group">
                                <label htmlFor="editOnsiteDate">วันที่:</label>
                                <input type="date" id="editOnsiteDate" value={editOnsiteDate} onChange={e => setEditOnsiteDate(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editScope">ขอบเขตของงาน:</label>
                                <textarea id="editScope" value={editScope} onChange={e => setEditScope(e.target.value)} rows="3"></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editSelectedEmployee">พนักงาน:</label>
                                <select
                                    id="editSelectedEmployee"
                                    value={editSelectedEmployee}
                                    onChange={e => setEditSelectedEmployee(e.target.value)}
                                >
                                    <option value="">-- เลือกพนักงาน --</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editTravelCost">ค่าเดินทาง:</label>
                                <input type="number" id="editTravelCost" value={editTravelCost} onChange={e => setEditTravelCost(e.target.value)} min="0" step="0.01" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editShipping">ค่าขนส่ง:</label>
                                <input type="number" id="editShipping" value={editShipping} onChange={e => setEditShipping(e.target.value)} min="0" step="0.01" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editTotalEquipmentCost">ค่าอุปกรณ์รวม:</label>
                                <input type="number" id="editTotalEquipmentCost" value={editTotalEquipmentCost} onChange={e => setEditTotalEquipmentCost(e.target.value)} min="0" step="0.01" />
                            </div>

                            {/* ฟิลด์ที่แสดงผลเท่านั้น (Read-only) */}
                            <div className="form-group">
                                <label htmlFor="displaySelectedBy">ดำเนินการโดย (อ่านอย่างเดียว):</label>
                                <input type="text" id="displaySelectedBy" value={displaySelectedBy} readOnly />
                            </div>
                            <div className="form-group">
                                <label htmlFor="displaySiteName">ไซต์งาน (อ่านอย่างเดียว):</label>
                                <input type="text" id="displaySiteName" value={displaySiteName} readOnly />
                            </div>
                            <div className="form-group">
                                <label htmlFor="displayRefcode">Ref Code (อ่านอย่างเดียว):</label>
                                <input type="text" id="displayRefcode" value={displayRefcode} readOnly />
                            </div>
                            <div className="form-group">
                                <label htmlFor="displayType">ประเภท (อ่านอย่างเดียว):</label>
                                <input type="text" id="displayType" value={displayType} readOnly />
                            </div>
                            <div className="form-group">
                                <label htmlFor="displayRobotName">ชื่อหุ่นยนต์ (อ่านอย่างเดียว):</label>
                                <input type="text" id="displayRobotName" value={displayRobotName} readOnly />
                            </div>
                            <div className="form-group">
                                <label htmlFor="displayEquipmentNames">อุปกรณ์ (อ่านอย่างเดียว):</label>
                                <textarea id="displayEquipmentNames" value={displayEquipmentNames} readOnly rows="3"></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="displayDetails">รายละเอียด (อ่านอย่างเดียว):</label>
                                <textarea id="displayDetails" value={displayDetails} readOnly rows="3"></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="displayTotalLaborCost">ค่าแรงรวม (อ่านอย่างเดียว):</label>
                                <input type="number" id="displayTotalLaborCost" value={displayTotalLaborCost} readOnly />
                            </div>
                            <div className="form-group">
                                <label htmlFor="displayGrandTotal">ค่ารวมทั้งหมด (อ่านอย่างเดียว):</label>
                                <input type="number" id="displayGrandTotal" value={displayGrandTotal} readOnly />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="submit-btn">บันทึก</button>
                                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>ยกเลิก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default OnsiteDashboard;
