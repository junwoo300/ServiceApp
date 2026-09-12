// Menurobotlist.js
import React from "react";
import "./Menurobotlist.css";

const menus = [
  { id: 4, title: "สถานะหุ่นยนต์", description: "Online / Offline และผลงานรายวัน", image: "/imagenakub/bot.png", link: "/RobotStatus" },
  { id: 1, title: "Stock Robot ", description: "คลังหุ่น", image: "/imagenakub/bot.png", link: "/Robotwarehouse" },
  { id: 2, title: "Stock อุปกรณ์", description: "คลังอุปกรณ์", image: "/imagenakub/cleanbot.png", link: "/menu2" },
  { id: 3, title: "Chart Robot", description: "กราฟหุ่นยนต์", image: "/imagenakub/graphrobot.png", link: "/RobotChart" },
];

const Menurobotlist = () => {
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
            <a href={menu.link} className="robot-menu-link">
              <img src={menu.image} alt={menu.title} className="robot-menu-image" />
              <h3 className="robot-menu-title">{menu.title}</h3>
              <p className="robot-menu-description">{menu.description}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menurobotlist;
