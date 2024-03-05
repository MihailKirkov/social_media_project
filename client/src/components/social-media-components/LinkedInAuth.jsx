import axios from 'axios';
import React from 'react'

const LinkedInAuth = () => {
    const authorizeLinkedin = async() => { // save user_sub and refresh token for the corresponding page in the db
        try {
            const res = await axios.get(
                `http://localhost:8800/api/uploadPost/linkedin/authorize`,
            );

            // Redirect to LinkedIn authorization URL
            // window.open(res.data.authorizationUrl, '_blank');
            window.location.href = res.data.authorizationUrl;
        } catch (error) {
            console.error(error);
        }
    }
  return (
    <button onClick={authorizeLinkedin}>LinkedInAuth</button>
  )
}

export default LinkedInAuth