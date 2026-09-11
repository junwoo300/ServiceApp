import React from 'react'
import Datamenu from '../data/Datamenu';
import Imgmenubar from './imgmenubar';
import './Menulist.css';

const todayOnsite = {
  label: 'Today Onsite',
  value: '15',
  caption: 'ครั้งวันนี้'
};

const Menulist = () => {

    const listElements = Datamenu.filter((listmenu) => {
        return listmenu.title
    
      }).map((listmenu, index) => {
        return <Imgmenubar key={index} listmenu={listmenu} />;
    
      });


  return (
    <div className="home-dashboard">
      <div className="dashboard-hero single-kpi-hero">
        <div className="hero-copy">
          <span className="eyebrow">Operations Overview</span>
          <h2>Service dashboard</h2>
          <p>ติดตามงานออนไซต์ในวันนี้แบบกระชับและเข้าใจง่าย</p>
        </div>

        <div className="today-kpi-panel">
          <div className="today-kpi-header">
            <span>{todayOnsite.label}</span>
            <strong>Today</strong>
          </div>
          <div className="today-kpi-value">{todayOnsite.value}</div>
          <div className="today-kpi-caption">{todayOnsite.caption}</div>
        </div>
      </div>

      <div className="app-grid"> 
        {listElements}
      </div>
    </div>
  )
}

export default Menulist