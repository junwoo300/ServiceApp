import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCpu, FiRefreshCw, FiActivity, FiCheckCircle, FiWifi, FiWifiOff } from 'react-icons/fi';
import { api } from '../../../apiClient';
import './RobotStatus.css';
import RobotStatusSummary from './RobotStatusSummary';

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok',
  year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const format = value => value === null || value === undefined ? '—' :
  value.toLocaleString('th-TH', { maximumFractionDigits: 2 });
const duration = minutes => minutes === null ? '—' : `${Math.floor(minutes / 60)} ชม. ${format(minutes % 60)} นาที`;
const labels = { online: 'Online', offline: 'Offline', unknown: 'ไม่ทราบสถานะ' };

export default function RobotStatus() {
  const [date, setDate] = useState(today);
  const [range, setRange] = useState(false);
  const [lastDate, setLastDate] = useState(today);
  const endDate = range ? lastDate : date;
  const period = date === endDate ? date : `${date} ถึง ${endDate}`;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;
    setData(null);
    async function load() {
      if (inFlight) return;
      inFlight = true;
      setLoading(true);
      try {
        const response = await api.get('/robot-telemetry', { params: { date, ...(range ? { endDate } : {}) }, signal: controller.signal, timeout: 90000 });
        if (!controller.signal.aborted) { setData(response.data); setError(''); }
      } catch (err) {
        if (!controller.signal.aborted) setError(err.response?.data?.message || 'เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่');
      } finally {
        inFlight = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    const timer = setInterval(load, 60000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [date, endDate, range, refresh]);

  const robots = data?.robots || [];
  const visible = robots.filter(robot => (status === 'all' || robot.status === status) &&
    `${robot.name} ${robot.vin} ${robot.location || ''} ${robot.model || ''}`.toLowerCase().includes(query.toLowerCase()));
  const sum = key => !data || robots.some(robot => robot[key] === null) ? null :
    robots.reduce((total, robot) => total + robot[key], 0);
  const kpis = [
    { label: 'หุ่นยนต์ทั้งหมด', value: data ? robots.length : null, unit: 'ตัว', icon: FiCpu },
    { label: 'Online ปัจจุบัน', value: data ? robots.filter(r => r.status === 'online').length : null, unit: 'ตัว', icon: FiWifi, tone: 'green' },
    { label: 'Offline ปัจจุบัน', value: data ? robots.filter(r => r.status === 'offline').length : null, unit: 'ตัว', icon: FiWifiOff, tone: 'gray' },
    { label: 'พื้นที่ทำความสะอาด', value: sum('actualArea'), unit: 'ตร.ม. / วันที่เลือก', icon: FiCheckCircle },
  ];

  return <section className="robot-status-page" aria-busy={loading}>
    <Link to="/Menurobotlist" className="rs-back">← เมนู Robot</Link>
    <header className="rs-header">
      <div><div className="rs-eyebrow">ROBOT MONITORING</div><h1>สถานะหุ่นยนต์</h1>
        <p>ติดตามการเชื่อมต่อและผลงานรายวันจาก iDriverPlus</p></div>
      <button type="button" className="rs-refresh" disabled={loading} onClick={() => setRefresh(n => n + 1)}>
        <FiRefreshCw /> {loading ? 'กำลังอัปเดต…' : 'รีเฟรชข้อมูล'}</button>
    </header>
    <div className="rs-toolbar">
      <div className="rs-date-controls">
        <label>เลือกช่วงเวลา<select value={range ? 'range' : 'single'} onChange={e => { setRange(e.target.value === 'range'); setLastDate(date); }}>
          <option value="single">วันเดียว</option><option value="range">หลายวัน</option>
        </select></label>
        <label>{range ? 'วันที่เริ่มต้น' : 'วันที่ดูผลงาน'}<input type="date" value={date} max={today()} onChange={e => {
          if (e.target.value && e.target.value <= today()) { setDate(e.target.value); if (e.target.value > lastDate) setLastDate(e.target.value); }
        }} /></label>
        {range && <label>วันที่สิ้นสุด<input type="date" value={lastDate} min={date} max={today()} onChange={e => {
          if (e.target.value >= date && e.target.value <= today()) setLastDate(e.target.value);
        }} /></label>}
      </div>
      <p><FiActivity /> ตรวจข้อมูลทุก 1 นาที{data && <> · อัปเดต {new Date(data.fetchedAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}</>}</p>
    </div>
    <RobotStatusSummary key={`${date}:${endDate}`} date={date} endDate={endDate} />
    {error && <div className="rs-error" role="alert">{error}{data && <strong> · กำลังแสดงข้อมูลเดิม สถานะอาจเปลี่ยนแล้ว</strong>}</div>}
    <div className="rs-kpis">{kpis.map(({ label, value, unit, icon: Icon, tone = '' }) =>
      <article className={`rs-kpi ${tone}`} key={label}><div className="rs-kpi-label">{label}<Icon /></div>
        <strong>{format(value)}</strong><small>{unit}</small></article>)}</div>
    <div className="rs-table-panel">
      <div className="rs-table-heading"><div><h2>ผลงานแต่ละตัว</h2><p>จำนวนงาน เวลาและพื้นที่รวมวันที่ {period} (รวมวันเริ่มต้นและสิ้นสุด) ตามรายงานต้นทาง</p></div>
        <div className="rs-filters"><label>ค้นหาหุ่นยนต์<input type="search" value={query} placeholder="ชื่อ, VIN, รุ่น หรือไซต์" onChange={e => setQuery(e.target.value)} /></label>
          <label>สถานะ<select value={status} onChange={e => setStatus(e.target.value)}><option value="all">ทุกสถานะ</option><option value="online">Online</option><option value="offline">Offline</option><option value="unknown">ไม่ทราบสถานะ</option></select></label></div></div>
      <div className="rs-table-scroll"><table><thead><tr><th>หุ่นยนต์ / VIN</th><th>ไซต์ / รุ่น</th><th>สถานะปัจจุบัน</th><th>จำนวนงาน</th><th>เวลาทำงาน</th><th>พื้นที่จริง (ตร.ม.)</th><th>พื้นที่แผน (ตร.ม.)</th></tr></thead>
        <tbody>{visible.map(robot => <tr key={robot.vin}><td><strong>{robot.name}</strong><small>{robot.vin}</small></td>
          <td>{robot.location || '—'}<small>{robot.model || '—'}</small></td>
          <td><span className={`rs-badge ${error ? 'unknown' : robot.status}`}>{error ? 'ข้อมูลเดิม: ' : ''}{labels[robot.status]}</span></td>
          <td>{format(robot.tasks)}</td><td className="rs-duration">{duration(robot.workMinutes)}</td><td>{format(robot.actualArea)}</td><td>{format(robot.plannedArea)}</td></tr>)}
          {!visible.length && <tr><td colSpan="7" className="rs-empty">{loading ? 'กำลังดึงข้อมูลหุ่นยนต์…' : error ? 'ยังไม่มีข้อมูลที่แสดงได้' : 'ไม่พบหุ่นยนต์ที่ตรงกับเงื่อนไข'}</td></tr>}</tbody></table></div>
      <footer className="rs-table-footer"><span>แสดง {visible.length} จาก {robots.length} ตัว · จำนวนงานรวม {format(sum('tasks'))} งาน</span><span>เวลาทำงานรวม {duration(sum('workMinutes'))}</span></footer>
    </div>
    <p className="rs-note">Online/Offline คือสถานะปัจจุบัน ไม่ใช่สถานะย้อนหลังของวันที่เลือก · “—” หมายถึงไม่มีข้อมูล · วันที่เริ่มต้นใช้เวลาไทย และสถิติยึดวันตามระบบต้นทาง</p>
    <a className="rs-source" href="https://agent.wxb.idriverplus.com/#/datastatistics" target="_blank" rel="noreferrer">เปิดรายงานต้นทาง iDriverPlus ↗</a>
  </section>;
}
