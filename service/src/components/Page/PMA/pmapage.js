import React from 'react';
import { Link } from 'react-router-dom';
import './pmapage.css';

const PmaPage = () => {
    return (
        <div>
            <div>
                <br/>
                <div className='pmapage-home'>
                    <a href='/'>
                        <img src="/imagenakub/home.png" alt="Home" />
                    </a>
                </div>
                <center><h1>ระบบเตือน PMA</h1></center>
            </div>
            <div className="image-links">
                <a href="https://script.google.com/home/projects/1ZtXNN23Ch8u2t7Jc9lJGJ2lsyp8zWI5vml78hrHF3GC6ejE-OYlutCXT/edit" target="_blank" rel="noopener noreferrer">
                    <div className="image-item">
                        <img src="/imagenakub/codeing.jpg" alt="Image 1" />
                        <p>Coding</p>
                    </div>
                </a>
                <a href="https://calendar.google.com/calendar/u/0/r/month" target="_blank" rel="noopener noreferrer">
                    <div className="image-item">
                        <img src="/imagenakub/googlecen.png" alt="Image 2" />
                        <p>ปฎิทิน เพิ่ม PMA</p>
                    </div>
                </a>
                <a href="PmaList">
                    <div className="image-item">
                        <img src="/imagenakub/microteam.png" alt="Image 3" />
                        <p>PMA ALL</p><br/><br/><br/><br/> 
                    </div>
                </a>
                
            </div>
            <div><center> ปฎิทินแสดง PMA </center><br/></div>
            <div className="iframe-container">
                <iframe
                    title="Google Calendar"
                    src="https://calendar.google.com/calendar/embed?src=fcf1b555cd562b6fe12746941dff84676ac067c2c17d1e7326ef534234c3fe28%40group.calendar.google.com&ctz=Asia%2FBangkok"
                    width="900"
                    height="500"
                    frameBorder="0"  
                    scrolling="no"
                    style={{ margin: '0 auto', display: 'block' }}
                />
            </div>
            
        </div>
        
    );
}

export default PmaPage;
