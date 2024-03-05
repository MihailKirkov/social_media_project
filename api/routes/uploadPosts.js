import express from "express"
import { uploadToInstagram, GoogleAuthorization, GoogleRedirect} from "../controllers/uploadPost.js"
import { LinkedInAuthorization, LinkedInRedirect, LinkedInCreatePost, LinkedInComment } from "../controllers/linkedin.js"
import { FacebookAuthorization, FacebookRedirect, FacebookCreatePost } from "../controllers/facebook.js"

const router = express.Router()

router.post("/upload_to_instagram", uploadToInstagram)

router.get("/linkedin/authorize", async(req,res) => {
    console.log('Authorizing for LinkedIn...');
    try {
        const authorizationUrl = await LinkedInAuthorization(req, res);
        return res.json({ authorizationUrl });
    } catch (error) {
        console.error('LinkedIn Authorization Error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get("/linkedin/redirect", async(req,res) => {
    // console.log('redirecting for linkedin', req.query)
    try {
        await (LinkedInRedirect(req, res));
        // return res.status(200).json("nice");
        return res.redirect('http://localhost:3000');
    } catch(error) {
        console.log("Error in LinkedIn Redirect: ", error);
        return res.status(500).json({error: "Internal Server Error"})
    }
});
router.post("/linkedin/share", async(req,res) => {
    try {
        await (LinkedInCreatePost(req,res));
        return res.redirect('http://localhost:3000')
    } catch (error) {
        console.error("Error when sharing post to linkedin: ", error);
        return res.status(500).json({error: "Internal Server Error"})
    }
})
router.post("/linkedin/comment", async(req,res) => {
    try {
        await (LinkedInComment(req,res));
        // return res.redirect('http://localhost:3000')
    } catch (error) {
        console.error("Error commenting to linkedin post: ", error);
        return res.status(500).json({error: "Internal Server Error"})
    }
})
router.get("/facebook/authorize", async(req,res) => {
    console.log('Authorizing for FB...');
    try {
        const authorizationUrl = await FacebookAuthorization(req, res);
        return res.json({ authorizationUrl });
    } catch (error) {
        console.error('FaceBook Authorization Error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})
router.get("/facebook/redirect", async(req,res) => {
    try {
        await (FacebookRedirect(req, res));
        return res.status(200).json("nice");
        // return res.redirect('http://localhost:3000');
    } catch(error) {
        console.log("Error in LinkedIn Redirect: ", error);
        return res.status(500).json({error: "Internal Server Error"})
    }
})
router.post("/facebook/share", async(req,res)=> {
    try {
        await (FacebookCreatePost(req,res));
        return res.redirect('http://localhost:3000')
    } catch (error) {
        console.error("Error when sharing post to FaceBook: ", error);
        return res.status(500).json({error: "Internal Server Error"})
    }
})
router.get("/google/authorize", async(req,res) => {
    // console.log('authorizing for google', req.query)
    try {
        const authorizationUrl = await GoogleAuthorization(req,res);
        return res.json({ authorizationUrl });
    } catch (error) {
        console.error('Google Authorization Error: ', error.message)
        return res.status(500).json({ error: 'Internal Server Error'})
    }
})
router.get("/google/redirect", (req,res) => {
    // console.log("redirecting for google", req.query)
    return res.json(GoogleRedirect(req.query.code, req.query.state))
})

export default router;