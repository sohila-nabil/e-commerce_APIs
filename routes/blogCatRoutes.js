import express from "express";
import authMiddleware, { isAdmin } from "../middlewares/auth.js";
import {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/blogCat.ctrl.js";

const blogCategoryRouter = express.Router();

blogCategoryRouter.post("/create", authMiddleware, isAdmin, createCategory);
blogCategoryRouter.get("/", getAllCategories);
blogCategoryRouter.get("/:id", getCategory);
blogCategoryRouter.put("/update/:id", authMiddleware, isAdmin, updateCategory);
blogCategoryRouter.delete(
  "/delete/:id",
  authMiddleware,
  isAdmin,
  deleteCategory
);

export default blogCategoryRouter;
