import Product from "../models/product.model.js";
import asyncHandler from "express-async-handler";
import slugify from "slugify";

const createProduct = asyncHandler(async (req, res) => {
  if (req.body.title) req.body.slug = slugify(req.body.title);
  const product = new Product(req.body);
  await product.save();
  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});

const getOneProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
    throw new Error("Product not found");
  }
  res.status(200).json({
    success: true,
    message: "Product fetched successfully",
    product,
  });
});

const getAllProducts = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields"];
  excludeFields.forEach((el) => delete queryObj[el]);
  console.log(queryObj);

  //   filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  let query = Product.find(JSON.parse(queryStr));

  //   sorting
  if (req.query.sort) {
    let splitSort = req.query.sort.split(",");
    console.log(splitSort);
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //   field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  //   pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const productsCount = await Product.countDocuments();
    if (skip >= productsCount) throw new Error("This page does not exist");
  }
  const products = await query;
  const totalProducts = await Product.countDocuments();
  const totalPages = Math.ceil(totalProducts / limit);
  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    totalProducts,
    totalPages,
    products,
  });
});

export { createProduct, getAllProducts,getOneProduct };
