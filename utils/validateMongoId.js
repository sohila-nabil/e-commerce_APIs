import mongoose from "mongoose";

const validateMongoId = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    throw new Error("Invalid MongoDB ID");
  }
  return isValid;
};


export default validateMongoId;