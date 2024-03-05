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
const Write = ({ onClose }) => {
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
    
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    }

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

    const handlePublish = async e => {
        e.preventDefault();
        
        console.log('handle publish')
        const imgUrl = await upload()
        console.log('img url: ', imgUrl)
        try {
            state ? await axios.put(`http://localhost:8800/api/posts/${state.id}`, { // this is called if a post is being edited
                title: title,
                desc:desc,
                content: content,
                img:file? imgUrl : "",
                edited_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                is_global: isGlobal,
                groups: selectedGroups
            }) : await axios.post(`http://localhost:8800/api/posts/`, { // this is called when a post is being created
                title: title,
                desc: desc,
                content: content,
                img: file? imgUrl : "",
                created_at: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                is_global: isGlobal,
                user_id: userId,
                groups: selectedGroups
            })
            
            window.location.href=`http://localhost:3000/your_posts/${userId}`;
        } catch(err) {
            console.log(err)
        }
        window.location.href=`http://localhost:3000/your_posts/${userId}`;
    }

    return (
        <div className="write">
        <div className='add'>
            <div className="content">
                <input type="text" value={title} placeholder='Title' onChange={e=>setTitle(e.target.value)}/>
                <input type="text" value={desc} placeholder='Short Decsription' onChange={e=>setDesc(e.target.value)}/>
                <div className="editorContainer">
                    <ReactQuill className='editor' theme="snow" value={content} onChange={setContent}/>
                </div>
            </div>

            <div className="menu">
                <div className="item item-publish">
                    
                    <div className="buttons">
                        <input style={{display:"inline-block"}} type="file" name="" id="file" onChange={e=>setFile(e.target.files[0])}/>
                            {/* <label className='file' htmlFor="file">Upload Image</label> */}
                        <button onClick={() => handlePublish()}>Publish</button>
                        <button onClick={onClose}>Close</button>
                    </div>
                </div>

                <div className="item item-group">
                    <div className="dropdown-content">
                        <h1>Post To:</h1>
                        <MultiSelect value={isGlobal? ['global'] : selectedGroups} onChange={(e) => handleGroupChange(e)} options={[{ name: 'global', value: 'global' }, ...userGroups]} optionLabel="name" display="chip" placeholder="Select Groups"/>
                        {/* <button onClick={() => {console.log(isGlobal, selectedGroups)}}>Check</button> */}
                        {/* <div className='group' ref={dropdownRef}>
                            <button onClick={toggleDropdown} value={selectedGroups.length>0? selectedGroups.map(group => group.name).join(', ') : 'Global'}>{selectedGroups.length>0? selectedGroups.map(group => group.name).join(', ') : 'Global'}▼</button>
                            
                            {dropdownOpen &&
                            <div className="dropdown-menu">
                                <input type="checkbox" checked={isGlobal === 1} onChange={() => {setIsGlobal(Math.abs(1-isGlobal)); setSelectedGroups([])}}/>
                                <label htmlFor="Global">Global</label>
                                {userGroups.map(userGroup=>(
                                    <div className='userGroup' key={userGroup.group_id}>
                                        <input
                                            type="checkbox"
                                            checked={selectedGroups.some(group => group.id === userGroup.group_id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setIsGlobal(0);
                                                    setSelectedGroups(prevGroups => [...prevGroups, { id: userGroup.group_id, name: userGroup.name }]);
                                                } else {
                                                    setSelectedGroups(prevGroups => prevGroups.filter(group => group.id !== userGroup.group_id));
                                                }
                                            }}
                                        />
                                        <label htmlFor={userGroup.name}>{userGroup.name}</label>
                                    </div>
                                ))}
                            </div>
                            }
                        </div> */}
                    </div>
                    
                </div>

                
                
            </div>
        </div>
        </div>
    )
}

export default Write