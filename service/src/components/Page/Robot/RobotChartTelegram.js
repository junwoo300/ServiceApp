import React, { useRef, useState } from 'react';
import { api } from '../../../apiClient';
import { buildSiteChartImages } from './robotSiteChartImage';

export default function RobotChartTelegram({ date, endDate }) {
  const busy = useRef(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function send() {
    if (busy.current) return;
    busy.current = true; setSending(true); setMessage(''); setError('');
    let uploading = false;
    try {
      const { data } = await api.get('/robot-telemetry', { params: { date, endDate }, timeout: 90000 });
      const images = await buildSiteChartImages(data, date, endDate);
      const form = new FormData();
      form.append('date', date); form.append('endDate', endDate);
      images.forEach((blob, index) => form.append('photos', blob, `sites-${index + 1}.png`));
      uploading = true;
      const response = await api.post('/robot-chart-telegram', form, { timeout: 90000 });
      setMessage(`${response.data.message} · วันที่ ${date}${date !== endDate ? ` ถึง ${endDate}` : ''}`);
    } catch (err) {
      setError(err.response?.data?.message || (uploading
        ? 'ยืนยันผลการส่งไม่ได้ กรุณาตรวจสอบในกลุ่ม Telegram ก่อนกดส่งใหม่'
        : 'สร้างกราฟไม่สำเร็จ กรุณาลองใหม่ ยังไม่ได้ส่งเข้า Telegram'));
    } finally { busy.current = false; setSending(false); }
  }
  return <div className="rs-summary">
    <button type="button" className="rs-refresh" disabled={sending} onClick={send}>
      {sending ? 'กำลังสร้างและส่งกราฟ…' : 'ส่งกราฟทุกไซต์เข้า Telegram'}
    </button>
    <p>ส่งยอดพื้นที่จริงเทียบแผนรวมรายไซต์ ตามช่วงวันที่ที่เลือก ครบทุกไซต์ ไม่ขึ้นกับตัวกรอง · ส่งเข้ากลุ่มรายงานหุ่นยนต์ที่ตั้งค่าไว้</p>
    {message && <p role="status">{message}</p>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
