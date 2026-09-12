import { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import FormProduct from './components/FormProduct';
import FormEditProduct from './components/FormEditProduct';
import Header from './components/Header';
import Menulist from './components/Menulist';
import Adddata from './components/Page/Warehouse/adddata';


import Pmapage from './components/Page/PMA/pmapage';
import AddPma from './components/Page/PMA/AddPma';
import EditPma from './components/Page/PMA/EditPma';
import PmaList from './components/Page/PMA/PmaList';


import MenuCamera from './components/Page/Camera/MenuCamera';
import CameraProlist from './components/Page/Camera/CameraProlist';

import ImageUploader from './components/Page/Workschedule/ImageUploader';

import PmMaintenanceList from './components/Page/PMA/PmMaintenanceList';
import AddPmMaintenance from './components/Page/PMA/AddPmMaintenance';
import SiteDetails from './components/Page/Camera/SiteDetails';
import DeviceDetails from './components/Page/Camera/DeviceDetails';

//robot
import Menurobotlist from './components/Page/Robot/Menurobotlist';
import Robotwarehouse from './components/Page/Robot/Robotwarehouse';
import RobotChart from './components/Page/Robot/RobotChart';
import RobotStatus from './components/Page/Robot/RobotStatus';

//Doc
import Menudoc from './components/Page/Document/Menudoc';
import DraftList from './components/Page/Document/DraftList';

//chatbot
import Chat from './components/Page/Chatbot/Chat';


//projectfix การแก้ไขเคส
import Projectfix from './components/Page/Knowledge/Projectfix';
import Casefix from './components/Page/Knowledge/casefix';
import Howtofix from './components/Page/Knowledge/howtofix';

//Billforpm
import Billforpm from './components/Page/Billforpm/Billforpm';
import BillList from './components/Page/Billforpm/BillList';
import Mainpm from './components/Page/Billforpm/Mainpm';


//Onsite
import Onsite from './components/Page/Onsite/Onsite';
import OnsiteDashboard from './components/Page/Onsite/OnsiteDashboard';
import EquipmentDashboard from './components/Page/Onsite/EquipmentDashboard';
import Employee from './components/Page/Onsite/Employee';
import Siteonsite from './components/Page/Onsite/Siteonsite';
import GraphOnsite from './components/Page/Onsite/Graphonsite';
import ImportOnsite from './components/Page/Onsite/ImportOnsite';
import CaseSupport from './components/Page/CaseSupport/CaseSupport';

import LoginPage from './LoginPage';
import { api } from './apiClient';
import { FiGrid, FiPackage, FiCalendar, FiCamera, FiCpu, FiFileText, FiBookOpen, FiClipboard, FiMapPin, FiHeadphones, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Service APP🛠️";

    // เช็กว่าเคยล็อกอินหรือยังจาก sessionStorage
    let active = true;
    sessionStorage.removeItem('isAuthenticated');
    const expire = () => setIsAuthenticated(false);
    window.addEventListener('session-expired', expire);
    api.get('/auth/session')
      .then(() => { if (active) setIsAuthenticated(true); })
      .catch(() => { if (active) setIsAuthenticated(false); })
      .finally(() => { if (active) setCheckingSession(false); });
    return () => { active = false; window.removeEventListener('session-expired', expire); };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setIsAuthenticated(false);
    } catch {
      alert('ออกจากระบบไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const navItems = [
    { label: 'ภาพรวม', path: '/', icon: FiGrid, group: 'WORKSPACE' },
    { label: 'งาน Onsite', path: '/Onsite', icon: FiMapPin, group: 'งานบริการ' },
    { label: 'Case Support', path: '/CaseSupport', icon: FiHeadphones },
    { label: 'งาน PM', path: '/Mainpm', icon: FiClipboard },
    { label: 'สัญญา PMA', path: '/pmapage', icon: FiCalendar },
    { label: 'คลังอุปกรณ์', path: '/Wherehouse', icon: FiPackage, group: 'อุปกรณ์และระบบ' },
    { label: 'Camera', path: '/CameraProlist', icon: FiCamera },
    { label: 'Robot', path: '/Menurobotlist', icon: FiCpu },
    { label: 'เอกสาร', path: '/Menudoc', icon: FiFileText, group: 'แหล่งข้อมูล' },
    { label: 'Knowledge', path: '/Projectfix', icon: FiBookOpen },
  ];

  if (checkingSession) return <div className="page-container">กำลังตรวจสอบการเข้าสู่ระบบ...</div>;
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className={`admin-shell${menuOpen ? ' menu-open' : ''}`}>
        <a className="skip-link" href="#main-content">ข้ามไปยังเนื้อหา</a>
        {menuOpen && <button className="sidebar-backdrop" aria-label="ปิดเมนู" onClick={() => setMenuOpen(false)} />}
        <aside className="admin-sidebar" id="main-navigation">
          <div className="brand-block">
            <div className="brand-mark"><FiGrid /></div>
            <div>
              <div className="brand-name">Service APP</div>
              <div className="brand-subtitle">TEAM WORKSPACE</div>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="เมนูหลัก">
            {navItems.map(({ label, path, icon: Icon, group }) => (
              <div key={path}>
              {group && <div className="nav-group-label">{group}</div>}
              <NavLink
                key={label}
                to={path}
                end={path === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon aria-hidden="true" />
                {label}
              </NavLink>
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="workspace-label"><span className="workspace-avatar">ST</span><div><strong>Service Team</strong><small>พื้นที่ทำงานของทีม</small></div></div>
            <button type="button" onClick={handleLogout}><FiLogOut /> ออกจากระบบ</button>
          </div>
        </aside>

        <div className="app-main-panel">
          <div className="app-topbar">
            <button type="button" className="menu-toggle" aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <FiX /> : <FiMenu />}</button>
            <Header />
          </div>

          <main className="content-area" id="main-content" tabIndex={-1}>
            <Routes>
              <Route path='/' element={<Menulist />} />
              <Route path='/Wherehouse' element={<FormProduct />} />
              <Route path='/edit/:id' element={<FormEditProduct />} />
              <Route path='Wherehouse/adddata' element={<Adddata />} />
              <Route path='pmapage' element={<Pmapage />} />
              <Route path='calendar' element={<ImageUploader />} />

              <Route path='PmaList' element={<PmaList />} />
              <Route path='AddPma' element={<AddPma />} />
              <Route path="/edit-pma/:id" element={<EditPma />} />

              <Route path='/pma-info/:id' element={<PmMaintenanceList />} />
              <Route path='/add-pm-maintenance/:id' element={<AddPmMaintenance />} />

              <Route path="MenuCamera" element={<MenuCamera />} />
              <Route path="CameraProlist" element={<CameraProlist />} />
              <Route path="/projects/:projectId/sites" element={<SiteDetails />} />
              <Route path="/site/:siteId" element={<DeviceDetails />} />


              <Route path='Menurobotlist' element={<Menurobotlist />} />
              <Route path='Robotwarehouse' element={<Robotwarehouse />} />
              <Route path='RobotChart' element={<RobotChart />} />
              <Route path='RobotStatus' element={<RobotStatus />} />


              <Route path='Menudoc' element={<Menudoc />} />
              <Route path='DraftList' element={<DraftList />} />

              <Route path="/chat" element={<Chat />} />

              <Route path="/Projectfix" element={<Projectfix />} />
              <Route path="/CaseSupport" element={<CaseSupport />} />
              <Route path="/projectfix/:projectId" element={<Casefix />} />
              <Route path="/howtofix/:casefixId" element={<Howtofix />} />


              <Route path="/Billforpm" element={<Billforpm />} />
              <Route path="/BillList" element={<BillList />} />
              <Route path="/Mainpm" element={<Mainpm />} />


              <Route path="/Onsite" element={<Onsite />} />
              <Route path="/OnsiteDashboard" element={<OnsiteDashboard />} />
              <Route path="/EquipmentDashboard" element={<EquipmentDashboard />} />
              <Route path="/Employee" element={<Employee />} />
              <Route path="/Siteonsite" element={<Siteonsite />} />
              <Route path="/GraphOnsite" element={<GraphOnsite />} />
              <Route path="/ImportOnsite" element={<ImportOnsite />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
