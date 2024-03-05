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

export const GetTextFromContent = (content) => {
    try {
        const $ = cheerio.load(content);

        const text = $('body').text();

        return text;
    } catch (error) {
        console.error('Error extracting text from content:', error.message);
        return null;
    }
};





export const uploadToInstagram = (req, res) => {
    // console.log(" UPLOAD TO INTSAGRAM", req.body)
    const postToInsta = async (ig_username, ig_password, img, content) => {
    
        const ig = new IgApiClient();
        ig.state.generateDevice(ig_username);
        await ig.account.login(ig_username, ig_password);
        
        await ig.publish.photo({
            file: await readFileAsync(img),
            caption: content,
        });
    }
    postToInsta(req.body.ig_username, req.body.ig_password, req.body.img, req.body.content);
}



export const GoogleAuthorization = (req, res) => {
    try {
        const { title, content, img, reciever } = req.query;
        if (!content || !title || !reciever) {
            throw new Error('Content, title and reciever are required parameters.');
        }
        const sessionId = Math.random().toString(36).substring(7);
        tempStorage[sessionId] = { title, content, img, reciever };
        
        return encodeURI(`https://accounts.google.com/o/oauth2/v2/auth?scope=${process.env.GOOGLE_SCOPE}+email&access_type=offline&include_granted_scopes=true&response_type=code&state=${sessionId}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&client_id=${process.env.GOOGLE_CLIENT_ID}`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    
}

export const GoogleRedirect = async(code, sessionId) => {
    // console.log('code: ', code)
    // console.log('session content: ', tempStorage[sessionId])
    const {title, content, img, reciever} = tempStorage[sessionId]
    const payload = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
        code: code,
    };

    try {
        const { data: accessTokenResponse } = await axios({
            url: `https://oauth2.googleapis.com/token?${qs.stringify(payload)}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        
        
        const accessToken = accessTokenResponse.access_token;

        const { data: userInfo } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userEmail = userInfo.email;

        const from = userEmail;
        const to = reciever;
        const subject = title;
        const text = GetTextFromContent(content);

        if (img) {
            const imgPath = '../client/public/upload/' + img;
            const fileData = fs.readFileSync(imgPath);
            const imgBase64 = fileData.toString('base64');

            const boundary = 'foo_bar_baz';

            const first_part = 
                `Content-Type: multipart/mixed; boundary=${boundary}\r\n` +
                'MIME-Version: 1.0\r\n' +
                `to: ${to}\r\n` + 
                `from: ${from}\r\n` +
                `subject: ${subject}\r\n\r\n` +
                `--${boundary}\r\n` +
                `${text}\r\n\r\n`;

            const second_part = 
                `--${boundary}\r\n` +
                'Content-Type: application/png\r\n' +
                'MIME-Version: 1.0\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                `Content-Disposition: attachment; filename="${path.basename(img)}"\r\n\r\n` +
                `${imgBase64}\r\n` +
                `--${boundary}--`;

            const emailData = first_part + second_part;
            await axios.post('https://www.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media', emailData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'message/rfc822',
                },
            });
        }
        else {
            const emailString = `From: ${from}\nTo: ${to}\nSubject: ${subject}\n\n${text}`;
            const emailData = {raw: Buffer.from(emailString).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')};

            await axios.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', emailData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
        }

        return "Post has been sent as an email successfully!";
    } catch(error) {
        console.error('Error Sending Email:', error.response ? error.response.data : error.message);
        throw error;
    }
}