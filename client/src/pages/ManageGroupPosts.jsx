import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import moment from 'moment'
import DefaultImg from '../img/user.png'
import { AuthContext } from '../context/authContext';
import Edit from '../img/edit.png'
import Delete from '../img/delete.png'
import DOMPurify from 'dompurify';

const ManageGroupPosts = () => {
    const { currentUser } = useContext(AuthContext);
    // console.log("your posts", currentUser)
    const [posts,setPosts] = useState([])
    const navigate = useNavigate();
    
    const {group_name} = useParams()

    
    useEffect(()=>{
        const fetchData = async () => {
            try {
                if (group_name) {
                    const res = await axios.get(`http://localhost:8800/api/groups/manage_group_posts/${group_name}/${currentUser.id}`);
                    setPosts(res.data);
                } else {
                    const res = await axios.get(`http://localhost:8800/api/groups/manage_global_posts/${currentUser.id}`)
                    setPosts(res.data);
                }
            }
            catch(err) {
                if (err.response.status === 401) {
                    // if unauthorized show noaccess page
                    window.location.href = "/no_access";
                } else {
                    console.error(err);
                }
            }
        }
        fetchData();
    }, [group_name, currentUser]);

    const handleDelete = async (postId) => {
        try {
            await axios.delete(`http://localhost:8800/api/posts/${postId}`);
            navigate("/");
        }
        catch (err){
            console.error(err);
        }
    }

    

    return (
        <div className="your-posts">
        {posts.map(post=>(
            <div className='post' key={post.id}>
                <div className="img">
                    {post.img && post.img.length > 0 && (
                        <img src={`../upload/${post.img}`} alt="" />
                    )}
                </div>
                <div className="content">
                    <Link className="link" to={`/post/${post.id}`}>
                        <h1>{post.title}</h1>
                        <h5>{post.desc}</h5>
                        <br/>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                    </Link>

                    <div className='post-data'>
                        <p>Posted {moment(post.created_at).fromNow()} by You</p>
                        {/* <img className='post-user-img'src={post.userImg || DefaultImg} alt="" /> */}
                        {/* <button>Read More</button> */}
                    </div>
                    
                </div>

                <div className="edit">
                    <div className="edit-post-buttons">
                        <Link to={`/write?edit=${post.id}`} state={post}>
                        <img src={Edit} alt="" />
                        </Link>
                        <img src={Delete} alt="" onClick={() => handleDelete(post.id)}/>
                    </div>
                </div>
            </div>
        ))}
    </div>
    )
}

export default ManageGroupPosts