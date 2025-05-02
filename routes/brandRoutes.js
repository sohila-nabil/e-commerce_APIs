import express from "express";
import authMiddleware, { isAdmin } from "./../middlewares/auth.js";
import {
  createBrand,
  getAllBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.ctrl.js";

const brandRouter = express.Router();

brandRouter.post("/create", authMiddleware, isAdmin, createBrand);
brandRouter.get("/:id", getBrand);
brandRouter.get("/", getAllBrands);
brandRouter.put("/update/:id", authMiddleware, isAdmin, updateBrand);
brandRouter.delete("/delete/:id", authMiddleware, deleteBrand);

export default brandRouter;
