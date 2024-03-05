import React, { useContext } from 'react'
import CreatePost from "../img/create_post.png"
import ManagePosts from "../img/manage_posts.png"
import {Link} from 'react-router-dom'
import { AuthContext } from '../context/authContext'
import './posts_management.scss'
import { useLanguage } from '../context/languageContext.js';

const PostsManagement = () => {
    const { currentUser} = useContext(AuthContext);
    const { currentLanguage } = useLanguage();

    const translations = {
        createPost: (currentLanguage === 'english'? 'Create Post' : 'Beitrag erstellen'),
        manageYourPosts: (currentLanguage === 'english'? 'Manage Your Posts' : 'Ihre Beiträge Verwalten')
    }
    return (
        <>
            <Link to="/write" className='create-post'>
                <img src={CreatePost} alt="" />
                <span>{translations.createPost}</span>
                </Link>
            <Link to={`/your_posts/${currentUser.id}`} className="manage-posts">
                <img src={ManagePosts} alt="" />
                <span>{translations.manageYourPosts}</span>
            </Link>
        </>
    )
}

export default PostsManagement