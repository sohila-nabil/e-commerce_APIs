import mongoose from "mongoose";

var brandSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

//Export the model
const Brand = mongoose.model("Brand", brandSchema);
export default Brand;
