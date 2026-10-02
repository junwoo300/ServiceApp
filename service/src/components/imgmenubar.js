import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';

export default function Imgmenubar({ listmenu }) {
  const { title, link, icon: Icon, description } = listmenu;

  return (
    <Link to={link} className="workspace-module">
      <span className="module-icon"><Icon aria-hidden="true" /></span>
      <FiArrowUpRight className="module-arrow" aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="module-open">เปิดรายการ <span aria-hidden="true">→</span></span>
    </Link>
  );
}
