import {
  FiPackage, FiCalendar, FiCamera, FiCpu, FiFileText,
  FiBookOpen, FiClipboard, FiMapPin, FiHeadphones, FiUsers,
} from 'react-icons/fi';

const Datamenu = [
  {
    title: "จัดการคลัง Service",
    icon: FiPackage,
    description: "ตรวจสอบรายการและจัดการอุปกรณ์ในคลัง",
    link: "/Wherehouse"
  },
  {
    title: "ระบบ PMA Service",
    icon: FiCalendar,
    description: "สัญญาบริการและแผนบำรุงรักษา",
    link: "/pmapage"
  },
  {
    title: "รายการ Intrusion Camera",
    icon: FiCamera,
    description: "โปรเจกต์ ไซต์งาน และอุปกรณ์กล้อง",
    link: "/CameraProlist"
  },
  {
    title: "จัดการ Robot",
    icon: FiCpu,
    description: "ทะเบียนหุ่นยนต์และประวัติการซ่อม",
    link: "/Menurobotlist"
  },
  {
    title: "เอกสาร Document",
    icon: FiFileText,
    description: "เอกสารและแบบฟอร์มสำหรับทีม",
    link: "/Menudoc"
  },
  {
    title: "ความรู้ Knowledge Hub",
    icon: FiBookOpen,
    description: "ค้นหาวิธีแก้ปัญหาและความรู้จากงานจริง",
    link: "/Projectfix"
  },
  {
    title: "ระบบงาน PM",
    icon: FiClipboard,
    description: "ติดตามรายการงานและบิลบำรุงรักษา",
    link: "/Mainpm"
  },
  {
    title: "ระบบ ONSITE",
    icon: FiMapPin,
    description: "บันทึกหน้างาน ทีมงาน และค่าใช้จ่าย",
    link: "/Onsite"
  },
  {
    title: "ระบบ Case Support",
    icon: FiHeadphones,
    description: "เปิดเคส ติดตามสถานะ และดูผู้รับผิดชอบ",
    link: "/CaseSupport"
  },
  {
    title: "จัดการพนักงาน",
    icon: FiUsers,
    description: "ดูรายชื่อ แก้ไขข้อมูล และอัตราค่าแรงพนักงาน",
    link: "/Employee"
  },
];

export default Datamenu;
