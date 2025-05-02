import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.ctrl.js";

import authMiddleware, { isAdmin } from "../middlewares/auth.js";

const couponRouter = express.Router();

couponRouter.post("/create", authMiddleware,isAdmin, createCoupon);
couponRouter.get("/", authMiddleware, isAdmin,getAllCoupons);
couponRouter.get("/:id", authMiddleware, getCoupon);
couponRouter.put("/update/:id", authMiddleware, isAdmin,updateCoupon);
couponRouter.delete("/delete/:id", authMiddleware, isAdmin, deleteCoupon);

export default couponRouter;
