import { db } from "../db.js"

export const getUserByUsername = (req,res) => {
    const q = "SELECT `username`, `email`, `first_name`, `last_name`, `img`, `position` FROM users WHERE username = ?"
    // console.log("get user by username", req.params)
    db.query(q,[req.params.username], (err,data)=>{
        if (err) return res.status(500).json(err);

        return res.status(200).json(data[0])
    })
}

export const getUserById = (req,res) => {
    const q = "SELECT `username`, `email`, `first_name`, `last_name`, `img`, `position` FROM users WHERE id = ?"
    // console.log("get user by username", req.params)
    db.query(q,[req.params.user_id], (err,data)=>{
        if (err) return res.status(500).json(err);

        return res.status(200).json(data[0])
    })
}

export const updateUser = (req,res) => {
    const userId = req.params.id;
    const values = [
        req.body.email,
        req.body.first_name,
        req.body.last_name,
        req.body.position,
        req.body.img
    ]
    
    // console.log("update user :", values, userId)
    
    const q = "UPDATE users u SET u.email=?, u.first_name=?, u.last_name=?, u.position=?, u.img=? WHERE u.id=?"

    db.query(q,[...values, userId], (err,data) =>{
        if (err) return res.status(500).json(err);

        return res.status(200).json(data[0])
    })
}

export const getAllUsers = (req, res) => {
    const q = "SELECT `username`, `first_name`, `last_name`, `img`, `id` FROM users"

    db.query(q, (err,data)=>{
        if (err) return res.status(500).json(err);

        return res.status(200).json(data)
    })
}