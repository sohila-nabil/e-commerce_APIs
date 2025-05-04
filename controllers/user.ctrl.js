import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import validateMongoId from "../utils/validateMongoId.js";
import refreshToken from "../utils/refreshToken.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import uniqid from "uniqid";
import Cart from "../models/cart.model.js";
import Product from "./../models/product.model.js";
import Order from "../models/orders.model.js";
import Coupon from "./../models/coupon.model.js";

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

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user?.role !== "admin") throw new Error("not Autherized");
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

const addAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  const user = await User.findByIdAndUpdate(
    _id,
    {
      address: req?.body?.address,
    },
    { new: true }
  ).select("-password");
  if (user) {
    res.status(200).json({ message: "Address Added successfully", user });
  } else {
    res.status(404).json({ message: "User not found, please login first" });
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

const getWishlistForUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  const user = await User.findById(_id)
    .populate("wishlist")
    .select("-password");
  if (!user) {
    throw new Error("please login first");
  }
  if (user.wishlist.length < 0) throw new Error("no products found");
  res.status(200).json(user);
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, count, color } = req.body;
  const userId = req.user._id;
  validateMongoId(userId);

  const product = await Product.findById(productId).select("price").lean();
  if (!product) throw new Error("Product not found");

  let cart = await Cart.findOne({ orderBy: userId });

  const productData = {
    product: productId,
    count: +count,
    price: product.price,
    color,
    totalPriceForProduct: +product.price * +count,
  };

  if (cart) {
    // Check if product already exists
    const existingIndex = cart.products.find(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (existingIndex) {
      // Update count and total price
      // cart.products[existingIndex].count += +count;
      // cart.products[existingIndex].totalPriceForProduct =
      // cart.products[existingIndex].count * cart.products[existingIndex].price;
      cart.products = cart.products.filter(
        (item) => item.product.toString() !== productId && item.color === color
      );
    } else {
      // Add new product
      cart.products.push(productData);
    }

    // Recalculate cart total
    cart.cartTotal = cart.products.reduce(
      (acc, item) => acc + item.totalPriceForProduct,
      0
    );

    await cart.save();
    res.status(200).json({ success: true, cart });
  } else {
    // Create new cart
    const newCart = await Cart.create({
      products: [productData],
      orderBy: userId,
      cartTotal: productData.totalPriceForProduct,
    });
    res.status(201).json({ success: true, cart: newCart });
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  const cart = await Cart.findOne({ orderBy: _id }).populate(
    "products.product"
  );
  if (cart.products.length < 0) {
    return res.status(400).json({ message: "your cart is empty" });
  } else {
    res.status(200).json(cart);
  }
});

const deleteCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  const user = await User.findById(_id);
  if (!user)
    res
      .status(400)
      .json({ success: false, message: "you must looged in first" });
  const cart = await Cart.findOneAndDelete({ orderBy: user._id });
  if (!cart) {
    return res
      .status(400)
      .json({ success: false, message: "cart already empty" });
  }
  res
    .status(200)
    .json({ success: false, message: "cart deleted successfully" });
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const userId = req.user._id;

  validateMongoId(userId);
  if (!coupon)
    return res
      .status(400)
      .json({ success: false, message: "you must enter the coupon" });

  const validCoupon = await Coupon.findOne({ name: coupon });
  if (!validCoupon) {
    return res.status(400).json({ success: false, message: "Invalid coupon" });
  }

  if (validCoupon.expiry < new Date()) {
    return res.status(400).json({ success: false, message: "Coupon expired" });
  }

  const userCart = await Cart.findOne({ orderBy: userId });
  if (!userCart) {
    return res.status(400).json({ success: false, message: "Cart not found" });
  }

  const discountAmount = (userCart.cartTotal * validCoupon.discount) / 100;
  const totalAfterDiscount = userCart.cartTotal - discountAmount;
  userCart.totalAfterDiscount = totalAfterDiscount.toFixed(2);
  await userCart.save();

  res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    cartTotal: userCart.cartTotal,
    totalAfterDiscount: userCart.totalAfterDiscount,
  });
});

const createOrderByCash = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { _id } = req.user;

  if (!COD)
    return res.status(200).json({
      success: false,
      message: "Only cash on delivery is supported here",
    });
  const user = await User.findById(_id);
  if (!user)
    return res.status(200).json({
      success: false,
      message: "you must login first",
    });
  const userCart = await Cart.findOne({ orderBy: user._id });
  if (!userCart) {
    return res.status(400).json({ success: false, message: "No cart found" });
  }
  const finalAmount =
    couponApplied && userCart.totalAfterDiscount
      ? userCart.totalAfterDiscount
      : userCart.cartTotal;

  const newOrder = await Order.create({
    products: userCart.products,
    paymentIntent: {
      id: uniqid(),
      method: "Cash on Delivery",
      created: Date.now(),
      amount: finalAmount,
      currency: "usd",
    },
    orderBy: user._id,
    orderStatus: "Cash on Delivery",
  });

  await Cart.findOneAndDelete({ orderBy: user._id });

  res.status(200).json({
    success: true,
    message: "Order placed successfully",
    order: newOrder,
  });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  const order = await Order.findOne({ orderBy: _id }).populate(
    "products.product"
  );
  if (order.products.length < 0) {
    return res.status(400).json({ message: "there is no orders" });
  } else {
    res.status(200).json(order);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoId(id);
  const order = await Order.findByIdAndUpdate(
    id,
    { orderStatus: status, paymentIntent: { status } },
    { new: true }
  );
  if (!order) {
    return res
      .status(400)
      .json({ success: false, message: "ther is no order" });
  }
  res.status(200).json({
    success: true,
    message: "order status updated suucessfully",
    order,
  });
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
};
