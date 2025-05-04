import mongoose from "mongoose";

// Declare the Schema of the Mongo model
var enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Submitted",
    enum: ["Submitted",'Contacted','In Progress'],
  },
});

//Export the model
const Enquiry = mongoose.model("Enquiry", enquirySchema);
export default Enquiry;
