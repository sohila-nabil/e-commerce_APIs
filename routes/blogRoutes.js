import express from "express";
import authMiddleware, { isAdmin } from "./../middlewares/auth.js";
import {
  createBlog,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  likeBlog,
  disLikeBlog,
} from "../controllers/blog.ctrl.js";

const blogRouter = express.Router();

blogRouter.post("/create-blog", authMiddleware, isAdmin, createBlog);
blogRouter.get("/:id", getSingleBlog);
blogRouter.get("/", getAllBlogs);
blogRouter.put("/update/:id", authMiddleware, isAdmin, updateBlog);
blogRouter.put("/like/:id", authMiddleware, likeBlog);
blogRouter.put("/dislike/:id", authMiddleware, disLikeBlog);
blogRouter.delete("/delete/:id", authMiddleware, isAdmin, deleteBlog);

export default blogRouter;
