import React, { useState } from 'react';
import LinkedIn from '../img/linkedin.png';
import Facebook from '../img/facebook.png';
import Instagram from '../img/instagram.png';
import YouTube from '../img/youtube.png';
import TikTok from '../img/tiktok.png';
import './social_media_group_posts.scss';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment'
import DefaultImg from '../img/user.png'

const SocialMediaGroupPosts = () => {
  const images = [LinkedIn, Facebook, Instagram, YouTube, TikTok];
  const [activeIndex, setActiveIndex] = useState(0);
  
  const [posts,setPosts] = useState([])

  const {group_name} = useParams()
  console.log(group_name)

  const handleImageClick = (index) => {
    setActiveIndex(index);
  };
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

  const getLinkedInPosts = async() => {
      try {
          const res = await axios.get(`http://localhost:8800/api/posts/linkedin_posts/${group_name}`);
          setPosts([...res.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
          
      }
      catch(err) {
          console.log(err);
      }
  }

  getLinkedInPosts();


  return (
    <div className='social-media-group-posts'>
      <div className="carousel-container">
        <div className="social-media-icons">
          {images.map((image, index) => (
            <div
              key={index}
              className={`image-container ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleImageClick(index)}
            >
              <img src={image} alt="" />
            </div>
          ))}
        </div>
      </div>

      <div className="content">
        {activeIndex === 0 &&
          <div className="posts">
            <h1>LinkedIn Posts</h1>
            {posts.map((post, index)=>(
              <div className='post' key={post.id}>
                  <Link className='content link' to={`/post/${post.id}`}>
                      <h1>{post.title}</h1>
                      <span>{post.desc}</span>
                  </Link>
                  
                  <Link to={`/post/${post.id}`} className="post-img link">
                      {post.img && isImage(post.img) && (
                          <img src={`/upload/${post.img}`} alt="" />
                      )}
                      {post.img && isVideo(post.img) && (
                          <div className="video-thumbnail">
                              <video src={`/upload/${post.img}`} controls={false} controlsList="nodownload"></video>
                              <div className="play-overlay">
                                  <div className="play-icon">&#9654;</div>
                              </div>
                          </div>
                      )}
                  </Link>
                  <div className='post-data'>
                      <p>Posted {moment(post.created_at).fromNow()} by</p>
                      <div className='post-author'>
                          <p>{post.username}</p>
                          <Link to={`/user/${post.username}`}>
                              <img src={post.userImg !== null ? `/upload/${post.userImg}` : DefaultImg} alt="" className='post-user-img'/>
                          </Link>
                      </div>
                  </div>
              </div>
          ))}
      </div>
        }
        {activeIndex === 1 && <p>Facebook Posts</p>}
        {activeIndex === 2 && <p>Instagram Posts</p>}
        {activeIndex === 3 && <p>YouTube Posts</p>}
        {activeIndex === 4 && <p>TikTok Posts</p>}
      </div>
    </div>
  );
};

export default SocialMediaGroupPosts;
