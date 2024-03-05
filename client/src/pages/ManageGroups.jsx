import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/authContext';
import { Link } from 'react-router-dom';
import './manage_groups.scss'

const ManageGroups = () => {
    const { currentUser } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);

    const [modalAddUser, setModalAddUser] = useState(false);
    const [modalRemoveUser, setModalRemoveUser] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [members, setMembers] = useState([]);
    

    useEffect(()=>{
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/api/groups/manage_groups/${currentUser.id}`);
                setGroups(res.data);
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
    }, [currentUser]);

    useEffect(()=>{
        if (modalRemoveUser) {
            const getMembers = async () => {
                try {
                    const res = await axios.get(`http://localhost:8800/api/groups/group_members/${selectedGroup.id}`);
                    setMembers(res.data)
                } catch (err) {
                    console.error(err);
                }
            }
            getMembers();
        }
        else if (modalAddUser) {
            const getNonMembers = async () => {
                try {
                    const res = await axios.get(`http://localhost:8800/api/groups/group_non_members/${selectedGroup.id}`);
                    setMembers(res.data)
                } catch (err) {
                    console.error(err);
                }
            }
            getNonMembers();
        }
    }, [selectedGroup, modalRemoveUser, modalAddUser])

    const handleAddUser = (group) => {
        setModalAddUser(true);
        setSelectedGroup(group);
    };

    const handleRemoveUser = (group) => {
        setModalRemoveUser(true);
        setSelectedGroup(group);
    };

    const handleCloseModal = () => {
        setModalAddUser(false);
        setModalRemoveUser(false);
        setSelectedGroup(null);
    };

    const handleKick = async(user_id, group_id) => {
        // console.log("kick member", user_id, "from group", group_id)
        try {
            await axios.delete(`http://localhost:8800/api/groups/${group_id}/${user_id}`);

            const res = await axios.get(`http://localhost:8800/api/groups/group_members/${selectedGroup.id}`);
            setMembers(res.data);
        } catch(err) {
            console.error(err);
        }
    };

    const handleAdd = async(user_id, group_id) => {
        // console.log("add member", user_id, "to group", group_id)
        try {
            await axios.post(`http://localhost:8800/api/groups/${group_id}/${user_id}`);

            const res = await axios.get(`http://localhost:8800/api/groups/group_non_members/${selectedGroup.id}`);
            setMembers(res.data);
        } catch(err) {
            console.error(err);
        }
    }

    return (
        <div className='manage-groups'>
            
            {groups.map(group => (
                <div className='group' key={group.id}>
                    <Link to={`/manage_group_posts/${group.name}`} className='link'><h1>{group.name}</h1></Link>
                    <div className="buttons">
                        <button onClick={() => handleAddUser(group)}>Add User</button>
                        <button onClick={() => handleRemoveUser(group)}>Kick User</button>
                    </div>
                </div>
            ))}
            
            <Link to={`/manage_group_posts`} className='link'><h1>Edit Global Posts</h1></Link>
            

            {modalAddUser && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <button className='button-close' onClick={handleCloseModal}>&times;</button>
                        <h1>Add New User to {selectedGroup.name}</h1>
                        <br/>
                        <div className="members">
                            {members.map(member=> (
                                <div className="member" key={member.id}>
                                    <h4>{member.first_name} {member.last_name}</h4>
                                    <button className='button-add' onClick={() => handleAdd(member.id, selectedGroup.id)}>Add</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {modalRemoveUser && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <button className='button-close' onClick={handleCloseModal}>&times;</button>
                        <h1>{selectedGroup.name} Members</h1>
                        <br/>
                        <div className="members">
                            {members.map(member=> (
                                <div className="member" key={member.id}>
                                    <h4>{member.first_name} {member.last_name}</h4>
                                    <button className='button-kick' onClick={() => handleKick(member.id, selectedGroup.id)}>Kick</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManageGroups