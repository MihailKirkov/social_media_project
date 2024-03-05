import { db } from "../db.js"
import jwt from "jsonwebtoken";
import { getCookie } from "./auth.js";


export const getPosts = (req,res) => {
    // console.log('getposts', req.query, req.params.group_name)
    const q = req.params.group_name
    ? "SELECT p.id, p.user_id, p.group_name, `username`, `title`, `desc`, `content`, `created_at`, p.img, u.img AS userImg FROM users u JOIN posts p ON u.id=p.user_id JOIN postgroups pg ON pg.post_id=p.id WHERE pg.group_name=?" // group posts
    : "SELECT p.id, p.user_id, `username`, `title`, `desc`, `content`, `created_at`, p.img, u.img AS userImg FROM users u JOIN posts p ON u.id=p.user_id WHERE is_global=1"; // global posts
    

    db.query(q,[req.params.group_name], (err,data)=>{
        if (err) return res.status(500).send(err);

        return res.status(200).json(data);
    })
}

export const getLinkedInPosts = (req,res) => {
    const q = "SELECT p.id, `username`, `title`, `desc`, `content`, `created_at`, `linkedin_id`, p.img, u.img AS userImg FROM users u JOIN posts p ON u.id=p.user_id WHERE linkedin_id IS NOT NULL"

    db.query(q,[req.params.group_name], (err,data) => {
        if (err) return res.status(500).send(err);

        return res.status(200).json(data);
    })
}

export const getPost = (req,res) => {
    const q = "SELECT p.id, `username`, `title`, `desc`, `content`, p.img, u.img AS userImg, u.id AS userId, `created_at` FROM users u JOIN posts p ON u.id=p.user_id WHERE p.id = ?"

    db.query(q,[req.params.id], (err,data)=>{
        if (err) return res.status(500).json(err);

        return res.status(200).json(data[0])
    })
}

export const getYourPosts = (req, res) => {
    const q = "SELECT p.id, `username`, `title`, `desc`, `content`, `created_at`, p.img, u.img AS userImg FROM posts p JOIN users u ON p.user_id=u.id WHERE user_id=?" // get all global posts from the user
    // console.log('get your posts', req.params)
    db.query(q,[req.params.id], (err,data)=>{
        if (err) return res.status(500).send(err);

        return res.status(200).json(data);
    })
}

export const getUserPosts = (req, res) => {
    const q =  req.params.post_id 
    ? "SELECT p.id, `username`, `title`, `desc`, `content`, `created_at`, p.img, u.img AS userImg FROM posts p JOIN users u ON p.user_id=u.id WHERE user_id=? AND p.is_global = 1 AND p.id != ?" // get all global posts except for one with id = post_id
    : "SELECT p.id, `username`, `title`, `desc`, `content`, `created_at`, p.img, u.img AS userImg FROM posts p JOIN users u ON p.user_id=u.id WHERE user_id=? AND p.is_global=1"
    console.log('getuserposts backend', req.params)
    const params = req.params.post_id ? [req.params.id, req.params.post_id] : [req.params.id, null];
    console.log(params);
    db.query(q,params, (err,data)=>{
        if (err) return res.status(500).send(err);

        return res.status(200).json(data);
    })
}

export const addPost = (req,res) => {
    // console.log("Add Post/post.js")
    // const token = req.cookies.access_token;
    // console.log('addpost cookies:', req.cookies)
    // return res.status(200).json(req.cookies)
    // if (!token) return res.status(401).json("Not authenticated! jwt token error")

    // jwt.verify(token,"jwtkey", (err, userInfo)=>{
    //     if(err) return res.status(403).json("Token is not valid!")
        
        console.log('add post');

        const q = "INSERT INTO posts (`title`, `desc`, `content`, `img`, `user_id`, `created_at`, `is_global`) VALUES (?)"

        const values = [
            req.body.title,
            req.body.desc,
            req.body.content,
            req.body.img,
            req.body.user_id,
            req.body.created_at,
            req.body.is_global
        ]


        console.log(values);

        db.query(q,[values], (err,data)=>{
            console.log('trying 1st query');
            if (err) return res.status(500).json(err);
            console.log('no error on first query')
            const post_id = data.insertId;
            
            if (req.body.groups && Array.isArray(req.body.groups) && req.body.groups.length > 0) {
                const groups = req.body.groups.map(group => [post_id, group.id, group.name]);
                console.log('groups value:', groups)
                const postGroupsQuery = "INSERT INTO postgroups (`post_id`, `group_id`, `group_name`) VALUES ?";
                db.query(postGroupsQuery, [groups], (err, data) => {
                    if (err) {console.log('err1');return res.status(500).json(err);}
                    
                    console.log('res2');
                    return res.json("Post has been created and added to the associated groups.");
                });
            }
            else {
                console.log('res3');
                return res.json("Post has been created.");
            }
        })


}

export const deletePost = (req,res) => {
    // const { currentUser} = useContext(AuthContext);

    // const token = req.cookies.access_token
    // if (!token) return res.status(401).json("Not authenticated!")

    // jwt.verify(token,"jwtkey", (err, userInfo)=>{
    //     if(err) return res.status(403).json("Token is not valid!")

        const postId = req.params.id
        // const userId = req.params.user_id
        const q = "DELETE FROM posts p WHERE p.id = ?"// AND `user_id` = ?"

        db.query(q,[postId], (err,data)=>{
            if(err) return res.status(403).json("Error while deleting post!")

            return res.json("Post has been deleted!");
        })
    // })
}

export const updatePost = (req,res) => {
    // console.log("update post...")
    // const token = req.cookies.access_token
    
    // if (!token) return res.status(401).json("Not authenticated!")
    
    // jwt.verify(token,"jwtkey", (err, userInfo)=>{
    //     if(err) return res.status(403).json("Token is not valid!")
        console.log('update post')
        console.log(req.params);
        const postId = req.params.id;
            // console.log("with image: ", req.body)
        if ((req.body?.img && req.body.img.length > 0) || req.body?.del_img === true) {
            const q = "UPDATE posts p SET p.title=?, p.desc=?, p.content=?, p.img=?, p.edited_at=?, p.is_global=? WHERE p.id=?"
            const values = [
                req.body.title,
                req.body.desc,
                req.body.content,
                req.body.img,
                req.body.edited_at,
                req.body.is_global
            ]
            console.log(values, postId)
            db.query(q, [...values, postId], (err,data)=>{
                if (err) return res.status(500).json(err);
                
                const qDeletePostGroups = "DELETE FROM postgroups WHERE post_id = ?";
                db.query(qDeletePostGroups, [postId], (errDeletePostGroups, dataDeletePostGroups) => {
                    if (errDeletePostGroups) {
                        console.error('Database error:', errDeletePostGroups);
                        return res.status(500).json(errDeletePostGroups);
                    }
                    
                    if (req.body.groups && req.body.groups.length > 0 && Array.isArray(req.body.groups)) {
                        const groups = req.body.groups.map(group => [postId, group.id, group.name]);
                        // console.log('groups value:', groups)
                        const postGroupsQuery = "INSERT INTO postgroups (`post_id`, `group_id`, `group_name`) VALUES ?";
        
                        db.query(postGroupsQuery, [groups], (err, data) => {
                            if (err) return res.status(500).json(err);
                            return res.json("Post has been updated and added to the associated groups.");
                        });
                    }
                    else {
                        return res.json("Post has been updated.")
                    }
                })
            })
        }
        
        else {
            console.log("without image: ", req.body)
            const q = "UPDATE posts p SET p.title=?, p.desc=?, p.content=?, p.edited_at=?, p.is_global=? WHERE p.id=?"
            const values = [
                req.body.title,
                req.body.desc,
                req.body.content,
                req.body.edited_at,
                req.body.is_global
            ]
            // console.log(values, postId)
            db.query(q, [...values, postId], (err,data)=>{
                if (err) return res.status(500).json(err);
                
                const qDeletePostGroups = "DELETE FROM postgroups WHERE post_id = ?";
                db.query(qDeletePostGroups, [postId], (errDeletePostGroups, dataDeletePostGroups) => {
                    if (errDeletePostGroups) {
                        console.error('Database error:', errDeletePostGroups);
                        return res.status(500).json(errDeletePostGroups);
                    }
                    if (req.body.groups && req.body.groups.length>0 && Array.isArray(req.body.groups)) {
                        const groups = req.body.groups.map(group => [postId, group.id, group.name]);
                        // console.log('groups value:', groups)
                        const postGroupsQuery = "INSERT INTO postgroups (`post_id`, `group_id`, `group_name`) VALUES ?";

                        db.query(postGroupsQuery, [groups], (err, data) => {
                            if (err) return res.status(500).json(err);
                            return res.json("Post has been updated and added to the associated groups.");
                        });
                    }
                    else {
                        return res.json("Post has been updated.")
                    }
                })
            })
        }
        
}

export const addComment = (req,res) => {
    const q = "INSERT INTO comments (`post_id`, `user_id`, `content`, `created_at`) VALUES (?)"
    const values = [
        req.body.post_id,
        req.body.user_id,
        req.body.content,
        req.body.created_at
    ]
    db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Comment added successfully!")
    })
    console.log('add comment in db with data:', req.body)
}

export const getCommentsByPostId = (req,res) => {
    const q = "SELECT id, user_id, content, created_at FROM comments WHERE post_id=?"
    db.query(q, req.params.post_id, (err,data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    })
}