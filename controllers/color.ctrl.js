import Color from "../models/color.model.js";
import asyncHandler from "express-async-handler";
import validateMongoId from "../utils/validateMongoId.js";

const createColor = asyncHandler(async (req, res) => {
  const { color } = req.body;
  const existingColor = await Color.findOne({ color });
  if (existingColor) {
    res.status(400);
    throw new Error("Color already exists");
  }
  const newColor = await Color.create({ color });
  res.status(201).json({
    success: true,
    newColor,
    message: "Color created successfully",
  });
});

const getAllColors = asyncHandler(async (req, res) => {
  const colors = await Color.find({});
  if (!colors || colors.length === 0) {
    res.status(404);
    throw new Error("No colors found");
  }
  res.status(200).json({ success: true, colors });
});

const getColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const color = await Color.findById(id);
  if (!color) {
    res.status(404);
    throw new Error("Color not found");
  }
  res.status(200).json({ success: true, color });
});

const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { color } = req.body;

  validateMongoId(id);
  const updatedColor = await Color.findByIdAndUpdate(
    id,
    { color },
    { new: true, runValidators: true }
  );
  if (!updatedColor) {
    res.status(404);
    throw new Error("Color not found");
  }
  res.status(200).json({
    success: true,
    updatedColor,
    message: "Color updated successfully",
  });
});

const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const deletedColor = await Color.findByIdAndDelete(id);
  if (!deletedColor) {
    res.status(404);
    throw new Error("Color not found");
  }
  res.status(200).json({
    success: true,
    message: "Color deleted successfully",
  });
});

export { createColor, getAllColors, getColor, updateColor, deleteColor };
