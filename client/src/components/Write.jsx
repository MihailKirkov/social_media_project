import React, {useContext, useEffect, useRef, useState} from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { AuthContext } from '../context/authContext';
import './write.scss';
import { MultiSelect } from 'primereact/multiselect';
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css"
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import FileUploader from './FileUploader';
import { GetPostById } from '../functions/PostFunctions';
import DOMPurify from 'dompurify';
import { isImage, isVideo } from '../functions/OtherFunctions';

const Write = ({ onClose, postId }) => {
    const { currentUser} = useContext(AuthContext);
    const userId = currentUser.id;
    const state = useLocation().state
    
    const [title, setTitle] = useState(state?.title || '');
    const [desc, setDesc] = useState(state?.desc || '');
    const [content, setContent] = useState(state?.content || '');
    const [file, setFile] = useState(state?.img || '');
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [userGroups, setUserGroups] = useState([]);
    const [isGlobal, setIsGlobal] = useState(true);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [post, setPost] = useState(null);
    
    const navigate = useNavigate();
    
    const [fileName, setFileName] = useState(null);
    const [ delImg, setDelImg ] = useState(false);

    const fetchPost = async (postId) => {
        try {
            const postData = await GetPostById(postId);
            setPost(postData);
            setTitle(postData?.title);
            setDesc(postData?.desc);
            setFile(postData?.img);
            setContent(postData?.content);
        } catch (error) {
            console.error('Error fetching post:', error);
        }
    }

    useEffect(() => {
        if (postId) {
            fetchPost(postId);
        }
    }, [postId])

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    };

    const handleGroupChange = (e) => {
        const selectedValue = e?.value || [];
        console.log('selected value: ', selectedValue)

        if (selectedValue && selectedValue.includes('global') && (selectedValue[0]!=='global' || selectedValue.length === 1) && selectedValue.length > 0) {
            // If "global" is selected, deselect all other groups
            setSelectedGroups([]);
            setIsGlobal(true);
        } else {
            // If other groups are selected, remove "global" from the selection
            setSelectedGroups(selectedValue.filter(value => value!='global') || []);
            setIsGlobal(false);
        }
    }

    useEffect(()=>{
        const fetchData = async () => {
            try {
                const res_groups = await axios.get(`http://localhost:8800/api/groups/user_groups/${userId}`); // get user's groups data
                setUserGroups(res_groups.data.sort((a,b) => a.name.localeCompare(b.name))) // saving userGroups sorted by group's name
            }
            catch(err) {
                console.log(err);
            }
        }
        fetchData();
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [userId]);
    
    const upload = async () => {
        console.log('upload: ', file)
        try{
            const formData = new FormData();
            formData.append("file",file);
            console.log('form data: ', formData)
            const res = await axios.post("http://localhost:8800/api/upload", formData)
            return res.data
        }  
        catch(err){
            console.log(err);
        }
    }

    const uploadHandler = async (file) => {
        console.log('upload: ', file)
        try{
            const formData = new FormData();
            formData.append("file",file);
            console.log('form data: ', formData)
            const res = await axios.post("http://localhost:8800/api/upload", formData)
            console.log('api post success', res.data);
            console.log(res.data.filename);
            return res.data.filename
        }  
        catch(err){
            console.log(err);
        }
    };


    const handlePost = async e => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('handle post', title, desc, content, selectedGroups, isGlobal, currentUser)
        try {
            console.log('file : ', file);
            const imgUrl = file ? await uploadHandler(file) : '';
            console.log('imgurl:', imgUrl);
            console.log('sending request with', title, desc, content, imgUrl, isGlobal, currentUser.id, selectedGroups, delImg)
            console.log('await axios post')
            postId ? await axios.put(`http://localhost:8800/api/posts/${postId}`, { // this is called if a post is being edited
                title: title,
                desc:desc,
                content: content,
                img: file ? imgUrl : "",
                edited_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                is_global: isGlobal,
                groups: selectedGroups,
                del_img: delImg
            }) : await axios.post(`http://localhost:8800/api/posts/`, { // this is called when a post is being created
                title: title,
                desc: desc,
                content: content,
                img: file ? imgUrl : "",
                created_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                is_global: isGlobal,
                user_id: currentUser.id,
                groups: selectedGroups
            })
            console.log('posted fine');
            onClose();
        } catch (err) {
            console.error('Error posting:', err);
        }
        // const imgUrl = await upload()
        // console.log('img url: ', imgUrl)
        // try {
        //     postId ? await axios.put(`http://localhost:8800/api/posts/${postId}`, { // this is called if a post is being edited
        //         title: title,
        //         desc:desc,
        //         content: content,
        //         img:file? imgUrl : "",
        //         edited_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        //         is_global: isGlobal,
        //         groups: selectedGroups
        //     }) : await axios.post(`http://localhost:8800/api/posts/`, { // this is called when a post is being created
        //         title: title,
        //         desc: desc,
        //         content: content,
        //         img: file? imgUrl : "",
        //         created_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        //         is_global: isGlobal,
        //         user_id: userId,
        //         groups: selectedGroups
        //     })
            
        //     window.location.href=`http://localhost:3000/your_posts/${userId}`;
        // } catch(err) {
        //     console.log(err)
        // }
        // window.location.href=`http://localhost:3000/your_posts/${userId}`;
    }
    
    const footerContent = (
        <div className='flex jc-space-between'>
            <div style={{margin:'0'}}>
                <Button severity='danger' label="Cancel" icon="pi pi-times" onClick={() => onClose()} outlined rounded raised/>
                <Button severity='info' label="Save As Draft" onClick={() => onClose()} outlined rounded disabled raised/>
            </div>
            <div className='flex' style={{gap:'20px',}}>
                <MultiSelect value={isGlobal? ['global'] : selectedGroups} onChange={(e) => handleGroupChange(e)} options={[{ name: 'global', value: 'global' }, ...userGroups]}
                optionLabel="name" placeholder="Select Groups" maxSelectedLabels={3} />
                <Button severity='success' label="Post" rounded raised onClick={(e) => handlePost(e)}/>
            </div>
        </div>
    );

    
    
    return (
            <Dialog header={!postId ? `Create Post` : 'Edit Post'} visible={true} onHide={() => onClose()} footer={footerContent}
            style={{width:'50dvw', height:'80%'}}
            >
                <div className='flex flex-col' style={{height:'100%', borderRadius:'20px', padding:'5px', gap:'10px', margin:'0 auto 20px auto'}}>
                    <div className='top-row flex ai-center jc-space-around' style={{gap:'10px'}}>
                        <Button icon='pi pi-book' label='Post' severity='info' rounded text aria-label='facebook' title='Post'/>
                        <Button icon='pi pi-facebook' severity='info' rounded text aria-label='facebook' title='FaceBook'/>
                        <Button icon='pi pi-instagram' severity='warning' rounded text aria-label='instagram' title='Instagram'/>
                        <Button icon='pi pi-linkedin' rounded text aria-label='linkedin' title='Linkedin'/>
                        <Button icon='pi pi-twitter' severity='secondary' rounded text aria-label='twitter' title='Twitter'/>
                        <Button icon='pi pi-youtube' severity='danger' rounded text aria-label='youtube' title='YouTube'/>
                        <Button icon='pi pi-whatsapp' severity='secondary' rounded text aria-label='tiktok' title='TikTok'/>
                    </div>
                    <InputText value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Title'/>
                    <InputText value={desc} onChange={(e) => setDesc(e.target.value)} placeholder='Short Description'/>
                    <FileUploader setFile={setFile}/>
                    { (post && file && file.length>0) &&
                        <div className='flex jc-space-around ai-center' style={{maxHeight:'100px'}}>
                            {isVideo(post.img) ? <span>Current Video:</span> : <span>Current Image:</span>}
                            <div style={{maxWidth:'50%', maxHeight:'100px'}}>
                                {post?.img && isImage(post?.img) && (
                                    <img src={`/upload/${post.img}`} alt=""  style={{ margin:0, padding:0, width:'100%', height:'50%', maxHeight:'100px',objectFit:'cover'}}/>
                                )}
                                {post?.img && isVideo(post?.img) && (
                                    <div style={{width:'max-content', height:'max-content', position:'relative', margin:0, padding:0}}>
                                        <video src={`/upload/${post.img}`} controls={false} style={{ margin:0, padding:0, width:'100%', height:'50%', maxHeight:'100px',objectFit:'cover'}}></video>
                                        <i className='pi pi-video' style={{position:'absolute', top:'50%', left:'50%', transform: 'translate(-50%, -50%)', fontSize:'30px', color:'white'}}/>
                                    </div>
                                )}
                            </div>
                            <Button icon='pi pi-times' severity='danger' rounded raised label='Remove' style={{height:'50%', margin:'auto 0'}} onClick={() => {setFile(''); setDelImg(true)}}/>
                        </div>
                    }
                <InputTextarea value={content} onChange={(e) => setContent(e.target.value)} autoResize style={{width:'100%', minHeight:'100px'}} placeholder='Content'/>
                <br/>
            </div>
        </Dialog>
    )
}

export default Write