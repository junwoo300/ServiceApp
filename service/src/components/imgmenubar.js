import './imp-menu.css';

function Imgmenubar(props) {
    const { listmenu } = props;

    return (
        <div className="img-menu-card">
            <a href={listmenu.link} className="img-menu-link" aria-label={listmenu.title}>
                <div className="img-menu-image-wrap">
                    <img src={listmenu.thumnailUrl} alt={listmenu.title} className="img-menu-img hover-effect" />
                </div>
                <div className="img-menu-content">
                    <span className="img-menu-badge">Service</span>
                    <h4 className="img-menu-title">{listmenu.title}</h4>
                </div>
            </a>
        </div>
    );
}

export default Imgmenubar;
