import express from "express";
import {
  createColor,
  getAllColors,
  getColor,
  updateColor,
  deleteColor,
} from "../controllers/color.ctrl.js";

import authMiddleware, { isAdmin } from "./../middlewares/auth.js";

const colorRouter = express.Router();

colorRouter.post("/create", authMiddleware, isAdmin, createColor);
colorRouter.get("/:id", getColor);
colorRouter.get("/", getAllColors);
colorRouter.put("/update/:id", authMiddleware, isAdmin, updateColor);
colorRouter.delete("/delete/:id", authMiddleware, deleteColor);

export default colorRouter;
