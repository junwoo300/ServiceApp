import React, { useRef, useState } from 'react';
import { api } from '../../../apiClient';
import { buildRobotStatusSummary } from './robotReportText';

export default function RobotStatusSummary({ date, endDate }) {
  const [mode, setMode] = useState('morning');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [fetchedAt, setFetchedAt] = useState('');
  const textarea = useRef(null);
  const trigger = useRef(null);
  async function generate() {
    setOpen(true); setLoading(true); setError(''); setCopied(false); setText(''); setFetchedAt('');
    try {
      const reportDate = date || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      const { data } = await api.get('/robot-telemetry', { params: { date: reportDate, ...(endDate && endDate !== reportDate ? { endDate } : {}) }, timeout: 90000 });
      if (!Array.isArray(data.robots) || !data.robots.length) throw new Error('empty');
      setText(buildRobotStatusSummary(data.robots, { mode, date: reportDate, endDate, fetchedAt: data.fetchedAt }));
      setFetchedAt(data.fetchedAt);
    } catch { setError('ดึงสถานะไม่สำเร็จ กรุณาลองสร้างสรุปอีกครั้ง'); }
    finally { setLoading(false); }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true); setError('');
    } catch {
      textarea.current?.focus(); textarea.current?.select();
      setError('คัดลอกอัตโนมัติไม่ได้ เลือกข้อความให้แล้ว กด Ctrl+C หรือคัดลอกด้วยตนเอง');
    }
  }
  return <>
    <div className="rs-summary-controls">
    <label>รูปแบบสรุป<select value={mode} disabled={loading} onChange={e => { setMode(e.target.value); setOpen(false); }}>
      <option value="morning">ตอนเช้า — Online / Offline</option>
      <option value="afternoon">ตอนบ่าย — สถานะและพื้นที่ทำงานรายวัน</option>
    </select></label>
    <button ref={trigger} type="button" className="rs-refresh" disabled={loading} onClick={generate}>สรุปสถานะ</button>
    </div>
    {open && <div className="rs-summary" role="region" aria-label="สรุปสถานะหุ่นยนต์">
      <div className="rs-summary-heading"><h2>สรุปสถานะหุ่นยนต์</h2><button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }}>ปิดสรุป</button></div>
      <p>สรุปทุกไซต์ตามลำดับรายงาน ไม่ขึ้นกับตัวกรองตาราง · แก้ไขข้อความก่อนคัดลอกได้</p>
      <p>สถานะเป็นสถานะปัจจุบัน ณ เวลาดึงข้อมูล ไม่ใช่ประวัติสถานะช่วงเช้าหรือบ่าย · พื้นที่วันนี้เป็นยอดสะสมตั้งแต่ต้นวันถึงเวลาที่ดึงข้อมูล</p>
      {loading ? <p role="status">กำลังสร้างสรุปจากข้อมูลล่าสุด…</p> : <>
        {fetchedAt && <><small>ข้อมูล ณ {new Date(fetchedAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}</small>
          <label>ข้อความสรุป<textarea ref={textarea} value={text} onChange={e => { setText(e.target.value); setCopied(false); }} rows={22} /></label>
          <button type="button" className="rs-refresh" onClick={copy} disabled={!text.trim()}>คัดลอกข้อความ</button></>}
        {error && <p role="alert">{error}</p>}
        {copied && <p role="status">คัดลอกข้อความแล้ว</p>}
        {!fetchedAt && <button type="button" onClick={generate}>สร้างสรุปอีกครั้ง</button>}
      </>}
    </div>}
  </>;
}
