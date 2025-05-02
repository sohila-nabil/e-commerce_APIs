import mongoose from "mongoose";

var categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

//Export the model
const BlogCategory = mongoose.model("BlogCategory", categorySchema);
export default BlogCategory;
