import express from "express";
import {
  createProduct,
  getAllProducts,
  getOneProduct,
} from "../controllers/product.ctrl.js";

const productRouter = express.Router();

productRouter.post("/create-product", createProduct);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getOneProduct);

export default productRouter;
