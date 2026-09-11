import React from "react";
import "./Menudoc.css";

const menus = [
  { id: 1, title: "พิมพ์ใบ OT", description: "ปริ้นได้", image: "/imagenakub/ot.png", link: "https://docs.google.com/forms/d/1TAjV1gQtVGQ2g78Zl9Nkj9EElLrei18tfkfZ_Ab7afQ/prefill" },
  { id: 2, title: "พิมพ์ใบ Work", description: "ปริ้นได้", image: "/imagenakub/onsite.png", link: "https://docs.google.com/forms/d/1TT32PP5WOFsrpCV7gSKtHmOXyq5XlG__HGWuK7E-0zE/prefill" },
  { id: 3, title: "ระบบร่างเมล", description: "ร่างเมลให้ตามไซต์งานที่เลือก", image: "/imagenakub/outlook.png", link: `/DraftList` },
  
];

const Menudoc = () => {
  return (
    <div className="robot-menu-wrapper">
      {/* ปุ่มกลับหน้า Home แยกออกจากเมนู */}
      <div className="robot-home-container">
        <a href="/" className="robot-home-link">
          <img src="/imagenakub/home.png" alt="Home" className="robot-home-icon" />
        </a>
      </div>

      {/* รายการเมนู */}
      <div className="robot-menu-container">
        {menus.map((menu) => (
          <div className="robot-menu-item" key={menu.id}>
            {/* ตรวจสอบว่าเป็นลิงก์ภายนอกหรือไม่ ถ้าใช่ให้เปิดในแท็บใหม่ */}
            {menu.link.startsWith("http") ? (
              <a href={menu.link} className="robot-menu-link" target="_blank" rel="noopener noreferrer">
                <img src={menu.image} alt={menu.title} className="robot-menu-image" />
                <h3 className="robot-menu-title">{menu.title}</h3>
                <p className="robot-menu-description">{menu.description}</p>
              </a>
            ) : (
              <a href={menu.link} className="robot-menu-link">
                <img src={menu.image} alt={menu.title} className="robot-menu-image" />
                <h3 className="robot-menu-title">{menu.title}</h3>
                <p className="robot-menu-description">{menu.description}</p>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menudoc;
