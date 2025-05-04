import express from "express";
import {
  createProduct,
  getAllProducts,
  getOneProduct,
  addToWishlist,
  rateProduct,
  uploadImages,
  deleteProductsImages,
  deleteOneImage
} from "../controllers/product.ctrl.js";
import authMiddleware, { isAdmin } from "../middlewares/auth.js";
// import { productImageResize, upload } / "../middlewares/uploadImages.js";
import upload from "../middlewares/uploadImages.js"
const productRouter = express.Router();

productRouter.post("/create-product", createProduct);
productRouter.put(
  "/upload/:id",
  authMiddleware,
  isAdmin,
  upload.array("images", 10),
  // productImageResize,
  uploadImages
);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getOneProduct);
productRouter.put("/add-to-wishlist", authMiddleware, addToWishlist);
productRouter.put("/rate-product", authMiddleware, rateProduct);
productRouter.put("/delete-image/:id", authMiddleware, isAdmin,deleteOneImage);
productRouter.delete(
  "/delete-images/:id",
  authMiddleware,
  isAdmin,
  deleteProductsImages
);
export default productRouter;
