import React, { useContext, useEffect, useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from "axios";
import moment from 'moment'
import { AuthContext } from '../context/authContext';
import Edit from '../img/edit.png'
import Delete from '../img/delete.png'
import Instagram from '../img/instagram.png'
import Gmail from '../img/gmail.png'
import Facebook from '../img/facebook.png';
import LinkedIn from '../img/linkedin.png';
import Twitter from '../img/twitter.png';
import YouTube from '../img/youtube.png';
import TikTok from '../img/tiktok.png';
import DOMPurify from 'dompurify';
import './your_posts.scss';

const YourPosts = () => {
    const { currentUser } = useContext(AuthContext);
    const [posts, setPosts] = useState([])

    const [recieverEmail, setRecieverEmail] = useState('');
    const [igUsername, setIgUsername] = useState('');
    const [igPassword, setIgPassword] = useState('');

    const [modalSendEmail, setModalSendEmail] = useState(false);
    const [modalShareInstagram, setModalShareInstagram] = useState(false);
    const [modalShareFacebook, setModalShareFacebook] = useState(false);

    const [selectedPost, setSelectedPost] = useState({
        id: 0,
        img: '',
        content: '',
        title: '',
    })

    const navigate = useNavigate();
    
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

    
    useEffect(()=>{
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/api/posts/your_posts/${currentUser.id}`);
                
                setPosts([...res.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))); // sort posts by created_at
            }
            catch(err) {
                console.error(err);
            }
        }
        fetchData();
    }, [currentUser]);

    const handleDelete = async (postId) => {
        try {
            await axios.delete(`http://localhost:8800/api/posts/${postId}`);
            navigate("/");
            window.alert("Post has been deleted!");
        }
        catch (err){
            console.error(err);
            window.alert("Error while deleting post!");
        }
    }

    const handleModalShareInstagram = (post) => {
        setModalShareInstagram(true);
        setSelectedPost(post);
    };

    const handleModalShareFacebook = (post) => {
        setModalShareFacebook(true);
        setSelectedPost(post);
    }

    const handleModalSendEmail = (post) => {
        setModalSendEmail(true);
        setSelectedPost(post);
    }

    const getText = (html) =>{
        const doc = new DOMParser().parseFromString(html, "text/html")
        return doc.body.textContent
    }

    const handleUploadInstagram = async() => {
        try {
            const data = {
                ig_username: igUsername,
                ig_password: igPassword,
                content: getText(selectedPost.content),
                img: `../client/public/upload/${selectedPost.img}`
            };
            await axios.post(`http://localhost:8800/api/uploadPost/upload_to_instagram`, data)
        } catch(err) {
            console.error(err)
        }
    }

    const shareToLinkedIn = async(post) => {
        // send post.content and post.img for CreatePost()

        try {
            const res = await axios.post(
                `http://localhost:8800/api/uploadPost/linkedin/share`,
                {
                    userId: currentUser.id,
                    content: post.content,
                    img: `../client/public/upload/${post.img}`,
                    postId: post.id
                }
            );
            console.log("Share res: ", res)

        } catch (error) {
            console.error(error);
        }
    }

    const shareToFacebook = async(post) => {
        try {
            const res = await axios.post(
                `http://localhost:8800/api/uploadPost/facebook/share`,
                {
                    userId: currentUser.id,
                    content: post.content,
                    img: `../client/public/upload/${post.img}`,
                    postId: post.id
                }
            );
            console.log("Share res: ", res)

        } catch (error) {
            console.error(error);
        }
    }

    const handleSendEmail = async (post) => {
        try {
            const res = await axios.get(
                `http://localhost:8800/api/uploadPost/google/authorize`,
                {
                    params: {
                        title: post.title,
                        content: post.content,
                        img: `${post.img}`,
                        reciever: recieverEmail
                    }
                }
            )
            window.open(res.data.authorizationUrl, '_blank');
            // window.location.href = res.data.authorizationUrl;
        } catch (error) {
            console.error(error);
        }
    };

    return (
        // <div className='home'>
            <div className="your-posts">
                {posts.map(post=>(
                    <div className='post' key={post.id}>
                        <div className="content">
                            <div className="heading">
                                <Link className="link" to={`/post/${post.id}`}>
                                    <h1>{post.title}</h1>
                                    <h5>{post.desc}</h5>
                                </Link>
                            </div>
                            <div className="inner">
                                <div className="img">
                                {post.img && isImage(post.img) && (
                                    <img src={`/upload/${post.img}`} alt="" />
                                )}
                                {post.img && isVideo(post.img) && (
                                    <div className="video-thumbnail">
                                        <video style={{width:'100%'}} src={`/upload/${post.img}`} controls={true}></video>
                                    </div>
                                )}
                                </div>
                                <div className="post-content">
                                    <Link className="link" to={`/post/${post.id}`}>
                                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                                    </Link>
                                </div>
                            </div>
                            <div className="bottom">
                                <div className="edit-post-buttons">
                                    <Link to={`/write?edit=${post.id}`} state={post}>
                                    <img src={Edit} alt="" />
                                    </Link>
                                    <img src={Delete} alt="" onClick={() => handleDelete(post.id)}/>
                                </div>
                                <div className="post-date">
                                    <p>Posted {moment(post.created_at).fromNow()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="share-post">
                            <div className="share-to">
                                <h3>Share</h3>
                                <img src={LinkedIn} alt="" onClick={() => shareToLinkedIn(post)}/>
                                <img src={Facebook} alt="" onClick={() => shareToFacebook(post)}/>
                                <img src={Instagram} alt="" onClick={() => handleModalShareInstagram(post)}/>
                                <img src={Twitter} alt="" onClick={() => shareToLinkedIn(post)}/>
                                <img src={YouTube} alt="" onClick={() => shareToLinkedIn(post)}/>
                                <img src={TikTok} alt="" onClick={() => shareToLinkedIn(post)}/>
                            </div>
                            <div className="send-to">
                                <h3>Send</h3>
                                <img src={Gmail} alt="" onClick={() => handleModalSendEmail(post)}/>
                            </div>
                        </div>
                    </div>
                ))}
                {modalShareInstagram &&
                    <div className="modal-overlay">
                        <div className='instagram-post'>
                            <div className='post-data'>
                                <button className='button-close' onClick={() => setModalShareInstagram(false)}>&times;</button>
                                <img src={`../upload/${selectedPost.img}`} alt="" />
                                <p>{getText(selectedPost.content)}</p>
                            </div>
                            <div className='user-data'>
                                {/* <input type="text" placeholder='Instagram Username'/> */}
                                <input type="text" value={igUsername} placeholder='Instagram Username' onChange={e=>setIgUsername(e.target.value)}/>
                                <input type="password" value={igPassword} placeholder='Instagram Password' onChange={e=>setIgPassword(e.target.value)}/>
                                {/* <input type="password" placeholder='Instagram Password'/> */}
                                <button onClick={handleUploadInstagram}>Upload</button>
                                <span>* Note image should be .jpg </span>
                            </div>
                        </div>
                    </div>
                }
                {modalShareFacebook &&
                    <div className="modal-overlay">
                        <div className='instagram-post'>
                            <div className='post-data' style={{ height: '80%', maxHeight: '100%' }}>
                                <button className='button-close' onClick={() => setModalShareFacebook(false)}>&times;</button>
                                {selectedPost.img && selectedPost.img.length>0 && 
                                    <img style={{ height: '60%', maxHeight: '100%', width:'60%', maxWidth:'100%' }} src={`../upload/${selectedPost.img}`} alt="" />
                                }
                                <p>{getText(selectedPost.content)}</p>
                            </div>
                            <div className='user-data'>
                                <button>Sign In With Facebook</button>
                            </div>
                        </div>
                    </div>
                }
                {modalSendEmail && 
                    <div className="modal-overlay">
                        <div className='instagram-post'>
                            <div className='post-data'>
                                <button className='button-close' onClick={() => setModalSendEmail(false)}>&times;</button>
                                <p>{selectedPost.title}</p>
                                <p>{getText(selectedPost.content)}</p>
                                <img src={`../upload/${selectedPost.img}`} alt="" />
                            </div>
                            <div className='user-data'>
                                {/* <input type="text" placeholder='Instagram Username'/> */}
                                <input required type="email" value={recieverEmail} placeholder="Reciever's Email" onChange={e=>setRecieverEmail(e.target.value)}/>
                                {/* <input type="password" placeholder='Instagram Password'/> */}
                                <button onClick={() => handleSendEmail(selectedPost)}>Send Email by Signing In With Google</button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        // </div>
    )
}

export default YourPosts