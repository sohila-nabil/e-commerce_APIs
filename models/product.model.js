import mongoose from "mongoose";

var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Category",
      type: String,
      required: true,
    },
    images: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    sold: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
    },
    ratings: [
      {
        star: {
          type: Number,
          default: 0,
        },
        comment: {
          type: String,
        },
        postedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    totalRating: {
      type: Number,
      default: 0,
    },
    brand: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//Export the model
const Product = mongoose.model("Product", productSchema);
export default Product;
