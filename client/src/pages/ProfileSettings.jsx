import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/authContext';
import Edit from '../img/edit.png';
import Delete from '../img/delete.png';
import DefaultImg from '../img/user.png'
import axios from 'axios';
import LinkedIn from '../img/linkedin.png';
import Facebook from '../img/facebook.png';
import Instagram from '../img/instagram.png';
import YouTube from '../img/youtube.png';
import TikTok from '../img/tiktok.png';
import './profile_settings.scss'
import {Dialog} from 'primereact/dialog'

const ProfileSettings = () => {
    const { currentUser } = useContext(AuthContext);

    const [file, setFile] = useState(
        currentUser.img
    );
    const [first_name, setFirstName] = useState(
        currentUser.first_name
    );
    const [last_name, setLastName] = useState(
        currentUser.last_name
    );
    const [email, setEmail] = useState(
        currentUser.email
    )
    const [position, setPosition] = useState(
        currentUser.position
    )
    
    const upload = async () => {
        try{
            const formData = new FormData();
            formData.append("file",file);
            const res = await axios.post("http://localhost:8800/api/upload", formData)
            return res.data
        }  
        catch(err){
            console.log(err);
        }
    }

    const handleSave = async e => {
        e.preventDefault();
        const imgUrl = await upload()

        if (imgUrl) {
            await axios.put(`http://localhost:8800/api/users/user/${currentUser.id}`, {
                email: email,
                first_name: first_name,
                last_name: last_name,
                position: position,
                img: file? imgUrl:'',
            })
        } else {
            await axios.put(`http://localhost:8800/api/users/user/${currentUser.id}`, {
                email: email,
                first_name: first_name,
                last_name: last_name,
                position: position,
                img: currentUser.img
            })
        }
        currentUser.email = email
        currentUser.first_name = first_name
        currentUser.last_name = last_name
        currentUser.position = position
        currentUser.img = imgUrl? imgUrl : currentUser.img
        localStorage.setItem("user", JSON.stringify(currentUser));
        
        window.location.reload();
    }

    const handleDelete = async e => {
        e.preventDefault();
        await axios.put(`http://localhost:8800/api/users/user/${currentUser.id}`, {
            email: email,
            first_name: first_name,
            last_name: last_name,
            position: position,
            img: null
        })
    }

    const authorizeLinkedin = async() => { // save user_sub and refresh token to the corresponding user in the db
        try {
            const res = await axios.get(
                `http://localhost:8800/api/uploadPost/linkedin/authorize`,
                {
                    params: {
                        userId: currentUser.id
                    },
                }
            );

            // Redirect to LinkedIn authorization URL
            // window.open(res.data.authorizationUrl, '_blank');
            window.location.href = res.data.authorizationUrl;
        } catch (error) {
            console.error(error);
        }
    }

    const authorizeFacebook = async() => {
        try {
            const response = await axios.get(
                'http://localhost:8800/api/uploadPost/facebook/authorize',
                {
                    params: {
                        userId: currentUser.id
                    }
                }
            );
        
            window.location.href = response.data.authorizationUrl;
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className='profile-settings'>    
            <div className='profile-container'>
                <div className="profile-info">
                    <div className='image-container'>
                        <img  src={currentUser.img !== null ? `../upload/${currentUser.img}` : DefaultImg} className="profile-picture" alt="" />
    
                        <div className='edit-img'>
                            <input style={{display:"none"}} type="file" name="" id="file" onChange={e=>setFile(e.target.files[0])}/>
                            <label className='edit-buttons' htmlFor="file">
                                <img src={Edit} alt="" />
                            </label>
    
                            <img className='edit-buttons' src={Delete} alt="" onClick={handleDelete}/>
                        </div>
                    </div>
                    <div>
                        <input type="text" value={first_name} placeholder="First Name" onChange={e=>setFirstName(e.target.value)}/>
                        <input type="text" value={last_name} placeholder="Last Name" onChange={e=>setLastName(e.target.value)}/>
                    </div>
                    <input className='input-wide' type="email" value={email} placeholder="Email" onChange={e=>setEmail(e.target.value)}/>
                    <input className='input-wide' type="text" value={position} placeholder="Position" onChange={e=>setPosition(e.target.value)}/>
                    {/* <div className='link-social-media-accounts'>
                        <button onClick={() => authorizeLinkedin()}><img src={LinkedIn} alt="" /></button>
                        <button onClick={() => authorizeFacebook()}><img src={Facebook} alt="" /></button>
                        <button><img src={Instagram} alt="" /></button>
                        <button><img src={YouTube} alt="" /></button>
                        <button><img src={TikTok} alt="" /></button>
                    </div> */}
                </div>
                <button className='button-save' onClick={handleSave}>Save</button>
            </div> 
        
        </div>
    );
    
}

export default ProfileSettings