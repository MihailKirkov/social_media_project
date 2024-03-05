import express from "express"
import { addMember, createGroup, getGroupMembers, getGroupNonMembers, getGroups, getUserGroups, removeMember } from "../controllers/group.js"
import {authUserRole} from "../middleware/verifyJWT.js"
import { getPosts } from "../controllers/post.js"
const router = express.Router()

router.get("/user_groups/:id", getUserGroups)
router.get("/manage_groups/:user_id", authUserRole(["editor","admin"]), getGroups)
router.get("/manage_group_posts/:group_name/:user_id", authUserRole(["admin", "editor"]), getPosts)
router.get("/manage_global_posts/:user_id", authUserRole(["admin", "editor"]), getPosts)
router.get("/group_members/:id", getGroupMembers)
router.get("/group_non_members/:id", getGroupNonMembers)
router.post("/create_group/:group_name",  createGroup)
router.post("/:group_id/:user_id", addMember)
router.delete("/:group_id/:user_id", removeMember)

export default router;