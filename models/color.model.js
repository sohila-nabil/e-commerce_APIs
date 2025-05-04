import mongoose from "mongoose";

var colorSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

//Export the model
const Color = mongoose.model("Color", colorSchema);
export default Color;
