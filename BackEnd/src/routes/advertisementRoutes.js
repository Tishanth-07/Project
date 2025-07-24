import express from "express";
import {
  createAdvertisement,
  getActiveAdvertisements,
  updateAdvertisement,
  deleteAdvertisement,
} from "../controllers/advertisementController.js";

const router = express.Router();

// Advertisement routes
router.post("/", createAdvertisement);
router.get("/", getActiveAdvertisements);
router.put("/:id", updateAdvertisement);
router.delete("/:id", deleteAdvertisement);

export default router;
