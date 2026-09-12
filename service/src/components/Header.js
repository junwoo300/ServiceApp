import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiCalendar } from 'react-icons/fi';

export default function Header() {
  const { pathname } = useLocation();
  const path = pathname.toLowerCase();
  const section = /onsite|employee|equipment|graphonsite/.test(path) ? 'งาน Onsite'
    : /pma|maintenance/.test(path) ? 'สัญญาและบำรุงรักษา'
    : /projectfix|howtofix|casesupport/.test(path) ? (path.includes('casesupport') ? 'Case Support' : 'Knowledge')
    : /robot/.test(path) ? 'Robot' : /camera|projects|site\//.test(path) ? 'Camera'
    : /doc|draft/.test(path) ? 'เอกสาร' : /bill|mainpm/.test(path) ? 'งาน PM'
    : /wherehouse|edit\//.test(path) ? 'คลังอุปกรณ์' : path === '/chat' ? 'ผู้ช่วย AI' : 'ภาพรวม';
  return <header className="workspace-header">
    <div className="breadcrumb"><Link to="/">Workspace</Link><FiChevronRight /><span>{section}</span></div>
    <div className="header-date"><FiCalendar /><span>{new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' }).format(new Date())}</span></div>
  </header>;
}
