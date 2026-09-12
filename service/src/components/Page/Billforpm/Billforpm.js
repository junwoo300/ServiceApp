import { useState } from 'react';
import { api } from '../../../apiClient';

export default function Billforpm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const sendTestMessage = async () => {
    setBusy(true);
    setMessage('');
    try {
      const response = await api.post('/telegram/test');
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่');
    } finally { setBusy(false); }
  };
  return <div>
    <h2>ส่งข้อความไป Telegram</h2>
    <button onClick={sendTestMessage} disabled={busy}>{busy ? 'กำลังส่ง...' : 'ส่งข้อความทดสอบ'}</button>
    {message && <p role="status">{message}</p>}
  </div>;
}
