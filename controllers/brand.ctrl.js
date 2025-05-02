import Brand from "../models/brand.model.js";
import asyncHandler from "express-async-handler";
import validateMongoId from "../utils/validateMongoId.js";

const createBrand = asyncHandler(async (req, res) => {
  const { brand } = req.body;
  const existingBrand = await Brand.findOne({ brand });
  if (existingBrand) {
    res.status(400);
    throw new Error("Brand already exists");
  }
  const newBrand = await Brand.create({ brand });
  res.status(201).json({
    success: true,
    newBrand,
    message: "Brand created successfully",
  });
});

const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({});
  if (!brands || brands.length === 0) {
    res.status(404);
    throw new Error("No brands found");
  }
  res.status(200).json({ success: true, brands });
});

const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const brand = await Brand.findById(id);
  if (!brand) {
    res.status(404);
    throw new Error("Brand not found");
  }
  res.status(200).json({ success: true, brand });
});

const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { brand } = req.body;

  validateMongoId(id);
  const updatedBrand = await Brand.findByIdAndUpdate(
    id,
    { brand },
    { new: true, runValidators: true }
  );
  if (!updatedBrand) {
    res.status(404);
    throw new Error("Brand not found");
  }
  res.status(200).json({
    success: true,
    updatedBrand,
    message: "Brand updated successfully",
  });
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const deletedBrand = await Brand.findByIdAndDelete(id);
  if (!deletedBrand) {
    res.status(404);
    throw new Error("Brand not found");
  }
  res.status(200).json({
    success: true,
    message: "Brand deleted successfully",
  });
});

export { createBrand, getAllBrands, getBrand, updateBrand, deleteBrand };
