import { Link } from 'react-router-dom';
import { FiArrowRight, FiPlus, FiMapPin, FiBookOpen } from 'react-icons/fi';
import Datamenu from '../data/Datamenu';
import Imgmenubar from './imgmenubar';

export default function Menulist() {
  return <div className="workspace-dashboard">
    <div className="dashboard-heading"><div><span className="overline">SERVICE OPERATIONS</span><h1>ทุกงานของทีม อยู่ที่เดียว</h1><p>จัดการงานบริการ อุปกรณ์ และความรู้ เริ่มต้นงานที่ต้องทำได้จากที่นี่</p></div><Link className="primary-link" to="/CaseSupport"><FiPlus /> จัดการเคสงานบริการ</Link></div>
    <section className="dashboard-feature">
      <div><span className="overline">YOUR DAILY WORKSPACE</span><h2>พร้อมสำหรับงานถัดไป</h2><p>เปิดรายการ Onsite เพื่อตรวจงานและค่าใช้จ่าย<br />หรือค้นหาวิธีแก้ปัญหาจากประสบการณ์ของทีม</p><Link to="/OnsiteDashboard">ดูรายการงาน Onsite <FiArrowRight /></Link></div>
      <div className="feature-shortcuts"><Link to="/OnsiteDashboard"><FiMapPin /><span><strong>งานหน้างาน</strong><small>ไซต์งานและบันทึกการให้บริการ</small></span><FiArrowRight /></Link><Link to="/Projectfix"><FiBookOpen /><span><strong>คลังความรู้ของทีม</strong><small>โปรเจกต์ เคส และวิธีแก้ไข</small></span><FiArrowRight /></Link></div>
    </section>
    <div className="module-section-title"><div><h2>เครื่องมือสำหรับทีม</h2><p>เลือกพื้นที่ทำงานที่ต้องการ</p></div><span>{Datamenu.length} หมวดงาน</span></div>
    <div className="workspace-modules">{Datamenu.map((menu, index) => <Imgmenubar key={menu.link} listmenu={menu} index={index} />)}</div>
  </div>;
}
