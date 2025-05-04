import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dbConnected from "./config/dbConnected.js";
import cloudinaryConfig from "./config/cloudinaryConnection.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoutes.js";
import blogRouter from "./routes/blogRoutes.js";
import categoryRouter from "./routes/productCategoryRoutes.js";
import blogCategoryRouter from "./routes/blogCatRoutes.js";
import brandRouter from "./routes/brandRoutes.js";
import couponRouter from "./routes/couponoutes.js";
import colorRouter from "./routes/colorRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
dbConnected();

// Cloudinary configuration
cloudinaryConfig();

// Middleware
app.use(morgan("dev")); // Logging middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/user", userRouter);
app.use("/api/products", productRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/blogcategories", blogCategoryRouter);
app.use("/api/brands", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/colors", colorRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
