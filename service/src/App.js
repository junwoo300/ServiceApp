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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.title = "Service APP🛠️";

    // เช็กว่าเคยล็อกอินหรือยังจาก sessionStorage
    const loggedIn = sessionStorage.getItem('isAuthenticated');
    if (loggedIn === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true'); // บันทึกลง sessionStorage
  };

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Warehouse', path: '/Wherehouse' },
    { label: 'PMA', path: '/pmapage' },
    { label: 'Camera', path: '/CameraProlist' },
    { label: 'Robot', path: '/Menurobotlist' },
    { label: 'Document', path: '/Menudoc' },
    { label: 'Knowledge', path: '/Projectfix' },
    { label: 'PM', path: '/Mainpm' },
    { label: 'Onsite', path: '/Onsite' },
    { label: 'Case Support', path: '/CaseSupport' },
  ];

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="brand-block">
            <div className="brand-mark">S</div>
            <div>
              <div className="brand-name">Service APP</div>
              <div className="brand-subtitle">Operations Hub</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(({ label, path }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-dot" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="mini-stat">
              <span>Live</span>
              <strong>24/7</strong>
            </div>
          </div>
        </aside>

        <div className="app-main-panel">
          <Header />

          <main className="content-area">
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