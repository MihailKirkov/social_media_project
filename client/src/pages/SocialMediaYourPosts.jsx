import React, { useContext } from 'react'
import './social_media_your_posts.scss'
import { useLocation, useParams } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import axios from 'axios';

const SocialMediaYourPosts = () => {
  const { currentUser } = useContext(AuthContext);
  const { state } = useParams();
  let content;

  switch (state) {
    case 'all':
      content = <p>Show all posts</p>;
      break;
    case 'scheduled':
      content = <p>Show scheduled posts</p>;
      break;
    case 'requested':
      content = <p>Show requested posts</p>;
      break;
    case 'posted':
      content = <p>Show posted posts</p>;
      break;
    default:
      content = <p>Invalid state</p>;
  }
  const handleLinkedInComment = async(postId) => {
    console.log("making request with userid,postid:", currentUser.id, postId)
    try {
      const res = await axios.post(
          `http://localhost:8800/api/uploadPost/linkedin/comment`,
          {
              userId: currentUser.id,
              postId: postId
          }
      );
      console.log("Comment response: ", res)
    } catch (error) {
        console.error(error);
    }
  }
  return (
    <div className='social-media-your-posts'>
        {content}
        <button onClick={() => handleLinkedInComment(63)}>Comment on LinkedIn</button>
    </div>
  )
}

export default SocialMediaYourPosts