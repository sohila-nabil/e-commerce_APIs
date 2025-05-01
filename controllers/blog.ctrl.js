import Blog from "../models/blog.model.js";
import asyncHandler from "express-async-handler";
import validateMongoId from "../utils/validateMongoId.js";

const createBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create(req.body);
  res
    .status(200)
    .json({ success: true, message: " Blog Created Successfully", blog });
});

const getSingleBlog = asyncHandler(async (req, res) => {
  validateMongoId(req.params.id);
  const blog = await Blog.findById(req.params.id).populate('likes disLikes');
  if (!blog) {
    res.status(404).json({ success: false, message: "Blog Not Found" });
  }
  blog.numViews += 1;
  await blog.save();
  res.status(200).json(blog);
});

const updateBlog = asyncHandler(async (req, res) => {
  validateMongoId(req.params.id);
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!blog) {
    res.status(404).json({ success: false, message: "Blog Not Found" });
  } else {
    res.status(200).json({ success: true, message: "Blog Updated", blog });
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  validateMongoId(req.params.id);
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) {
    res.status(404).json({ success: false, message: "Blog Not Found" });
  } else {
    res.status(200).json({ success: true, message: "Blog Deleted" });
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({});
  if (!blogs || blogs.length === 0) {
    res.status(404).json({ success: false, message: "No Blogs Found" });
  }
  res.status(200).json(blogs);
});

const likeBlog = asyncHandler(async (req, res) => {
  validateMongoId(req.params.id);
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog Not Found" });
  }

  const userId = req.user._id.toString();
  const alreadyLiked = blog.likes.includes(userId);
  const alreadyDisliked = blog.disLikes.includes(userId);

  if (alreadyLiked) {
    blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    blog.isLiked = false;
  } else {
    // Add like
    blog.likes.push(userId);
    blog.isLiked = true;

    // Remove dislike if it exists
    if (alreadyDisliked) {
      blog.disLikes = blog.disLikes.filter((id) => id.toString() !== userId);
      blog.isDisLiked = false;
    }
  }

  await blog.save();
  res.status(200).json({ success: true, message: "Blog like updated", blog });
});

const disLikeBlog = asyncHandler(async (req, res) => {
  validateMongoId(req.params.id);
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog Not Found" });
  }

  const userId = req.user._id.toString();
  const alreadyDisliked = blog.disLikes.includes(userId);
  const alreadyLiked = blog.likes.includes(userId);

  if (alreadyDisliked) {
    // Remove dislike
    blog.disLikes = blog.disLikes.filter((id) => id.toString() !== userId);
    blog.isDisLiked = false;
  } else {
    // Add dislike
    blog.disLikes.push(userId);
    blog.isDisLiked = true;

    // Remove like if it exists
    if (alreadyLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
      blog.isLiked = false;
    }
  }

  await blog.save();
  res
    .status(200)
    .json({ success: true, message: "Blog dislike updated", blog });
});

export {
  createBlog,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  likeBlog,
  disLikeBlog,
};
