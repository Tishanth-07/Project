import express from "express";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address-controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// POST /profile/addresses → Add Address
router.post("/addresses", auth, addAddress);

// PUT /profile/addresses/:addressId → Update Address
router.put("/addresses/:addressId", auth, updateAddress);

// DELETE /profile/addresses/:addressId → Delete Address
router.delete("/addresses/:addressId", auth, deleteAddress);

// PUT /profile/addresses/default/:addressId → Set Default (stub)
router.put("/addresses/default/:addressId", auth, setDefaultAddress);

export default router;
