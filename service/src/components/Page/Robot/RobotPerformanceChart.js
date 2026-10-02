import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const format = value => value == null ? 'ไม่มีข้อมูล' : value.toLocaleString('th-TH', { maximumFractionDigits: 2 });

export default function RobotPerformanceChart({ robots, selectedVins, onSelect, period, loading, stale }) {
  const [query, setQuery] = useState('');
  const selected = robots.filter(item => selectedVins.includes(item.vin));
  const hasArea = selected.some(robot => robot.actualArea != null || robot.plannedArea != null);
  const allSelected = robots.length > 0 && selected.length === robots.length;
  const visible = robots.filter(item => `${item.name} ${item.vin} ${item.location || ''}`.toLowerCase().includes(query.toLowerCase()));

  return <section className="rs-performance" aria-labelledby="rs-performance-title">
    <div className="rs-table-heading">
      <div><h2 id="rs-performance-title">กราฟผลงานรายตัว</h2><p>ผลงานรวมวันที่ {period} · พื้นที่ทำความสะอาดจริงเทียบกับแผน</p></div>
      <details className="rs-robot-picker" onKeyDown={event => {
        if (event.key === 'Escape') {
          event.currentTarget.open = false;
          event.currentTarget.querySelector('summary').focus();
        }
      }}>
        <summary>เลือกหุ่นยนต์เพื่อดูกราฟ · {allSelected ? 'ทั้งหมด' : `เลือกแล้ว ${selected.length} ตัว`}</summary>
        <div className="rs-robot-picker-menu">
          <label>ค้นหาในรายการ<input type="search" value={query} placeholder="ชื่อ, VIN หรือไซต์" onChange={event => setQuery(event.target.value)} /></label>
          <p aria-live="polite">เลือกแล้ว {selected.length} / {robots.length} ตัว</p>
          <label className="rs-robot-choice rs-robot-choice-all"><input type="checkbox" checked={allSelected}
            ref={input => { if (input) input.indeterminate = selected.length > 0 && !allSelected; }}
            disabled={!robots.length} onChange={event => onSelect(event.target.checked ? robots.map(item => item.vin) : [])} />ทั้งหมด</label>
          <div className="rs-robot-choices">
            {visible.map(item => <label className="rs-robot-choice" key={item.vin}>
              <input type="checkbox" checked={selectedVins.includes(item.vin)} onChange={event => onSelect(event.target.checked
                ? [...selectedVins, item.vin] : selectedVins.filter(vin => vin !== item.vin))} />
              <span>{item.name}<small>{item.vin}{item.location ? ` · ${item.location}` : ''}</small></span>
            </label>)}
            {!visible.length && <p>{loading ? 'กำลังโหลด…' : 'ไม่พบหุ่นยนต์'}</p>}
          </div>
        </div>
      </details>
    </div>
    {!selected.length && <p className="rs-chart-empty">{loading ? 'กำลังโหลดข้อมูลกราฟ…' : selectedVins.length ? 'ไม่พบข้อมูลหุ่นยนต์ที่เลือกในช่วงวันที่นี้ กรุณาเลือกหุ่นยนต์ใหม่' : 'ติ๊กเลือกหุ่นยนต์ด้านบน หรือกด “ดูกราฟ” ในตาราง'}</p>}
    {selected.length > 0 && <div className="rs-performance-body">
        {stale && <p className="rs-error">กำลังแสดงข้อมูลเดิม เนื่องจากอัปเดตข้อมูลไม่สำเร็จ</p>}
        {hasArea ? <div className="rs-performance-chart" role="img" aria-label={selected.map(robot => `${robot.name}: พื้นที่จริง ${format(robot.actualArea)} ตร.ม. พื้นที่แผน ${format(robot.plannedArea)} ตร.ม.`).join('; ')}>
          <div style={{ minWidth: Math.max(320, selected.length * 160) }}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={selected} margin={{ top: 30, right: 24, bottom: 8, left: 12 }} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="vin" interval={0} tickFormatter={vin => selected.find(robot => robot.vin === vin)?.name || vin} />
              <YAxis tickFormatter={format} width={75} />
              <Tooltip labelFormatter={vin => { const robot = selected.find(item => item.vin === vin); return robot ? `${robot.name} · ${vin}` : vin; }} formatter={(value, name) => [`${format(value)} ตร.ม.`, name]} />
              <Legend />
              <Bar dataKey="actualArea" name="พื้นที่ทำความสะอาดจริง" fill="#d6a333" maxBarSize={100} isAnimationActive={false} radius={[4, 4, 0, 0]}>
                <LabelList dataKey="actualArea" position="top" formatter={format} />
              </Bar>
              <Bar dataKey="plannedArea" name="พื้นที่ตามแผน" fill="#4e83cd" maxBarSize={100} isAnimationActive={false} radius={[4, 4, 0, 0]}>
                <LabelList dataKey="plannedArea" position="top" formatter={format} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div> : <p className="rs-chart-empty">ไม่มีข้อมูลพื้นที่ทำความสะอาดในช่วงวันที่เลือก</p>}
        <p className="rs-note">หน่วยพื้นที่: ตารางเมตร · ข้อมูลที่ขาดหายไม่ใช่ศูนย์ · เปลี่ยนวันที่หรือช่วงวันที่ได้จากด้านบน</p>
      </div>}
    {selected.map(robot => {
      const percent = robot.actualArea != null && robot.plannedArea > 0 ? robot.actualArea / robot.plannedArea * 100 : null;
      return <div className="rs-performance-body" key={robot.vin}>
        <h3>{robot.name} <small>{robot.vin} · {robot.location || 'ไม่ระบุไซต์'}</small></h3>
        <dl className="rs-performance-metrics">
          <div><dt>จำนวนงาน</dt><dd>{format(robot.tasks)}{robot.tasks != null && ' งาน'}</dd></div>
          <div><dt>เวลาทำงาน</dt><dd>{robot.workMinutes == null ? 'ไม่มีข้อมูล' : `${Math.floor(robot.workMinutes / 60)} ชม. ${format(robot.workMinutes % 60)} นาที`}</dd></div>
          <div><dt>พื้นที่จริง / พื้นที่แผน (ตร.ม.)</dt><dd>{format(robot.actualArea)} / {format(robot.plannedArea)}</dd></div>
          <div><dt>ทำได้เทียบกับแผน</dt><dd>{percent == null ? '—' : `${format(percent)}%`}</dd></div>
        </dl>
      </div>;
    })}
  </section>;
}
