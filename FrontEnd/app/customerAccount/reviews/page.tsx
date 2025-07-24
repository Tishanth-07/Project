"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/services/api";
import { getAuthToken } from "@/utils/auth-utils/api";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface Product {
  name: String;
  price: number;
  images: string[];
}

interface Review {
  _id: string;
  product: Product;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

const ReviewHistoryPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = getAuthToken();
        const res = await axiosInstance.get("/api/review-history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(res.data);
      } catch (error) {
        toast.error("Failed to fetch review history");
        console.error(error);
      }
    };

    fetchReviews();
  }, []);

  const getImageUrl = (imagePath: string, type: "product" | "review") => {
    if (!imagePath) return "/default-product.jpg";

    // If it's already a full URL, return as-is
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Remove any leading slashes to prevent double slashes in URL
    const cleanPath = imagePath.replace(/^\//, "");

    if (type === "product") {
      // Handle product images
      if (cleanPath.startsWith("uploads/")) {
        // If product image is in uploads directory
        return `${axiosInstance.defaults.baseURL}/${cleanPath}`;
      }
      const parts = cleanPath.split("/");
      if (parts.length === 2) {
        return `${axiosInstance.defaults.baseURL}/products/${parts[0]}/${parts[1]}`;
      }
      return `${axiosInstance.defaults.baseURL}/products/${cleanPath}`;
    }

    // For review images - prepend with /uploads
    // Check if path already includes uploads
    if (cleanPath.startsWith("uploads/")) {
      return `${axiosInstance.defaults.baseURL}/${cleanPath}`;
    }
    return `${axiosInstance.defaults.baseURL}/uploads/${cleanPath}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Review History</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-600">You haven't submitted any reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border p-4 rounded-lg shadow">
              <div className="flex items-center gap-4 mb-2">
                {review.product.images?.length > 0 ? (
                  <Image
                    src={getImageUrl(review.product.images[0], "product")}
                    alt={`Product: ${review.product.name}`}
                    width={60}
                    height={60}
                    className="rounded object-cover"
                    unoptimized={true} // Disable Next.js image optimization
                  />
                ) : (
                  <div className="w-[60px] h-[60px] bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {review.product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    LKR {review.product.price}
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <span className="text-yellow-500">⭐ {review.rating}</span>
              </div>
              <p className="text-gray-800 mb-2">{review.comment}</p>
              {review.images?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {review.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={getImageUrl(img, "review")}
                      alt={`Review image ${idx + 1} for ${review.product.name}`}
                      width={80}
                      height={80}
                      className="rounded border"
                      unoptimized={true} // Disable Next.js image optimization
                    />
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewHistoryPage;
