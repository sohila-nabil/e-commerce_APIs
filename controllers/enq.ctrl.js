import Enquiry from "../models/enq.model.js";
import asyncHandler from "express-async-handler";
import validateMongoId from "../utils/validateMongoId.js";

const createEnquiry = asyncHandler(async (req, res) => {
  const { name, email, comment, mobile } = req.body;
  const newEnquiry = await Enquiry.create({ name, email, comment, mobile });
  res.status(201).json({
    success: true,
    newEnquiry,
    message: "Enquiry created successfully",
  });
});

const getAllEnquirys = asyncHandler(async (req, res) => {
  const enquirys = await Enquiry.find({});
  if (!enquirys || enquirys.length === 0) {
    res.status(404);
    throw new Error("No enquirys found");
  }
  res.status(200).json({ success: true, enquirys });
});

const getEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const enquiry = await Enquiry.findById(id);
  if (!enquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }
  res.status(200).json({ success: true, enquiry });
});

const updateEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, name, mobile, comment } = req.body;

  validateMongoId(id);
  const updatedEnquiry = await Enquiry.findByIdAndUpdate(
    id,
    { email, name, mobile, comment },
    { new: true, runValidators: true }
  );
  if (!updatedEnquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }
  res.status(200).json({
    success: true,
    updatedEnquiry,
    message: "Enquiry updated successfully",
  });
});

const deleteEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  const deletedEnquiry = await Enquiry.findByIdAndDelete(id);
  if (!deletedEnquiry) {
    res.status(404);
    throw new Error("Enquiry not found");
  }
  res.status(200).json({
    success: true,
    message: "Enquiry deleted successfully",
  });
});

export {
  createEnquiry,
  getAllEnquirys,
  getEnquiry,
  updateEnquiry,
  deleteEnquiry,
};
