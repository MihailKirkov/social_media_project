import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Home from '../img/home.png';
import ReactSwitch from 'react-switch';
import English from '../img/english.webp';
import German from '../img/deutsch.webp';
import './Navbar.scss';
import LinkedIn from '../img/linkedin.png';
import Facebook from '../img/facebook.png';
import Instagram from '../img/instagram.png'
import Twitter from '../img/twitter.png';
import YouTube from '../img/youtube.png';
import TikTok from '../img/tiktok.png';
import { useTheme } from '../context/themeContext.js';
import { useLanguage } from '../context/languageContext.js';
import 'primeicons/primeicons.css';
import { AuthContext } from '../context/authContext.js';
import AddPageMenu from '../dialogs/AddPageMenu.jsx';

const Navbar = () => {
  const currentPath = useLocation().pathname;
  const {currentUser} = useContext(AuthContext);
  const [isAddPageMenuVisible, setIsAddPageMenuVisible] = useState(false);

  return (
    <div className='navbar'>
      <div className="link-home">
        <Link className='' to="/"><img src={Home} alt="" /></Link>
      </div>

      {currentPath.startsWith('/social_media/your_posts/') &&
        <div className='page-links'>
          <Link to="/social_media/your_posts/all" className={`link ${currentPath === '/social_media/your_posts/all' ? 'active' : ''}`}>All </Link>
          <Link to="/social_media/your_posts/scheduled" className={`link ${currentPath === '/social_media/your_posts/scheduled' ? 'active' : ''}`}>Scheduled</Link>
          <Link to="/social_media/your_posts/requested" className={`link ${currentPath === '/social_media/your_posts/requested' ? 'active' : ''}`}>Requested</Link>
          <Link to="/social_media/your_posts/posted" className={`link ${currentPath === '/social_media/your_posts/posted' ? 'active' : ''}`}>Posted</Link>
        </div>
      }

      {currentPath.startsWith('/feed') &&
        <div className='socials-links'>
          <Link to="/social_media/your_posts/all" className={`link linkedin ${currentPath === '/social_media/your_posts/all' ? 'active' : ''}`}>
            <img src={LinkedIn} alt="" id="LinkedIn" />
            <label htmlFor="LinkedIn">Ants-In ASKLJD</label>
          </Link>
          <Link to="/social_media/your_posts/scheduled" className={`link facebook ${currentPath === '/social_media/your_posts/scheduled' ? 'active' : ''}`}>
            <img src={Facebook} alt="Facebook"  id="Facebook" />
            <label htmlFor="Facebook">label</label>
          </Link>
          <Link to="/social_media/your_posts/requested" className={`link instagram ${currentPath === '/social_media/your_posts/requested' ? 'active' : ''}`}>
            <img src={Instagram} alt=""  id="Instagram" />
            <label htmlFor="Instagram">label</label>
          </Link>
          <Link to="/social_media/your_posts/posted" className={`link twitter ${currentPath === '/social_media/your_posts/posted' ? 'active' : ''}`}>
            <img src={Twitter} alt=""  id="Twitter" />
            <label htmlFor="Twitter">label</label>
          </Link>
          <Link to="/social_media/your_posts/posted" className={`link youtube ${currentPath === '/social_media/your_posts/posted' ? 'active' : ''}`}>
            <img src={YouTube} alt=""  id="YouTube" />
            <label htmlFor="YouTube">label</label>
          </Link>
          <Link to="/social_media/your_posts/posted" className={`link tiktok ${currentPath === '/social_media/your_posts/posted' ? 'active' : ''}`}>
            <img src={TikTok} alt=""  id="TikTok" />
            <label htmlFor="TikTok">label</label>
          </Link>

          {/* <span className="p-input-icon-left" style={{position:'absolute', right:'50px'}}>
            <i className="pi pi-search" style={{position:'absolute', left:'0', top:'25%'}}/>
            <InputText placeholder="Search" style={{paddingLeft:'20px'}} className="p-inputtext-lg"/>
          </span> */}
          
        </div>
      }
      {(currentUser.role === 'socialmediamanager' || currentUser.role === 'admin')&&
        <div className='flex flex-col' style={{cursor:'pointer'}} onClick={() => setIsAddPageMenuVisible(true)}>
          <i className='pi pi-plus' id="AddPage" style={{width:'40px', height:'40px', paddingTop:'10px'}}></i>
          <label htmlFor="AddPage" style={{top:'0px'}}>Add Page</label>
        </div>
      }
      {isAddPageMenuVisible && 
        <AddPageMenu visible={isAddPageMenuVisible} setVisible={setIsAddPageMenuVisible}/>
      }
    </div>
  );
}

export default Navbar;
