// Onsite.js
import React from "react";
import "./Onsite.css";

const menus = [
  {
    id: 1,
    title: "Dashboard Onsite",
    description: "ตรวจสอบข้อมูลหน้างานแบบเรียลไทม์",
    image: "/imagenakub/dashborad.png",
    link: "/OnsiteDashboard",
  },
  {
    id: 2,
    title: "จัดการอุปกรณ์",
    description: "เพิ่ม ลบ แก้ไขสถานะอุปกรณ์ที่ใช้งาน",
    image: "/imagenakub/equipment.png",
    link: "/EquipmentDashboard",
  },
  {
    id: 3,
    title: "จัดการพนักงาน",
    description: "ตรวจสอบรายชื่อและประสิทธิภาพของทีม",
    image: "/imagenakub/human.png",
    link: "/Employee",
  },
   {
    id: 4,
    title: "จัดการไซต์งาน",
    description: "จัดการไซต์งานปรับค่าเดินทาง",
    image: "/imagenakub/location.png",
    link: "/Siteonsite",
  },
  {
    id: 5,
    title: "กราฟออนไซต์",
    description: "กราฟแสดงผล",
    image: "/imagenakub/graph.png",
    link: "/GraphOnsite",
  },
];

const Onsite = () => {
  return (
    <div className="onsite-menu-wrapper">
      {/* ปุ่มกลับหน้า Home */}
      <div className="onsite-home-container">
        <a href="/" className="onsite-home-link" aria-label="กลับหน้าแรก">
          <img
            src="/imagenakub/home.png"
            alt="Home"
            className="onsite-home-icon"
          />
        </a>
      </div>

      {/* เมนูหลัก */}
      <div className="onsite-menu-container">
        {menus.map((menu) => (
          <div className="onsite-menu-item" key={menu.id}>
            <a href={menu.link} className="onsite-menu-link">
              <img
                src={menu.image}
                alt={menu.title}
                className="onsite-menu-image"
              />
              <h3 className="onsite-menu-title">{menu.title}</h3>
              <p className="onsite-menu-description">{menu.description}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Onsite;
