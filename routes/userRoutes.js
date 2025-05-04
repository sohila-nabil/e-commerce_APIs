import express from "express";
import {
  userRegister,
  userLogin,
  getAllUsers,
  getOneUser,
  deleteUser,
  updateUser,
  blockUserOrUnblockUser,
  refreshTokens,
  logout,
  updatePassword,
  forgetPassword,
  resetPassword,
  adminLogin,
  getWishlistForUser,
  addAddress,
  addToCart,
  getUserCart,
  deleteCart,
  applyCoupon,
  createOrderByCash,
  getUserOrders,
  updateOrderStatus
} from "../controllers/user.ctrl.js";
import authMiddleware from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/login", userLogin);
userRouter.post("/admin-login", adminLogin);
userRouter.post("/forget-password", forgetPassword);
userRouter.post("/add-cart", authMiddleware, addToCart);
userRouter.post("/apply-coupon", authMiddleware, applyCoupon);
userRouter.post("/cash-order", authMiddleware, createOrderByCash);
userRouter.put("/address", authMiddleware, addAddress);
userRouter.get("/refresh", refreshTokens);
userRouter.get("/logout", logout);
userRouter.get("/all-users", getAllUsers);
userRouter.get("/cart", authMiddleware, getUserCart);
userRouter.get("/orders", authMiddleware, getUserOrders);
userRouter.get("/wishlist", authMiddleware, getWishlistForUser);
userRouter.get("/:id", authMiddleware, isAdmin, getOneUser);
userRouter.delete("/delete-cart", authMiddleware, deleteCart);
userRouter.delete("/delete-user/:id", deleteUser);
userRouter.put("/update-user/:id", authMiddleware, isAdmin, updateUser);
userRouter.put("/update-order/:id", authMiddleware, isAdmin,updateOrderStatus);
userRouter.put("/update-password", authMiddleware, updatePassword);
userRouter.put(
  "/block-user/:id",
  authMiddleware,
  isAdmin,
  blockUserOrUnblockUser
);
userRouter.put("/reset-password/:token", resetPassword);

export default userRouter;
