import express from "express";
import { getCurrentUser, login, logout, register } from "../controllers/auth.js";
import { authenticateToken } from "../middleware/verifyJWT.js"

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/current-user", authenticateToken, getCurrentUser)


export default router;