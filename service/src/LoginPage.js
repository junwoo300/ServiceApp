import { useState } from 'react';
import { api } from './apiClient';
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await api.post('/auth/login', { password });
      setPassword('');
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page-container">
      <div className="login-intro"><span className="login-brand">S / SERVICE APP</span><h1>พื้นที่ทำงาน<br />สำหรับทีมบริการ</h1><p>ติดตามงาน จัดการอุปกรณ์ และแบ่งปันความรู้<br />เพื่อให้งานทุกวันเดินหน้าได้ง่ายขึ้น</p><span className="login-caption">ONE TEAM. ONE WORKSPACE.</span></div>
      <div className="login-container">
        <span className="overline">WELCOME BACK</span>
        <h2>เข้าสู่พื้นที่ทำงาน</h2>
        <p className="login-description">ใช้รหัสผ่านของทีมเพื่อเริ่มต้นใช้งาน</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="password">รหัสผ่าน</label>
          <input id="password" type="password" autoComplete="current-password"
            value={password} onChange={event => setPassword(event.target.value)}
            className="login-input" required maxLength={256} disabled={busy} />
          {error && <p role="alert" className="login-error">{error}</p>}
          <button type="submit" className="login-button" disabled={busy}>
            {busy ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}
