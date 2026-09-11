import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector
} from 'recharts';
import './Graphonsite.css';

// --- Helper Functions ---

const YearSelector = ({ selectedYear, onChange, years }) => (
    <div className="graph-year-selector">
        <label htmlFor="year-select">เลือกปี:</label>
        <select id="year-select" value={selectedYear} onChange={e => onChange(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
    </div>
);

const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} ครั้ง`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`( ${(percent * 100).toFixed(2)}% )`}
            </text>
        </g>
    );
};

// --- Main Component ---

const GraphOnsite = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        const fetchYearlyData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/onsite/records/get-by-year?year=${year}`);
                setRecords(response.data || []);
                setError("");
            } catch (err) {
                console.error("Failed to fetch yearly data:", err);
                setError(`ไม่สามารถโหลดข้อมูลของปี ${year} ได้`);
                setRecords([]);
            } finally {
                setLoading(false);
            }
        };
        fetchYearlyData();
    }, [year]);

    const processedData = useMemo(() => {
        if (records.length === 0) return null;

        const excludedEmployeeNames = ['ค่าใช้จ่าย', 'Shipping'];

        const totalCosts = {
            'ค่าเดินทาง': records.reduce((sum, rec) => sum + (rec.travelCost || 0), 0),
            'ค่าขนส่ง': records.reduce((sum, rec) => sum + (rec.Shipping || 0), 0),
            'ค่าอุปกรณ์': records.reduce((sum, rec) => sum + (rec.totalEquipmentCost || 0), 0),
            'ค่าแรง': records.reduce((sum, rec) => sum + (rec.totalLaborCost || 0), 0),
        };
        const totalCostData = Object.entries(totalCosts).map(([name, value]) => ({ name, 'ค่าใช้จ่าย': value }));

        const employeeCount = records.reduce((acc, rec) => {
            if (rec.employees && Array.isArray(rec.employees)) {
                rec.employees.forEach(emp => {
                    if (emp && emp.name && !excludedEmployeeNames.includes(emp.name)) {
                        acc[emp.name] = (acc[emp.name] || 0) + 1;
                    }
                });
            }
            return acc;
        }, {});
        const employeeData = Object.entries(employeeCount).map(([name, value]) => ({ name, 'จำนวนครั้ง': value })).sort((a, b) => b['จำนวนครั้ง'] - a['จำนวนครั้ง']);
        
        const siteCount = records.reduce((acc, rec) => {
            if (rec.site?.name) {
                acc[rec.site.name] = (acc[rec.site.name] || 0) + 1;
            }
            return acc;
        }, {});
        const siteData = Object.entries(siteCount).map(([name, value]) => ({ name, 'จำนวนครั้ง': value })).sort((a, b) => b['จำนวนครั้ง'] - a['จำนวนครั้ง']).slice(0, 10);

        const typeCount = records.reduce((acc, rec) => {
            if (rec.type) {
                acc[rec.type] = (acc[rec.type] || 0) + 1;
            }
            return acc;
        }, {});
        const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
        
        return { totalCostData, employeeData, siteData, typeData };
    }, [records]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19AF'];

    if (loading) return <div className="graph-status-message">กำลังโหลดข้อมูลกราฟ...</div>;
    if (error) return <div className="graph-status-message error">{error}</div>;

    return (
        <div className="graph-wrapper">
            <button className="graph-back-btn" onClick={() => window.history.back()}>🔙 กลับ</button>
            <div className="graph-header">
                <h1>Dashboard สรุปข้อมูลออนไซต์</h1>
                <YearSelector selectedYear={year} onChange={setYear} years={years} />
            </div>

            {!processedData ? (
                <div className="graph-status-message">ไม่พบข้อมูลสำหรับปี {year}</div>
            ) : (
                <div className="graph-grid">
                    <div className="graph-chart-container wide">
                        <h2>สรุปค่าใช้จ่ายรวม (บาท)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={processedData.totalCostData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => value.toLocaleString()} />
                                <Legend />
                                <Bar dataKey="ค่าใช้จ่าย" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="graph-chart-container wide">
                        <h2>สรุปจำนวนครั้งที่พนักงานไปออนไซต์</h2>
                        <ResponsiveContainer width="100%" height={Math.max(300, processedData.employeeData.length * 30)}>
                            <BarChart layout="vertical" data={processedData.employeeData} margin={{ left: 50, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => `${value} ครั้ง`} />
                                <Legend />
                                <Bar dataKey="จำนวนครั้ง" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="graph-chart-container">
                        <h2>ประเภทงานที่ไปบ่อย</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={processedData.typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#00C49F"
                                    dataKey="value"
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                    // ส่วน label ถูกลบออกเพื่อให้กราฟสะอาดขึ้น
                                >
                                    {processedData.typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} ครั้ง`}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="graph-chart-container wide">
                        <h2>10 ไซต์งานที่ไปบ่อยที่สุด</h2>
                        <ResponsiveContainer width="100%" height={300}>
                                <BarChart layout="vertical" data={processedData.siteData} margin={{ left: 50, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                                    <Tooltip formatter={(value) => `${value} ครั้ง`}/>
                                    <Legend />
                                    <Bar dataKey="จำนวนครั้ง" fill="#FFBB28" />
                                </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GraphOnsite;