import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const getCookie = (req,res) => {
  // console.log('cookies')
  // console.log(req.cookies)
  return res.status(200).json(res.cookies)
}

export const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    // Assuming db.query is an asynchronous function for querying the database
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.log('error when getting user by id')
            reject(err);
        } else if (results.length === 0) {
            console.log('user not found');
            reject("User not found");
        } else {
            // Assuming the user's information is stored in the first element of the results array
            const user = results[0];
            resolve(user);
        }
    });
});
}

export const getCurrentUser = async (req,res) => {
  // console.log('get current user with id:', req.user.id)

  try {
    // Call the getUserById function to fetch the user's information
    const currentUser = await getUserById(req.user.id);

    // console.log('got user from getUserById: ', currentUser)
    res.status(200).json(currentUser);
} catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
}
}

export const register = (req, res) => {
  //CHECK EXISTING USER
  const q = "SELECT * FROM users WHERE email = ? OR username = ?";

  if (req.body.email === '' || req.body.username === '' || req.body.first_name === '' || req.body.last_name === '' || req.body.password === '') return res.status(400).json("Please fill out all fields!")

  db.query(q, [req.body.email, req.body.username, req.body.first_name, req.body.last_name], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("username/email already exists!");

    //Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q = "INSERT INTO users(`username`,`email`, `first_name`, `last_name`, `password`) VALUES (?)";
    const values = [req.body.username, req.body.email, req.body.first_name, req.body.last_name, hash];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
};

export const login = async (req, res) => {
  //CHECK USER

  const q = "SELECT * FROM users WHERE username = ?";
  console.log('login called', req.body);
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    //Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Wrong username or password!");

      console.log("USER ID for saving token:", data[0].id)
      const token = jwt.sign({ id: data[0].id }, "hello", {expiresIn: '1d',});
      console.log('token: ', token)
      const { password, ...other } = data[0];
      console.log('other: ', other);
  
      // res.cookie("access_token", token, {
      //     httpOnly: true,
      //   })
      //   .status(200)
      //   .json(other);
      res.cookie("token", token, {
        httpOnly: true,
    }).status(200).json(other);
    
    // return res.redirect("/");//
      // console.log(token)
  });
};

export const logout = async(req, res) => {
  console.log('backend logout');
  res.clearCookie("token", { httpOnly: true }).status(200).json("User has been logged out.");

};