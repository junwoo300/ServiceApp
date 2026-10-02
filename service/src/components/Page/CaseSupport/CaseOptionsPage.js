import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CaseOptionManager from './CaseOptionManager';
import './CaseSupport.css';

export default function CaseOptionsPage({ kind }) {
  const [options, setOptions] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    axios.get(`${process.env.REACT_APP_API}/case-support-options`)
      .then(response => { if (active) setOptions(response.data); })
      .catch(() => { if (active) setError('ไม่สามารถโหลดรายการได้ กรุณาลองใหม่'); });
    return () => { active = false; };
  }, [attempt]);

  return (
    <div className="case-support-page">
      <Link to="/CaseSupport" className="case-support-back-link">← กลับเมนู Case Support</Link>
      {error ? <div className="case-support-error" role="alert">{error} <button onClick={() => setAttempt(value => value + 1)}>ลองใหม่</button></div>
        : !options ? <p>กำลังโหลดข้อมูล...</p>
          : <CaseOptionManager key={kind} kind={kind} options={options} onUpdate={setOptions} embedded />}
    </div>
  );
}
