import Product from "../models/product.model.js";
import asyncHandler from "express-async-handler";
import slugify from "slugify";
import User from "./../models/user.model.js";
import validateMongoId from "./../utils/validateMongoId.js";
import fs from "fs";
import sharp from "sharp";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "./../utils/cloudinary.js";

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
  const product = await Product.findById(id).populate("color category");
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
  let query = Product.find(JSON.parse(queryStr)).populate("color category");

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

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  validateMongoId(productId);
  let user = await User.findById(req.user._id);
  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
    throw new Error("User not found");
  }
  const isProductExist = user.wishlist.find(
    (item) => item.toString() === productId.toString()
  );
  if (isProductExist) {
    user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { wishlist: productId },
      },
      { new: true }
    );
  } else {
    user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { wishlist: productId },
      },
      { new: true }
    );
  }
  res.status(200).json({
    success: true,
    message: "Product added to wishlist successfully",
    user,
  });
});

const rateProduct = asyncHandler(async (req, res) => {
  const { prodId, star, comment } = req.body;
  validateMongoId(prodId);

  let product = await Product.findById(prodId).populate("color category");
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  const alreadyRated = product.ratings.find(
    (userRating) => userRating.postedBy.toString() === req.user._id.toString()
  );

  if (alreadyRated) {
    // Update existing rating
    await Product.updateOne(
      {
        _id: prodId,
        "ratings.postedBy": req.user._id,
      },
      {
        $set: {
          "ratings.$.star": star,
          "ratings.$.comment": comment,
        },
      }
    );
  } else {
    // Add new rating
    await Product.findByIdAndUpdate(prodId, {
      $push: {
        ratings: {
          star,
          comment,
          postedBy: req.user._id,
        },
      },
    });
  }

  // Recalculate total rating
  product = await Product.findById(prodId); // get latest version with updated ratings
  const totalRating = product.ratings.length;
  const totalStars = product.ratings.reduce((acc, item) => acc + item.star, 0);
  const actualRating = totalStars / totalRating;

  product.totalRating = Math.round(actualRating);
  await product.save();

  res.status(200).json({
    success: true,
    message: "Product rated successfully",
    product,
  });
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const files = req.files || [];
  if (!files.length)
    return res.status(400).json({ message: "No files provided" });

  const product = await Product.findById(id);
  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      console.log(file);

      const resizedBuffer = await sharp(file.buffer)
        .resize(500, 500)
        .jpeg({ quality: 90 })
        .toBuffer();

      return await uploadToCloudinary(resizedBuffer, "products");
    })
  );
  console.log(uploadedImages);

  product.images = uploadedImages;
  await product.save();
  res.status(200).json({
    success: true,
    message: "Images uploaded successfully",
    product,
  });
});

const deleteProductsImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  // if (!product) {
  //   res.status(404).json({
  //     success: false,
  //     message: "Product not found",
  //   });
  // }
  // const images = product.images.map(async (image) => {
  //   await deleteImageFromCloudinary(image?.public_id);
  // });

  // await Promise.all(images);
  // product.images = [];
  // await product.save();
  // res.status(200).json({
  //   success: true,
  //   message: "Images deleted successfully",
  //   product,
  // });
});

const deleteOneImage = asyncHandler(async (req, res) => {
  const { public_id } = req.body;
  const { id } = req.params;
  validateMongoId(id);
  const product = await Product.findById(id);
  if (!product) {
    return res
      .status(400)
      .json({ success: false, message: "product not exist" });
  }
  await deleteFromCloudinary(public_id);
  product.images = product.images.filter((img) => img.public_id !== public_id);
  await product.save();
  res
    .status(200)
    .json({ success: true, message: "Image deleted successfully" });
});

export {
  createProduct,
  getAllProducts,
  getOneProduct,
  addToWishlist,
  rateProduct,
  uploadImages,
  deleteProductsImages,
  deleteOneImage
};
