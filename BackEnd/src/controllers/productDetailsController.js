import  multer from "multer";
import mongoose from 'mongoose';
import Product from "../models/Admin_models/Product.js";
import Advertisement from "../models/Advertisement.js";
import Review from "../models/Review.js"; 

   // Get product details by ID
export const getProductDetailsById = async (req, res) => {
  try {
    const productId = req.params.id;
    let product = await Product.findOne({ _id: productId }).lean();

    if (!product && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findOne({
        $or: [
          { _id: productId },
          { _id: new mongoose.Types.ObjectId(productId) },
        ],
      });
    }

    if (!product) {
      product = await Product.findOne({
        $expr: {
          $eq: [{ $toString: "$_id" }, productId],
        },
      });
    }

    if (!product) {
      const exampleProducts = await Product.find().limit(3);
      return res.status(404).json({
        message: "Product not found",
        details: {
          requestedId: productId,
          totalProducts: await Product.countDocuments(),
          exampleIds: exampleProducts.map((p) => p._id),
          idType: typeof exampleProducts[0]?._id,
        },
      });
    }

    // NEW: Get related products (same category)
    const relatedProducts = product.category
      ? await Product.find({
          category: product.category,
          _id: { $ne: product._id },
        }).limit(6)
      : [];

    // Fetch ad for this product
    const ad = await Advertisement.findOne({ product: productId });
    let discount = product.discount || 0;
    if (ad && ad.discountPercentage) {
      discount = ad.discountPercentage;
    }

    const discountedPrice = Math.round(
      product.price - (product.price * discount) / 100
    );

    // Append to response
    product.discount = discount;
    product.discountedPrice = discountedPrice;

    // Get average rating and review count from Review model
    const ratingStats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const rating = ratingStats[0]?.avgRating || 0;
    const reviewCount = ratingStats[0]?.reviewCount || 0;

    // Maintain backward compatibility
    const response = {
      ...product,
      relatedProducts,
      rating: parseFloat(rating.toFixed(1)),
      totalReviews: reviewCount,
    };

    return res.json(response);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
    
    // Upload customer images
export const uploadImages = (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const fileUrls = files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({ uploaded: true, fileUrls });

  } catch (error) {
    console.error("Image Upload Error:", error);

    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: "Multer error", error: error.message });
    }

    res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
};
