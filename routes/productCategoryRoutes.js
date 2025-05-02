import express from "express";
import authMiddleware, { isAdmin } from "../middlewares/auth.js";
import {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/productCategory.ctrl.js";

const categoryRouter = express.Router();

categoryRouter.post("/create", authMiddleware, isAdmin, createCategory);
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategory);
categoryRouter.put("/update/:id", authMiddleware, isAdmin, updateCategory);
categoryRouter.delete("/delete/:id", authMiddleware, isAdmin, deleteCategory);

export default categoryRouter;
