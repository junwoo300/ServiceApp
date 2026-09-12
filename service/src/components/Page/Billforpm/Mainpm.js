import React from "react";
import { useNavigate } from "react-router-dom";
import "./Mainpm.css";

const menuItems = [
  { name: "แจ้งเตือนวางบิล", path: "/BillList" },
  { name: "อื่นๆ", path: "/Billforpm" }
];

const Mainpm = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className='Mainpm-home'>
        <a href='/'>
          <img src="/imagenakub/home.png" alt="Home" />
        </a>
     
    <div className="pm-container">
        
      <div className="pm-card">
        <div className="pm-menu">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="pm-menu-item"
              onClick={() => handleNavigate(item.path)}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Mainpm;
