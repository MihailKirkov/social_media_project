import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import axios from 'axios'
import DefaultImg from '../img/user.png'
import Dashboard from '../img/dashboard.png'
import Settings  from '../img/setting.png'
import Logout  from '../img/logout.png'
import Manage from "../img/manage.png"
import CreateGroup from "../img/creategroup.png"
import Feed from "../img/feed.png"
import CreatePost from "../img/create_post.png"
import DataManagement from "../img/data_management.png"
import SocialMedia from "../img/social_media.png"
import Admin from "../img/admin.png"
import { AuthContext } from '../context/authContext'
import { useLanguage } from '../context/languageContext.js';
import './sidebar.scss';
import Write from './Write.jsx'

const Sidebar = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const { currentLanguage } = useLanguage();
    const { workspace } = useParams();
    console.log('ws: ', workspace)

    const [activeMenu, setActiveMenu] = useState(null);
    const [userGroups, setUserGroups] = useState([]);

    const userId = currentUser.id;
    
    
    const translations = {
        yourGroups : (currentLanguage === 'english'? 'Your Groups' : 'Ihre Gruppen'),
        createNewGroup: (currentLanguage === 'english'? 'Create New Group' : 'Neue Gruppe Erstellen'),
        manageGroups: (currentLanguage === 'english'? 'Manage Groups' : 'Gruppen Verwalten'),
        profileSettings: (currentLanguage === 'english'? 'Profile Settings' : 'Profileinstellungen'),
        logout: (currentLanguage === 'english'? 'Logout' : 'Abmelden')
    }

    const [isWriteVisible, setWriteVisible] = useState(false);

    

    useEffect(()=>{
        const fetchData = async () => {
            try {
                const res_groups = await axios.get(`http://localhost:8800/api/groups/user_groups/${userId}`); // get user's groups data
                setUserGroups(res_groups.data.sort((a,b) => a.name.localeCompare(b.name))) // saving userGroups sorted by group's name
            }
            catch(err) {
                console.error('Error fetching user groups:', err);
            }
        }
        fetchData();
    }, [userId, currentUser.img]);

    const handleMenuShown = (menuId) => {
        setActiveMenu(menuId === activeMenu ? null : menuId);
    }
    // console.log("user groups: ", userGroups)
    const openWrite = () => {
        setWriteVisible(true);
    };

    const closeWrite = () => {
        console.log('close write');
        setWriteVisible(false);
    };

    return (
        <div className='sidebar'>
            <div className="top-icons">
                <div className="user">
                    <Link to="/profile_settings"><img className='user' src={currentUser.img !== null && currentUser.img.length > 0 ? `/upload/${currentUser.img}` : DefaultImg} alt="User"/></Link>
                </div>
                <div className="links">
                    <button onClick={() => handleMenuShown('feedMenu')}  style={{ '--alt-content': 'Feed' }}><img src={Feed} alt="Feed" /></button>
                    <button onClick={() => isWriteVisible? closeWrite() : openWrite()}><img src={CreatePost} alt="Create Post" /></button>
                    <button onClick={() => handleMenuShown('dataManagementMenu')}><img src={DataManagement} alt="Data Management" /></button>
                    {(currentUser?.role === 'socialmediamanager' || currentUser?.role === 'socialmediaadmin' || currentUser?.role === 'admin' || currentUser?.role === 'superadmin') &&
                        <button onClick={() => handleMenuShown('socialMediaMenu')}><img src={SocialMedia} alt="Social Media" /></button>
                    }
                </div>
            </div>

            <div className='bottom-icons'>
                {currentUser.role === "admin" && 
                    <button onClick={() => handleMenuShown('adminMenu')}><img src={Admin} alt="Admin" /></button>
                }
                <button onClick={logout}><img src={Logout} alt="Logout"/></button>
            </div>

            <div className={`menu-container ${activeMenu !== null ? 'show' : ''}`}>
                <button className='button-close' onClick={() => handleMenuShown(null)}>&times;</button>
                <div className={`menu ${activeMenu === 'feedMenu' ? 'show' : ''}`} id="feedMenu">
                    <Link to={`/${workspace}/feed`} className='link'><h2>Global Posts</h2></Link>
                    {userGroups.map((group)=>(
                        <div className="user-groups" key={group.group_id}>
                            <Link to={`/${workspace}/feed/group/${group.name}`} className='link'><h2>{group.name}</h2></Link>
                        </div>
                    ))}
                </div>
                <div className={`menu ${activeMenu === 'dataManagementMenu' ? 'show' : ''}`} id="dataManagementMenu">
                    <Link to={`/${workspace}/your_posts/${userId}`} className='link'><h2>Manage Your Posts</h2></Link>
                    <Link to={`/${workspace}/profile_settings`} className='link'><h2>Edit Your Profile</h2></Link>
                </div>
                <div className={`menu ${activeMenu === 'socialMediaMenu' ? 'show' : ''}`} id="socialMediaMenu">
                    <Link to={`/${workspace}/social_media/your_posts/all`} className='link'><h2>Your Social Media Posts</h2></Link>
                    {userGroups.map((group)=>(
                        <div className="user-groups" key={group.group_id}>
                            <Link to={`/${workspace}/social_media/group_posts/${group.name}`} className='link'><h2>{group.name} Socials</h2></Link>
                        </div>
                    ))}
                </div>
                <div className={`menu ${activeMenu === 'adminMenu' ? 'show' : ''}`} id="adminMenu">
                    <Link className='link'><h2>Post Confirmations</h2></Link>
                    <Link to="/manage_groups" className='link'><h2>Manage Groups</h2></Link>
                    <Link className='link'><h2>Manage Users</h2></Link>
                    <Link to="/create_group" className='link'><h2>Create New Group</h2></Link>
                    <Link className='link'><h2>Media Library</h2></Link>
                </div>
            </div>
            {isWriteVisible && <Write onClose={() => closeWrite()} />}
        </div>
    )
}

export default Sidebar