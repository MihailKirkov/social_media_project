import React, { useContext, useEffect, useState } from 'react'
import Edit from '../img/edit.png'
import Delete from '../img/delete.png'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import Menu from '../components/Menu'
import axios from 'axios'
import moment from 'moment'
import {AuthContext} from '../context/authContext.js';
import DOMPurify from 'dompurify'
import DefaultImg from "../img/user.png"
import './single.scss'

const Single = () => {
    const {currentUser} = useContext(AuthContext);

    const [post, setPost] = useState({})

    const location = useLocation()
    const navigate = useNavigate();

    const postId = location.pathname.split("/")[2]

    useEffect(()=>{
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/api/posts/get_post/${postId}`);
                setPost(res.data);
            }
            catch(err) {
                console.log(err);
            }
        }
        fetchData();
    }, [postId]);

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:8800/api/posts/${postId}`);
            navigate("/");
            window.alert("Post has been deleted!");
        }
        catch (err){
            console.log(err);
            window.alert('Error while deleting post!');
        }
    }
    
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
        <div className='single'>
            <div className="content">
                <div className="user">
                    <Link to={`/user/${post.username}`}>
                        <img src={post.userImg !== null ? `../upload/${post.userImg}` : DefaultImg} alt="" />
                    </Link>
                    <div className="info">
                        <span>{post.username}</span>
                        <p>Posted {moment(post.created_at).fromNow()}</p>
                    </div>
                    
                    {currentUser.username === post.username &&
                        <div className="edit">
                            <Link to={`/write?edit=2`} state={post}>
                            <img src={Edit} alt="" />
                            </Link>
                            <img src={Delete} alt="" onClick={handleDelete}/>
                        </div>
                    }
                </div>
                <h1 style={{width:'100%',textAlign:'center'}}>{post.title}</h1> 
                <h3 style={{width:'100%',textAlign:'center'}}>{post.desc}</h3>
                
                {/* <img className='post-img' src={`../upload/${post.img}`} alt="" /> */}
                {post.img && isImage(post.img) && (
                    <img className='post-img' src={`../upload/${post.img}`} alt="" />
                )}
                {post.img && isVideo(post.img) && (
                    <video className='post-video' src={`../upload/${post.img}`} controls={true}></video>
                )}
                
                <div className='post-content' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
            </div>
            <Menu userId={post.userId} postId={postId}/>

        </div>
    )
}

export default Single