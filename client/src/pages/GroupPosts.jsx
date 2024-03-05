import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import moment from 'moment'
import DefaultImg from '../img/user.png'
import './feed.scss'

const GroupPosts = () => {
    
    const [posts,setPosts] = useState([])

    const {group_name} = useParams()
    
    useEffect(()=>{
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/api/posts/${group_name}`);
                setPosts([...res.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            }
            catch(err) {
                console.log(err);
            }
        }
        fetchData();
    }, [group_name]);


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
        <div className='feed'>
            <div className="posts">
                {posts.map((post, index)=>(
                    <div className='post' key={post.id}>
                        <Link className='content link' to={`/post/${post.id}`}>
                            <h1>{post.title}</h1>
                            <span>{post.desc}</span>
                        </Link>
                        
                        <Link to={`/post/${post.id}`} className="post-img link">
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
                        </Link>
                        <div className='post-data'>
                            <p>Posted {moment(post.created_at).fromNow()} by</p>
                            <div className='post-author'>
                                <p>{post.username}</p>
                                <Link to={`/user/${post.username}`}>
                                    <img src={post.userImg !== null ? `../upload/${post.userImg}` : DefaultImg} alt="" className='post-user-img'/>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GroupPosts