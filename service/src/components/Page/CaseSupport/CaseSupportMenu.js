import React from 'react';
import { Link } from 'react-router-dom';
import '../Onsite/Onsite.css';

const menus = [
  { title: 'Dashboard Case Support', description: 'เปิดเคส ติดตามสถานะ และจัดการงานบริการ', image: '/imagenakub/dashborad.png', link: '/CaseSupport/dashboard' },
  { title: 'จัดการหัวข้อ', description: 'เพิ่ม แก้ไข และลบหัวข้อสำหรับเปิดเคส', image: '/imagenakub/doc.png', link: '/CaseSupport/subjects' },
  { title: 'จัดการประเภท', description: 'เพิ่ม แก้ไข และลบประเภทงานบริการ', image: '/imagenakub/equipment.png', link: '/CaseSupport/types' },
];

export default function CaseSupportMenu() {
  return (
    <div className="onsite-menu-wrapper">
      <div className="onsite-home-container">
        <Link to="/" className="onsite-home-link" aria-label="กลับหน้าแรก">
          <img src="/imagenakub/home.png" alt="" className="onsite-home-icon" />
        </Link>
      </div>
      <div className="onsite-menu-container">
        {menus.map(menu => (
          <div className="onsite-menu-item" key={menu.link}>
            <Link to={menu.link} className="onsite-menu-link">
              <img src={menu.image} alt="" className="onsite-menu-image" />
              <h3 className="onsite-menu-title">{menu.title}</h3>
              <p className="onsite-menu-description">{menu.description}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
