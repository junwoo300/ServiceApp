import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiPackage, FiCalendar, FiCamera, FiCpu, FiFileText, FiBookOpen, FiClipboard, FiMapPin, FiHeadphones } from 'react-icons/fi';
const icons = [FiPackage, FiCalendar, FiCamera, FiCpu, FiFileText, FiBookOpen, FiClipboard, FiMapPin, FiHeadphones];
const descriptions = ['ตรวจสอบรายการและจัดการอุปกรณ์ในคลัง', 'สัญญาบริการและแผนบำรุงรักษา', 'โปรเจกต์ ไซต์งาน และอุปกรณ์กล้อง', 'ทะเบียนหุ่นยนต์และประวัติการซ่อม', 'เอกสารและแบบฟอร์มสำหรับทีม', 'ค้นหาวิธีแก้ปัญหาและความรู้จากงานจริง', 'ติดตามรายการงานและบิลบำรุงรักษา', 'บันทึกหน้างาน ทีมงาน และค่าใช้จ่าย', 'เปิดเคส ติดตามสถานะ และดูผู้รับผิดชอบ'];
export default function Imgmenubar({ listmenu, index = 0 }) {
  const Icon = icons[index] || FiPackage;
  return <Link to={listmenu.link} className="workspace-module">
    <span className="module-icon"><Icon /></span><FiArrowUpRight className="module-arrow" />
    <h3>{listmenu.title}</h3><p>{descriptions[index]}</p><span className="module-open">เปิดรายการ <span aria-hidden="true">→</span></span>
  </Link>;
}
