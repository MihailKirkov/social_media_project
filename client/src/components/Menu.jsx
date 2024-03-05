import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/languageContext.js';
import '../pages/single.scss'

const Menu = ({userId, postId}) => { // adjust to not see the same posts on the menu
    console.log ('userid, postid: ', userId, postId)
    const { currentLanguage, changeLanguage } = useLanguage();
    const [posts, setPosts] = useState([])
    
    const translations = {
        globalPostsFromThisUser: (currentLanguage === 'english'? 'Global Posts From This User' : 'Globale Beiträge von diesem Benutzer')
    }

    useEffect(()=>{
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/api/posts/user_posts/${userId}/${postId}`);
                setPosts(res.data);
            }
            catch(err) {
                console.error(err);
            }
        }
        fetchData();
    }, [userId, postId]);

    const isImage = (filename) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const extension = filename.split('.').pop().toLowerCase();
        return imageExtensions.includes(extension);
    };

    const isVideo = (filename) => {
        const videoExtensions = ['mp4', 'avi', 'mov', 'mkv'];
        const extension = filename.split('.').pop().toLowerCase();
        return videoExtensions.includes(extension);
    };

    return (
        <div className='menu'>
            <h1>{translations.globalPostsFromThisUser}</h1>
            {posts.map(post=>(
                <div className='post' key={post.id}>
                    {post.img && isImage(post.img) && (
                        <img src={`../upload/${post.img}`} alt="" />
                    )}
                    {post.img && isVideo(post.img) && (
                        <div className="video-thumbnail">
                            <video src={`../upload/${post.img}`} controls={false} controlsList="nodownload"></video>
                            <div className="play-overlay">
                                <div className="play-icon">&#9654;</div>
                            </div>
                        </div>
                    )}

                    <h2>{post.title}</h2>
                    <Link to={`/post/${post.id}`}><button>Read More</button></Link>
                </div>
            ))}
        </div>
    )
}

export default Menu