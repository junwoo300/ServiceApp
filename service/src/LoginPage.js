import { useState, useEffect, useRef } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('normal');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loginButtonPosition, setLoginButtonPosition] = useState({ top: '50%', left: '50%' });
  const [failCount, setFailCount] = useState(0);
  const modeLocked = useRef(false);
  const buttonRef = useRef(null);

  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'rage') return;

    if (password === 'P@ssw0rd') {
      if (modeLocked.current) return;

      const roll = getRandomInt(0, 99);
      if (roll < 40) {
        setMode('escape');
        modeLocked.current = true;
      } else if (roll < 80) {
        setMode('loading');
        setLoadingProgress(0);
        modeLocked.current = true;
      } else {
        onLogin();
      }
    } else {
      const newFailCount = failCount + 1;
      setFailCount(newFailCount);
      if (newFailCount >= 3) {
        setMode('rage');
        // เพิ่มเอฟเฟกต์ระเบิด
        if (buttonRef.current) {
          buttonRef.current.classList.add('explode');
          setTimeout(() => {
            if (buttonRef.current) {
              buttonRef.current.style.visibility = 'hidden';  // ซ่อนปุ่มหลังจากระเบิด
            }
          }, 600);  // ต้องตรงกับเวลาของอนิเมชัน
        }
      } else {
        alert('รหัสผ่านผิด กรุณาลองใหม่');
      }
    }
  };


  // โหลดจาก 0% ไป 100%
  useEffect(() => {
    if (mode === 'loading') {
      const timer = setInterval(() => {
        setLoadingProgress((prev) => {
          const next = +(prev + 0.1).toFixed(1);
          if (next >= 100) {
            clearInterval(timer);
            return 100;
          }
          return next;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [mode]);

  // ปุ่มหนีจาก mouse hover จริงๆ
  const handleMouseMove = (e) => {
    if (mode === 'escape' && buttonRef.current) {
      const button = buttonRef.current.getBoundingClientRect();
      const distanceX = e.clientX - (button.left + button.width / 2);
      const distanceY = e.clientY - (button.top + button.height / 2);
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < 100) {
        const randTop = getRandomInt(5, 90);
        const randLeft = getRandomInt(5, 90);
        setLoginButtonPosition({ top: `${randTop}%`, left: `${randLeft}%` });
      }
    }
  };

  const handleEscapeClick = () => {
    if (mode === 'escape') {
      onLogin();
    }
  };

  return (
    <div className="page-container" onMouseMove={handleMouseMove}>
      <div className="login-container">
        <h2>Service APP</h2>

        {mode === 'rage' ? (
          <>
            <h3 style={{ color: 'red' }}>ระบบอารมณ์เสีย ลองใหม่พรุ่งนี้!</h3>
          </>
        ) : mode === 'loading' ? (
          <>
            <h3>กำลังโหลด... {loadingProgress.toFixed(1)}%</h3>
          </>
        ) : (
          <>
            <h3>กรุณาใส่รหัสผ่าน </h3>
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                className="login-input"
              />
              <br />
              {mode !== 'escape' && (
                <button ref={buttonRef} type="submit" className="login-button">เข้าสู่ระบบ</button>
              )}
            </form>
          </>
        )}
      </div>

      {mode === 'loading' && (
        <button
          className="login-button"
          onClick={onLogin}
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            fontSize: '12px',  // ปรับขนาดฟอนต์ให้เล็กลง
            opacity: 0.3,      // ลดความโปร่งใสลง
            zIndex: 1000,
            padding: '8px 16px',  // ลด padding
          }}
        >
          เข้าเลย ไม่อยากรอ
        </button>
      )}


      {mode === 'escape' && (
        <button
          ref={buttonRef}
          type="button"
          className="login-button"
          onClick={handleEscapeClick}
          style={{
            position: 'absolute',
            top: loginButtonPosition.top,
            left: loginButtonPosition.left,
            transform: 'translate(-50%, -50%)',
            transition: 'top 0.3s ease, left 0.3s ease',
            width: '200px',
            zIndex: 9999
          }}
        >
          เข้าสู่ระบบ
        </button>
      )}
    </div>
  );
};

export default LoginPage;