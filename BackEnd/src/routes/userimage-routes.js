import express from "express";
import uploadUserImage from "../middleware/user-upload.js"; // multer middleware for uploads
import { uploadProfileImage } from "../controllers/profileController.js";

const uploadRouter = express.Router();

uploadRouter.post(
  "/upload",
  uploadUserImage.single("profileImage"),
  uploadProfileImage
);

export default uploadRouter;
