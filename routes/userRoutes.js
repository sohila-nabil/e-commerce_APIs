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
} from "../controllers/user.ctrl.js";
import authMiddleware from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/login", userLogin);
userRouter.post("/forget-password", forgetPassword);
userRouter.get("/refresh", refreshTokens);
userRouter.get("/logout", logout);
userRouter.get("/all-users", getAllUsers);
userRouter.get("/:id", authMiddleware, isAdmin, getOneUser);
userRouter.delete("/delete-user/:id", deleteUser);
userRouter.put("/update-user/:id", authMiddleware, isAdmin, updateUser);
userRouter.put("/update-password", authMiddleware, updatePassword);
userRouter.put(
  "/block-user/:id",
  authMiddleware,
  isAdmin,
  blockUserOrUnblockUser
);
userRouter.put("/reset-password/:token", resetPassword);


export default userRouter;
