import express from "express";
import {
  createProduct,
  getAllProducts,
  getOneProduct,
  addToWishlist,
  rateProduct,
} from "../controllers/product.ctrl.js";
import authMiddleware from "../middlewares/auth.js";

const productRouter = express.Router();

productRouter.post("/create-product", createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getOneProduct);
productRouter.put("/add-to-wishlist", authMiddleware, addToWishlist);
productRouter.put("/rate-product", authMiddleware, rateProduct);

export default productRouter;
