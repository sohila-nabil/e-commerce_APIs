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
  uploadImages,
  deleteImages,
  deleteOneImage,
} from "../controllers/blog.ctrl.js";
import upload from "../middlewares/uploadImages.js";

const blogRouter = express.Router();

blogRouter.post("/create-blog", authMiddleware, isAdmin, createBlog);
blogRouter.get("/:id", getSingleBlog);
blogRouter.get("/", getAllBlogs);
blogRouter.put("/update/:id", authMiddleware, isAdmin, updateBlog);
blogRouter.put("/delete-image/:id", authMiddleware, isAdmin, deleteOneImage);
blogRouter.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  upload.array("images", 2),
  // blogImageResize,
  uploadImages
);
blogRouter.put("/like/:id", authMiddleware, likeBlog);
blogRouter.put("/dislike/:id", authMiddleware, disLikeBlog);
blogRouter.delete("/delete/:id", authMiddleware, isAdmin, deleteBlog);
blogRouter.delete("/delete-images/:id", authMiddleware, isAdmin, deleteImages);

export default blogRouter;
