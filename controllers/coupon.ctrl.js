import Coupon from "../models/coupon.model.js";
import asyncHandler from "express-async-handler";
import validateMongoId from "../utils/validateMongoId.js";

const createCoupon = asyncHandler(async (req, res) => {
  const { name, expiry, discount } = req.body;
  if (!name || !expiry || !discount) {
    res.status(400);
    throw new Error("Please provide all fields");
  }
  const coupon = await Coupon.create(req.body);
  res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    coupon,
  });
});

const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});
  res.status(200).json({
    success: true,
    message: "Coupons fetched successfully",
    coupons,
  });
});

const getCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  res.status(200).json({
    success: true,
    message: "Coupon fetched successfully",
    coupon,
  });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const coupon = await Coupon.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  res.status(200).json({
    success: true,
    message: "Coupon updated successfully",
    coupon,
  });
});



const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
    coupon,
  });
});

export { createCoupon, getAllCoupons, getCoupon, updateCoupon, deleteCoupon };
