import jwt from "jsonwebtoken";
import { db } from "../db.js"

export const authenticateToken = (req, res, next) => {
    // console.log('authenticating token in the backend : ', req.cookies.token)
    const token = req.cookies.token;
    if (!token) {
        console.log('could not find token ')
        return res.status(401).json({ message: "Authentication token is required" });
    }

    jwt.verify(token, "hello", (err, user) => {
        if (err) {
            console.log('err while veryifying token')
            res.clearCookie("token", { httpOnly: true }).status(403).json("Token expired or invalid.");
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

export const authUserRole = (permissions) => {
    return (req,res,next) => {
        const q = "SELECT u.role FROM users u WHERE u.id=?"
        // console.log("auth role:", req.params)
        db.query(q, [req.params.user_id], (err,data) => {
            if (err) {
                console.error("Error verifying user role");
                return res.status(401).json("Role verification issue!");
            }
            else {
                try {
                    const userRole= data[0].role
                    // console.log("user role when checking:", userRole)

                    if (permissions.includes(userRole)) {
                        // console.log("has access")
                        next();
                    } else {
                        return res.status(401).json("User Does Not Have Access")
                    }
                } catch(err) {
                    console.error(err);
                    return res.status(500).json("Error");
                }
            }
        })
        
    }
}

export const authGroupExists = () => {
    return (req, res, next) => {
        // console.log(`Checking if group ${req.params.group_name} exists`);

        const q = "SELECT * FROM `groups` WHERE `name`=?";

        db.query(q, [req.params.group_name], (err, data) => {
            if (err) {
                // An error occurred while querying the database
                console.error("Error checking group existence:", err);
                return res.status(500).json("Group Does Not Exist!");
            }

            // Check if the group exists based on the query result
            const exists = data.length > 0;

            if (exists) {
                // console.log("It exists!");
                next();
            } else {
                // console.log("It does NOT exist!");
                return res.status(500).json("Group Does Not Exist");
            }
        });
    };
};

export const authorization = (req, res, next) => {
    // console.log("authorization...")

    // const token = req.cookies.access_token;
    // console.log(req.cookies)
    // if (!token) {
    //     return res.sendStatus(403);
    // }
    // try {
    //     const data = jwt.verify(token, "jwtkey");
    //     req.userId = data.id;
    //     // req.userRole = data.role;
    //     console.log("Successfull authorization")
    //     return next();
    // } catch {
    //     return res.sendStatus(403);
    // }
};

// export const verify = (req, res, next) => {
    
//     const authHeader = req.headers.cookie.split("=")[1]

    
//     console.log(authHeader)
//     if (authHeader) {
//         const token = authHeader.split(" ")[1];

//         jwt.verify(token,"jwtkey", (err,user)=> {
//             if (err) {
//                 return res.status(401).json("Token is not valid! aaa");
//             }

//             req.user = user;
//             next();
//         })
//     } else {
//         res.status(401).json("You are not authenticated! aaa")
//     }
// }