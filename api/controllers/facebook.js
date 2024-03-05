import { IgApiClient } from "instagram-private-api"
import { promisify } from 'util';
import { readFile } from 'fs';
import qs from 'querystring';
import nodemailer from "nodemailer";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import cheerio from "cheerio";
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { db } from "../db.js"
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });
const readFileAsync = promisify(readFile);
const tempStorage = {};

export const FacebookAuthorization = (req,res) => {
    try {
        return encodeURI(`https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&scope=${process.env.FACEBOOK_SCOPE}&response_type=code&state=${req.query.userId}`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const FacebookRedirect = async (req, res) => {
    const code = req.query.code,
        userId = req.query.state;

    try {
        // Exchange authorization code for user access token
        const accessTokenResponse = await axios.get(
            'https://graph.facebook.com/v19.0/oauth/access_token',
            {
                params: {
                    client_id: process.env.FACEBOOK_CLIENT_ID,
                    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
                    redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
                    code: code,
                },
            }
        );

        const userAccessToken = accessTokenResponse.data.access_token;

        // Fetch user data including accounts (pages) using the user access token
        const userDataResponse = await axios.get(
            'https://graph.facebook.com/v19.0/me',
            {
                params: {
                    fields: 'id,name,accounts{access_token,id}',
                    access_token: userAccessToken,
                },
            }
        );

        const userData = userDataResponse.data;

        // Extract the page access token and page ID from the user's accounts
        const pageData = userData.accounts?.data?.[0];
        const pageAccessToken = pageData?.access_token;
        const pageId = pageData?.id;

        // Now you have user data, the page access token, and the page ID
        console.log('user data:', userData);
        console.log('page access token:', pageAccessToken);
        console.log('page ID:', pageId);

        // Handle the user data, page access token, and page ID as needed
        // Save them to the database, etc.

        const q = `INSERT INTO usersocials 
                    SET 
                        user_id = ?,
                        facebook_id = ?,
                        facebook_access_token = ?,
                        facebook_page_id = ?,
                        facebook_page_access_token = ?,
                        facebook_name = ?
                    ON DUPLICATE KEY UPDATE
                        facebook_id = VALUES(facebook_id),
                        facebook_access_token = VALUES(facebook_access_token),
                        facebook_page_id = VALUES(facebook_page_id),
                        facebook_page_access_token = VALUES(facebook_page_access_token),
                        facebook_name = VALUES(facebook_name)`;

        const values = [
            userId,
            userData.id,
            userAccessToken,
            pageId,
            pageAccessToken,
            userData.name,
        ];

        db.query(q, values, (err, data) => {
            if (err)
                return 'Error while saving FaceBook Data!';

            return 'User\'s FB Authorized Successfully';
        });
    } catch (error) {
        console.log('Error:', error.response ? error.response.data : error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


export const GetFacebookUserData = async (userId) => {
    return new Promise((resolve, reject) => {
        try {
            const q = "SELECT `facebook_id`, `facebook_access_token`, `facebook_name`, `facebook_page_id`, `facebook_page_access_token` FROM usersocials WHERE user_id=?"
            db.query(q, [userId], (err, data) => {
                if (err) {
                    console.error('Error getting UserId: ', err);
                    reject('Internal Server Error');
                    return;
                }
                console.log("Data from query:", data);
                const user_id = data[0].facebook_id;
                const access_token = data[0].facebook_access_token;
                const name = data[0].facebook_name;
                const page_id = data[0].facebook_page_id;
                const page_access_token = data[0].facebook_page_access_token;
                resolve({ user_id, access_token, name, page_id, page_access_token });
            })
        } catch (error) {
            console.log("Error when querying", error);
            reject('Internal Server Error');
        }
    });
}

export const FacebookCreatePost = async(req,res) => {
    console.log('backend: ', req.body)
    const userId = req.body.userId
    const content = GetTextFromContent(req.body.content)
    const imgPath = req.body.img;
    const postId = req.body.postId
    
    try {
        const { page_id, page_access_token, name } = await GetFacebookUserData(userId);
        console.log("Create a post with this data: ", page_id, page_access_token, content, imgPath)

        const postData = {
            message: content
        };

        // Post to LinkedIn
        const response = await axios.post(`https://graph.facebook.com/${page_id}/feed`, postData, {
            headers: {
                'X-Restli-Protocol-Version': '2.0.0',
                Authorization: `Bearer ${page_access_token}`,
                'Content-Type': 'application/json',
            },
        });
        console.log("response.data after post: ", response.data)
        const facebookPostId = response.data.id;
        // SAVE THE POST ID IN THE POST TABLE
        const updateQuery = "UPDATE posts SET facebook_id = ? WHERE id = ?";
        db.query(updateQuery, [facebookPostId, postId], (err, data) => {
            if (err) {
                console.error('Error updating post FaceBook ID:', err);
                throw err;
            }
            console.log('FaceBook Post ID saved in the post table');
        });

        return 'Posting finished';
    } catch (error) {
        console.error('Error posting to FaceBook:', error.response ? error.response.data : error.message);
        throw error;
    }
}