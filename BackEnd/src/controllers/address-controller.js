import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Utility to extract user ID from token
const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("Authorization header missing");
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
};

// Add or Replace Address
export const addAddress = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const {
      firstName,
      lastName,
      province,
      district,
      city,
      area,
      houseNo,
      postalCode,
      isDefault,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.address = {
      FirstName: firstName,
      LastName: lastName,
      Provience: province,
      District: district,
      City: city,
      Area: area,
      HouseNo: houseNo,
      PostalCode: postalCode,
    };

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Address added", address: user.address });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update Address (replace fields individually)
export const updateAddress = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const updates = req.body;

    const user = await User.findById(userId);
    if (!user || !user.address)
      return res.status(404).json({ message: "Address not found" });

    for (let key in updates) {
      if (user.address[key] !== undefined) {
        user.address[key] = updates[key];
      }
    }

    await user.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Address updated",
        address: user.address,
      });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete address (set to null)
export const deleteAddress = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const user = await User.findById(userId);
    if (!user || !user.address)
      return res.status(404).json({ message: "Address not found" });

    user.address = null;
    await user.save();

    res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Set default address (if you expand to multiple addresses in future)
export const setDefaultAddress = async (req, res) => {
  try {
    // In your current schema, there's only one address object
    // If you store multiple addresses later, this controller will be needed
    return res.status(200).json({
      success: true,
      message: "Default address set (no-op since only one address is stored)",
    });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({ message: error.message });
  }
};
