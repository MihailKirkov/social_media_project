import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import groupRoutes from "./routes/groups.js"
import uploadPostRoutes from "./routes/uploadPosts.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import multer from "multer";
import cors from "cors";
const app = express();

// app.use(cors())
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../client/public/upload");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Use Date.now() to ensure unique filenames
    },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50mb limit
 });

app.post("/api/upload", upload.single("file"), function (req, res) {
    const file = req.file;
    console.log('/api/upload: ', file.filename);
    res.status(200).json({ filename: file.filename }); // Send the modified filename as a response
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/uploadPost", uploadPostRoutes);

app.listen(8800, () => {
    console.log("Connected on port 8800");
});