import express from "express";
import {
  createEnquiry,
  getAllEnquirys,
  getEnquiry,
  updateEnquiry,
  deleteEnquiry,
} from "../controllers/enq.ctrl.js";

import authMiddleware, { isAdmin } from "./../middlewares/auth.js";

const enquiryRouter = express.Router();

enquiryRouter.post("/create", authMiddleware, isAdmin, createEnquiry);
enquiryRouter.get("/:id", getEnquiry);
enquiryRouter.get("/", getAllEnquirys);
enquiryRouter.put("/update/:id", authMiddleware, isAdmin, updateEnquiry);
enquiryRouter.delete("/delete/:id", authMiddleware, deleteEnquiry);

export default enquiryRouter;
