// Header.js
import React from 'react';
import './Header.css';

const Header = () => {
    return (
        <div>
            <header className='header'>
                <h1 className="header-title">App for Service Team</h1>
                <div className="running-light"></div> {/* เพิ่มแถบแสงวิ่ง */}
            </header>
        </div>
    );
}

export default Header;
