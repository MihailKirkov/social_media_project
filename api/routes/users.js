import express from "express"
import { getAllUsers, getUserById, getUserByUsername, updateUser } from "../controllers/user.js"
import {authUserRole} from "../middleware/verifyJWT.js"

const router = express.Router()

// router.get("/:id", getUserById)
router.get("/user/:username", getUserByUsername)
router.get("/userById/:user_id", getUserById)
router.get("/get_users/:user_id", authUserRole(["admin"]), getAllUsers)
router.put("/user/:id", updateUser)

export default router