import React, { useContext, useEffect, useRef, useState } from 'react'
import {Link, useParams} from 'react-router-dom'
import axios from "axios";
import moment from 'moment'
import DefaultImg from '../img/user.png'
import './feed.scss'
import { ScrollPanel } from 'primereact/scrollpanel';
import { Divider } from 'primereact/divider';
import LinkedIn from '../img/linkedin.png'
import Facebook from '../img/facebook.png'
import Instagram from '../img/instagram.png'
import Edit from '../img/edit.png'
import Delete from '../img/delete.png';
import Approved from '../img/approved.png'
import NotApproved from '../img/not_approved.png';
import { InputTextarea } from 'primereact/inputtextarea';
import DOMPurify from 'dompurify'
import { Button } from 'primereact/button';
import { AuthContext } from '../context/authContext';
import { Paginator } from 'primereact/paginator';
import DeletePostDialog from '../dialogs/DeletePostDialog';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Toast } from 'primereact/toast';
import Write from '../components/Write';
import { isImage, isVideo } from '../functions/OtherFunctions';

const Feed = () => { // fix the group
    const toast = useRef(null);
    const { currentUser} = useContext(AuthContext);
    const {group_name} = useParams()
    const [posts, setPosts] = useState([])
    const [comments, setComments] = useState({}); // Use an object to store comments for each post
    const [first, setFirst] = useState(0);
    const [displayedPosts, setDisplayedPosts] = useState([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState();
    const [ selectedPostTitle, setSelectedPostTitle ] = useState('');

    const fetchData = async () => {
        try {
            let res;
            if (group_name && group_name.length > 0) {
                res = await axios.get(`http://localhost:8800/api/posts/${group_name}`);
            } else if (window.location.pathname === '/feed/your_posts') {
                console.log('your posts with: ', currentUser.id)
                res = await axios.get(`http://localhost:8800/api/posts/your_posts/${currentUser.id}`);
            } else {
                res = await axios.get(`http://localhost:8800/api/posts`);
            }
            const sortedPosts = [...res.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const postsWithComments = await Promise.all(sortedPosts.map(async (post) => {
                const commentsRes = await axios.get(`http://localhost:8800/api/posts/comments/${post.id}`);
                const comments = await Promise.all(commentsRes.data.map(async (comment) => {
                    const userRes = await axios.get(`http://localhost:8800/api/users/userById/${comment.user_id}`);
                    return { ...comment, user: userRes.data };
                }));
                return { ...post, comments };
            }));
            setPosts(postsWithComments);
            setDisplayedPosts(postsWithComments.slice(0,10))
            // console.log('posts: ', postsWithComments)
        }
        catch(err) {
            console.log(err);
        }
    }

    const handleCommentChange = (postId, value) => {
        setComments((prevComments) => ({ ...prevComments, [postId]: value }));
    };

    const handleCommentSubmit = async (postId) => {
        const commentValue = comments[postId]; 
        try {
            const res = await axios.post(`http://localhost:8800/api/posts/comment`, {
                post_id: postId,
                user_id: currentUser.id,
                content: commentValue,
                created_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            })
            if (res.data) {
                fetchData();
                window.alert(JSON.stringify(res.data));
            } else {
                window.alert('Response received with no data.');
            }
        } catch (error) {
            console.error('Error submitting comment: ', error)
            window.alert('An error occurred while processing comment submit.');
        }
        console.log(`Post ${postId} Comment: ${commentValue} user: ${currentUser.id}`);
    };

    // console.log(group_name)

    useEffect(()=>{
        fetchData();
    }, [group_name, comments, showDeleteDialog]);

    const handlePageChange = (event) => {
        setFirst(event.first);

    };

    useEffect(() => {
        
        const startIndex = first;
        
        const endIndex = startIndex + 10;
        
        const slicedPosts = posts.slice(startIndex, endIndex);
        
        setDisplayedPosts(slicedPosts);
    }, [first]);
    
    return (
        <div className='feed'>
            <Toast ref={toast} /> 
            <Paginator style={{paddingTop:'20px', paddingBottom:'0'}} first={first} rows={10} totalRecords={posts.length} onPageChange={(e) => handlePageChange(e)} 
            template={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }} />
            <div className="posts">
                {displayedPosts.map((post)=>(
                    <div className="post-container"  key={post.id}>
                        <div className="post-icons">
                            <div className="approved">
                                {post.approved_by ?
                                    <img style={{width:'40px', height:'40px'}}src={Approved} alt="Approved" title='Approved by'/>
                                    :
                                    <img style={{width:'40px', height:'40px'}}src={NotApproved} alt="Awaiting-Approval" title='Awaiting Approval'></img>
                                }
                            </div>
                            <div className="socials">
                                { currentUser.role === 'socialmediamanager' && (
                                <>
                                    <img src={LinkedIn} alt="" />
                                    <img src={Facebook} alt="" />
                                    <img src={Instagram} alt="" />
                                </>
                                )}
                            </div>
                            <div className="manage">
                                { (post.user_id === currentUser.id || window.location.pathname==="/feed/your_posts") && (
                                <>
                                    <i title='Edit' className='pi pi-pencil' alt="Edit" style={{ color: `var(--green)`, cursor:'pointer', fontSize:'25px' }} onClick={async() => {await setSelectedPostId(post.id); setShowEditDialog(true)}}/>
                                    <i title='Delete' className='pi pi-trash' alt="" onClick={async() => {  await setSelectedPostId(post.id); await setSelectedPostTitle(post.title); setShowDeleteDialog(true); console.log('delete', selectedPostId, selectedPostTitle);}} style={{color:'red', cursor:'pointer', fontSize:'30px'}}/>
                                </>
                                )}
                            </div>
                        </div>

                        <div className='post'>
                            <div className='post-data'>
                                <div className='post-author'>
                                    <Link to={`/user/${post.username}`}>
                                        <img src={post.userImg !== null ? `/upload/${post.userImg}` : DefaultImg} alt="" className='post-user-img'/>
                                    </Link>
                                </div>
                                <div className="post-date">
                                    <p style={{ margin:0, padding:0}}>{post.username}</p>
                                    <p style={{fontSize:'12px', margin:0, padding:0}}>posted {moment(post.created_at).fromNow()}</p>
                                </div>
                            </div>
                            
                            <Link className='content link' to={`/post/${post.id}`}>
                                <h3 className='m-0 p-0'>{post.title}</h3>
                                <span className='m-0 p-0'>{post.desc}</span>
                            </Link>
                            
                            <div className="post-img">
                                {post.img && isImage(post.img) && (
                                    <img src={`/upload/${post.img}`} alt=""  style={{ margin:0, padding:0}}/>
                                )}
                                {post.img && isVideo(post.img) && (
                                    <div className="video-thumbnail">
                                        <video src={`/upload/${post.img}`} controls={true}></video>
                                    </div>
                                )}
                            </div>
                            <ScrollPanel style={{width:'100%', height:'100%', overflow:'hidden', wordBreak:'break-word'}} pt={{content: {style: {paddingBottom:'20px'}}}}>
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}/>
                            </ScrollPanel>
                        </div>

                        <div className="post-comments" key={`comments-${post.id}`} style={{maxWidth:'400px'}}>
                            {/* <h3>Comments</h3> */}
                            <h3 className='m-0 p-0'>Comments</h3>
                            <ScrollPanel style={{ width: '100%', height:'400px'}} pt = {{barY: {style: {background:'none'}}}}>
                                {post.comments && post.comments.map((comment) => (
                                    
                                    <div key={comment.id} className='comment' style={{width:'100%', margin:'10px 0px', padding:'10px 0', wordBreak: 'break-all' }}>
                                        <div className="top" style={{display:'flex', flexDirection:'row', width:'100%'}}>
                                            <img src={`/upload/${comment.user.img}`} style={{height:'32px',aspectRatio:'1', borderRadius:'50%'}} alt="User Img" />
                                            <div style={{display:'flex', flexDirection:'column'}}>
                                                <span style={{fontSize:'12px'}}>{comment.user.username}</span>
                                                <span style={{fontSize:'12px'}}> {comment.created_at 
                                                    ? new Date(comment.created_at).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        hour12: false,
                                                        timeZone: 'Europe/Vienna' // Make sure the timezone is set to UTC
                                                    })
                                                    : 'Unknown Date'}
                                                </span>
                                            </div>
                                        </div>
                                        <span style={{maxWidth:'100%', wordWrap: 'break-word', overflowWrap: 'break-word'}}>{comment.content}</span>
                                    </div>
                                ))}
                                <div style={{marginBottom:'30px'}}></div>
                            </ScrollPanel>
                            <div className='send-comment' style={{width:'100%', border:'1px solid #C9C9C9', paddingTop:'0px', borderRadius:'15px'}}>
                                <InputTextarea style={{height:'100px', maxHeight:'100px', width:'80%'}}
                                    placeholder='Add comment...'
                                    value={comments[post.id] || ''}
                                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                    rows={5}
                                    cols={30}
                                    autoResize
                                />
                                <Button className='send-button' style={{backgroundColor:'white'}} rounded text raised onClick={() => handleCommentSubmit(post.id)}>Send</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {showDeleteDialog &&  <DeletePostDialog visible={showDeleteDialog} setVisible={setShowDeleteDialog} postId = {selectedPostId} postTitle={selectedPostTitle} toast={toast}/> }
            {displayedPosts.length > 1 && 
                <Paginator style={{paddingTop:'20px', paddingBottom:'0'}} first={first} rows={10} totalRecords={posts.length} onPageChange={(e) => handlePageChange(e)} 
                template={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }} />
            }
            {showEditDialog && <Write onClose={() => setShowEditDialog(false)} postId={selectedPostId}/>}
        </div>
    )
}

export default Feed