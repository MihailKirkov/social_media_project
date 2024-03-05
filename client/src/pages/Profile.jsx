import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import DefaultImg from '../img/user.png'
import './profile_settings.scss'

const Profile = () => {
    const [user, setUser] = useState({
        username:"",
        email:"",
        first_name:"",
        last_name:"",
        img:"",
        position:""
    })

    const {username} = useParams();
    // console.log(username)

    useEffect(()=>{
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/api/users/user/${username}`);
                setUser(res.data);
            }
            catch(err) {
                console.log(err);
            }
        }
        fetchData();
    }, [username]);

    return (
        <div className='profile-settings'>
            <div className='profile-container'>
                <div className="profile-info">
                    <div className='image-container'>
                        <img src={user.img !== null ? `../upload/${user.img}` : DefaultImg} alt="" />

                        {/* <button className="edit-button">Edit</button> */}
                    </div>
                    <h2>{user.first_name} {user.last_name}</h2>
                    <h6>{user.email}</h6>
                    <h4>{user.position}</h4>
                </div>
            </div>
        </div>
    )
}

export default Profile