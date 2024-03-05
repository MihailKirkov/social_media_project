import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/authContext'
import './create_group.scss'

const CreateGroup = () => {
    const { currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([])
    const [groupName, setGroupName] = useState('')

    useEffect(()=>{
        
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:8800/api/users/get_users/${currentUser.id}`);
                setUsers(res.data);
            }
            catch(err) {
                if (err.response.status === 401) {
                    // If the response status is 401 (Unauthorized), redirect to the home page
                    window.location.href = "/";
                } else {
                    console.error(err);
                }
            }
        }
        fetchData();
    }, [currentUser.id]);

    const handleAddUser = () => {

    }

    const handleCreate = async () => {
        try {
            await axios.post(`http://localhost:8800/api/groups/create_group/${groupName}`)
        } catch(err) {
            console.error(err);
        }
    }

    return (
        <div className='create-group'>
            <div className="create-group-container">
                <div className="users">
                    <input type="text" placeholder='Group Name' value={groupName} onChange={e=>setGroupName(e.target.value)}/>
                    {/* <>
                        <h4>username</h4>
                        <h4>First Name | Last Name</h4>

                    </> */}
                    {users.map(user => (
                        <div className="user" key={user.id}>
                            <div className="column">
                                <span>{user.username}</span>
                            </div>
                            <div className="column">
                                <span>{user.first_name} {user.last_name}</span>
                            </div>
                            <div className="column-button">
                                <button onClick={() => handleAddUser}>Add User</button>
                            </div>
                        </div>
                    ))}
                </div>
                <button className='create-button' onClick={handleCreate}>Create Group</button>
            </div>
        </div>
    )
}

export default CreateGroup