import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import validateMongoId from "../utils/validateMongoId.js";
import refreshToken from "../utils/refreshToken.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const userRegister = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }
  const user = await User.create({
    ...req.body,
  });
  const { password: userPassword, ...userData } = user._doc;
  if (user) {
    res
      .status(201)
      .json({ message: "User registered successfully", user: userData });
  } else {
    res.status(400).json({ message: "Invalid user data" });
    throw new Error("User registration failed");
  }
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    const { password: userPassword, ...userData } = user._doc;

    const newRefreshToken = refreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    const token = generateToken(user); // access token

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 3 days
    });

    res.status(200).json({
      message: "User logged in successfully",
      user: userData,
      token,
      refresh_Token: newRefreshToken, // match cookie exactly
    });
  } else {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
});

const refreshTokens = asyncHandler(async (req, res) => {
  const { refreshToken: refresh_Token } = req.cookies;
  if (!refresh_Token) {
    res.status(401).json({ message: "No refresh token provided" });
  }
  const user = await User.findOne({ refreshToken: refresh_Token });
  if (!user) {
    res.status(403).json({ message: "Refresh token not found" });
    throw new Error("Refresh token not found");
  }
  jwt.verify(refresh_Token, process.env.JWT_SECRET, (err, decoded) => {
    console.log("Decoded token:", decoded);
    if (err || user._id.toString() !== decoded.id) {
      console.log(decoded);
      res.status(403).json({ message: "Invalid refresh token" });
      throw new Error("Invalid refresh token");
    } else {
      const accessToken = generateToken(user);
      res.status(200).json({
        message: "Access token generated successfully",
        accessToken,
      });
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken: refresh_Token } = req.cookies;
  if (!refresh_Token) {
    res.status(401).json({ message: "No refresh token provided" });
  }
  const user = await User.findOne({ refreshToken: refresh_Token });
  if (!user) {
    res.status(403).json({ message: "Refresh token not found" });
    throw new Error("Refresh token not found");
  }
  user.refreshToken = null;
  await user.save();
  res.clearCookie("refreshToken", { httpOnly: true, secure: true });
  res.status(200).json({ message: "User logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  if (users.length > 0) {
    res.status(200).json(users);
  } else {
    res.status(404).json({ message: "No users found" });
    throw new Error("No users found");
  }
});

const getOneUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const user = await User.findById(id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found" });
    throw new Error("User not found");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstname: req?.body?.firstname,
      lastname: req?.body?.lastname,
      email: req?.body?.email,
      mobile: req?.body?.mobile,
    },
    { new: true }
  ).select("-password");
  if (user) {
    res.status(200).json({ message: "User updated successfully", user });
  } else {
    res.status(404).json({ message: "User not found" });
    throw new Error("User not found");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const user = await User.findByIdAndDelete(id);
  if (user) {
    res.status(200).json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ message: "User not found" });
    throw new Error("User not found");
  }
});

const blockUserOrUnblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const user = await User.findById(id).select("-password");
  if (user && user.role === "admin") {
    res.status(400).json({ message: "You cannot block or unblock an admin" });
    throw new Error("You cannot block or unblock an admin");
  }
  if (user) {
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.status(200).json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
    });
  } else {
    res.status(404).json({ message: "User not found" });
    throw new Error("User not found");
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoId(_id);
  const user = await User.findById(_id);
  if (user) {
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } else {
    res.status(400).json({ message: " not logged in " });
    throw new Error(" not logged in");
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    throw new Error("User not found");
  }
  const token = user.generatePasswordResetToken();
  await user.save();
  const resetURL = `Hi, please follow this link to reset your password, its valid till 10 minutes: <a href='http://localhost:4000/api/user/reset-password/${token}'>Click here</a>`;
  const data = {
    to: email,
    subject: "Reset Password",
    text: resetURL,
  };
  try {
    await sendEmail(data.to, data.subject, data.text);
    res.status(200).json({
      success: true,
      message: "Reset password link sent to your email",
      resetURL,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(500).json({
      success: false,
      message: "There was an error sending the email",
    });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400).json({ message: "Token is invalid or has expired" });
    throw new Error("Token is invalid or has expired");
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.status(200).json({ message: "Password updated successfully" });
});

export {
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
};
