import { db } from "../db.js"

export const getUserGroups = (req, res) => {
    const q = "SELECT ug.group_id, g.name, ug.role FROM usergroups ug JOIN users u ON ug.user_id=u.id JOIN `groups` g ON g.id=ug.group_id  WHERE u.id=?"

    db.query(q,[req.params.id], (err,data)=>{
        if (err) return res.status(500).send(err);

        return res.status(200).json(data);
    })
}

export const getGroups = (req, res) => {
    const q = "SELECT * FROM `groups`"

    db.query(q, (err,data)=>{
        if (err) return res.status(500).send(err);
        
        return res.status(200).json(data);
    })
}

export const getGroupMembers = (req, res) => {
    const q = "SELECT u.first_name, u.last_name, u.id FROM users u JOIN usergroups ug ON ug.user_id=u.id WHERE ug.group_id=?"

    db.query(q,[req.params.id], (err,data)=>{
        if (err) return res.status(500).send(err);

        return res.status(200).json(data);
    })
}

export const getGroupNonMembers = (req, res) => {
    const q = `
        SELECT u.first_name, u.last_name, u.id
        FROM users u
        LEFT JOIN usergroups ug ON ug.user_id = u.id AND ug.group_id = ?
        WHERE ug.group_id IS NULL
    `;

    db.query(q,[req.params.id], (err,data)=>{
        if (err) return res.status(500).send(err);

        return res.status(200).json(data);
    })
}

export const addMember = (req, res) => {
    const q = "INSERT INTO usergroups (`user_id`, `group_id`) VALUES (?)"
    const values = [
        req.params.user_id,
        req.params.group_id
    ]

    db.query(q,[values], (err,data)=>{
        if (err) return res.status(500).send(err);

        return res.json("User has been added successfully!")
    })
}

export const removeMember = (req, res) => {
    const q = "DELETE FROM usergroups ug WHERE ug.user_id = ? AND ug.group_id = ?"
    // console.log('req params to remove member: ', req.params)

    db.query(q,[req.params.user_id, req.params.group_id], (err,data)=>{
        if (err) return res.status(500).send(err);

        return res.json("User has been kicked!");
    })
}

export const createGroup = (req, res) => {
    const q = "INSERT INTO `groups` (`name`) VALUES (?)"
    // console.log('creating group', req.params)
    const values = [
        req.params.group_name
    ]

    db.query(q, [values], (err,data)=>{
        if (err) return res.status(500).send(err);

        return res.json("Group has been created successfully")
    })
}