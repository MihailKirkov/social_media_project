import express from "express"
import { addComment, addPost, deletePost, getCommentsByPostId, getLinkedInPosts, getPost, getPosts, getUserPosts, getYourPosts, updatePost } from "../controllers/post.js"
import {authGroupExists} from "../middleware/verifyJWT.js"
const router = express.Router()

router.get("/:group_name", authGroupExists(), getPosts)
router.get("/",  getPosts)
router.get("/get_post/:id", getPost)
router.get("/your_posts/:id", getYourPosts)
router.get("/user_posts/:id/:post_id", getUserPosts)
router.get("/linkedin_posts/:group_name", getLinkedInPosts)
router.post("/", addPost)
router.delete("/:id", deletePost)
router.put("/:id", updatePost)
router.post("/comment", addComment)
router.get("/comments/:post_id", getCommentsByPostId)

export default router;