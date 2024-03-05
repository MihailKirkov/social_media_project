import qs from 'querystring';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { db } from "../db.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });


export const LinkedInAuthorization = (req, res) => {
    try {
        
        return encodeURI(`https://linkedin.com/oauth/v2/authorization?client_id=${process.env.LINKEDIN_CLIENT_ID}&response_type=code&scope=${process.env.LINKEDIN_SCOPE}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
export const LinkedInRedirect = async(req, res) => {
    const payload = {
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        grant_type: 'authorization_code',
        code: req.query.code,
    };

    try {
        const { data: accessTokenResponse } = await axios({
        url: `https://linkedin.com/oauth/v2/accessToken?${qs.stringify(payload)}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    console.log(accessTokenResponse);

    const accessToken = accessTokenResponse.access_token;
      // Get user's profile information
    const { data: profileInfo } = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
        Authorization: `Bearer ${accessToken}`,
        },
    });

    const profileSub = profileInfo?.sub || '';
    const first_name = profileInfo?.given_name || '';
    const last_name = profileInfo?.family_name || '';
    const img = profileInfo?.picture || '';
    console.log('redirect function, now we just save the usersub and the accesstoken, profileInfo: ', profileInfo)

    // const q = `INSERT INTO usersocials 
    //             SET 
    //                 user_id = ?,
    //                 linkedin_user_sub = ?,
    //                 linkedin_access_token = ?
    //             ON DUPLICATE KEY UPDATE
    //                 linkedin_user_sub = VALUES(linkedin_user_sub),
    //                 linkedin_access_token = VALUES(linkedin_access_token)`;
        const q = "INSERT INTO pageslinkedin (`user_sub`, `access_token`, `first_name`, `last_name`, `img`) VALUES (?, ?, ?, ?, ?)";
        const values = [
            profileSub,
            accessToken,
            first_name,
            last_name,
            img
        ];
        console.log('vals: ', values);
        db.query(q, values, (err, data) => {
            if (err) {
                console.error('Error executing query', err);
                return "Error while authorizing LinkedIn!";
            }
            return "User's LinkedIn Authorized Successfully";
        });

    } catch (error) {
        console.log('Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const RegisterImageUpload = async (userSub, accessToken) => {
    const registerUploadUrl = 'https://api.linkedin.com/v2/assets?action=registerUpload';

    const registerUploadRequest = {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: `urn:li:person:${userSub}`,
        serviceRelationships: [
            {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent',
            },
        ],
    };

    try {
        const response = await axios.post(registerUploadUrl, { registerUploadRequest }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        
        return response.data.value;
    } catch (error) {
        console.error('Error registering image upload:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export const GetLinkedInUserData = async (userId) => {
    return new Promise((resolve, reject) => {
        try {
            const q = "SELECT `linkedin_user_sub`, `linkedin_access_token` FROM usersocials WHERE user_id=?"
            db.query(q, [userId], (err, data) => {
                if (err) {
                    console.error('Error getting UserId: ', err);
                    reject('Internal Server Error');
                    return;
                }
                console.log("Data from query:", data);
                const user_sub = data[0].linkedin_user_sub;
                const access_token = data[0].linkedin_access_token;
                resolve({ user_sub, access_token });
            })
        } catch (error) {
            console.log("Error when querying", error);
            reject('Internal Server Error');
        }
    });
}

export const LinkedInCreatePost = async (req, res) => {
    const userId = req.body.userId
    const content = GetTextFromContent(req.body.content)
    const imgPath = req.body.img;
    const postId = req.body.postId
    // const {user_sub, access_token} = GetLinkedInUserData(userId);

    
    try {
        const { user_sub, access_token } = await GetLinkedInUserData(userId);
        
        // Register the image upload
        const absoluteImgPath = path.resolve(process.cwd(), imgPath);
        
        const imageRegistration = await RegisterImageUpload(user_sub, access_token);

        // Extract uploadUrl and asset from the registration response
        const uploadUrl = imageRegistration.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        const asset = imageRegistration.asset;

        // Convert the local image path to an absolute path

        // Read the image file and encode it as base64
        const imgData = fs.readFileSync(absoluteImgPath);
        // Upload the image
        await axios.post(uploadUrl, imgData, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/octet-stream',
            },
        });

        // Create the post with the registered image
        const postData = {
            author: `urn:li:person:${user_sub}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: content,
                    },
                    shareMediaCategory: 'IMAGE',
                    media: [
                        {
                            status: 'READY',
                            description: {
                                text: 'Image Description',
                            },
                            media: asset,
                        },
                    ],
                },
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
        };

        // Post to LinkedIn
        const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
            headers: {
                'X-Restli-Protocol-Version': '2.0.0',
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });
        const linkedinPostId = response.data.id; // Extracting LinkedIn post ID

        // SAVE THE POST ID IN THE POST TABLE
        const updateQuery = "UPDATE posts SET linkedin_id = ? WHERE id = ?";
        db.query(updateQuery, [linkedinPostId, postId], (updateErr, updateResult) => {
            if (updateErr) {
                console.error('Error updating post with LinkedIn ID:', updateErr);
                throw updateErr;
            }
            console.log('LinkedIn Post ID saved in the post table');
        });


        console.log('LinkedIn Post ID:', linkedinPostId);

        return 'Posting finished';
    } catch (error) {
        console.error('Error posting to LinkedIn:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const LinkedInComment = async (req, res) => {
    const userId = req.body.userId;
    const postId = req.body.postId;
    const commentText = 'This is a test comment.';

    try {
        const { user_sub, access_token } = await GetLinkedInUserData(userId);

        const q = "SELECT `linkedin_id` FROM posts p WHERE p.id=?";
        db.query(q, postId, async (err, data) => {
            if (err) {
                console.error(`Error getting post's LinkedIn id:`, err);
                throw err;
            }

            if (data.length === 0) {
                console.log('LinkedIn Post ID not found!');
                return res.status(404).json({ error: 'LinkedIn Post ID not found' });
            }

            // const linkedinPostId = data[0].linkedin_id.split(":")[3];
            const linkedinPostId = 'urn:li:activity:7157165424864899072';
            console.log ("linked in id : ", linkedinPostId)

            try {
                const apiUrl = `https://api.linkedin.com/v2/socialActions/${linkedinPostId}/comments`;
                console.log("api urL: ", apiUrl)
                const commentData = {
                    actor: `urn:li:person:${user_sub}`,
                    object: `${linkedinPostId}`,
                    message: {
                        text: commentText,
                    },
                };
                console.log('comment data: ', commentData)
                console.log('user sub and accesstoken', user_sub, access_token)
                const response = await axios.post(apiUrl, commentData, {
                    headers: {
                        'LinkedIn-Version': '202304',
                        Authorization: `Bearer ${access_token}`,
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Comment posted successfully:', response.data);

                return res.status(200).json(response.data);
            } catch (error) {
                console.error('Error posting comment to LinkedIn:', error.response ? error.response.data : error.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    } catch (error) {
        console.error('Error getting user data from LinkedIn:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};