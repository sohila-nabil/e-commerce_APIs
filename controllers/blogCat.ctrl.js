import BlogCategory from "../models/blogCat.model.js";
import asyncHandler from "express-async-handler";
import validateMongoId from "../utils/validateMongoId.js";

const createCategory = asyncHandler(async (req, res) => {
  const { category } = req.body;
  const existingCategory = await BlogCategory.findOne({ category });
  if (existingCategory) {
    res.status(400);
    throw new Error("Category already exists");
  }
  const newCategory = await BlogCategory.create({ category });
  res.status(201).json({
    success: true,
    newCategory,
    message: "Category created successfully",
  });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await BlogCategory.find({});
  if (!categories || categories.length === 0) {
    res.status(404);
    throw new Error("No categories found");
  }
  res.status(200).json({ success: true, categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const category = await BlogCategory.findById(id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.status(200).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  validateMongoId(id);
  const updatedCategory = await BlogCategory.findByIdAndUpdate(
    id,
    { category },
    { new: true, runValidators: true }
  );
  if (!updatedCategory) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.status(200).json({
    success: true,
    updatedCategory,
    message: "Category updated successfully",
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const deletedCategory = await BlogCategory.findByIdAndDelete(id);
  if (!deletedCategory) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

export {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
