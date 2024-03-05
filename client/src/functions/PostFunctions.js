import axios from "axios";

export const GetPostById = async (postId) => {
    try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}posts/get_post/${postId}`);
        return res.data;
    } catch (error) {
        throw `Error fetching post ${error}`;
    }
}

export const DeletePostById = async (postId) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}posts/${postId}`);
}
