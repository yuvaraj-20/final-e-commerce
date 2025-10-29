// src/components/cart/RecommendedItems.jsx
import React, { useState, useEffect } from "react";
import { Plus, Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useStore } from "../../store/useStore";
import { api } from "../../services/api";
import { me } from "../../lib/apiClient";

const RecommendedItems = ({ cartItems }) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const nextPath =
    (window.location && window.location.pathname + window.location.search) ||
    "/cart";

  const ensureAuth = async () => {
    try {
      await me(); // 200 if logged in (Sanctum cookie or Bearer)
      return true;
    } catch {
      toast.error("Please sign in to continue");
      navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
      return false;
    }
  };

  useEffect(() => {
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const recommendations = await api.getProducts();

      const cartIds = new Set(
        (cartItems || []).map((ci) => ci?.product?.id).filter(Boolean)
      );

      // Filter out items already in cart; pick a handful
      const filteredRecs = (recommendations || [])
        .filter((p) => p && !cartIds.has(p.id))
        .slice(0, 8);

      setRecommendedItems(filteredRecs);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSingleProduct = (product) => {
    const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
    const colors = Array.isArray(product?.colors) ? product.colors : [];

    const size = sizes[0];
    const color = colors[0];

    if (!size || !color) {
      toast.error("This item is missing size or color options.");
      return false;
    }

    addToCart({
      product,
      quantity: 1,
      size,
      color,
    });
    return true;
  };

  const handleAddToCart = async (product) => {
    const ok = await ensureAuth();
    if (!ok) return;

    if (addSingleProduct(product)) {
      toast.success("Added to cart!");
    }
  };

  const isInWishlist = (idOrItem) => {
    const id = typeof idOrItem === "object" ? idOrItem?.id : idOrItem;
    return Array.isArray(wishlist)
      ? wishlist.some((w) => (typeof w === "object" ? w?.id === id : w === id))
      : false;
  };

  const handleToggleWishlist = async (productId) => {
    const ok = await ensureAuth();
    if (!ok) return;

    const already = isInWishlist(productId);
    toggleWishlist(productId);
    toast.success(already ? "Removed from wishlist" : "Added to wishlist");
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">You might also like</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4">You might also like</h3>
      <div className="space-y-4">
        {recommendedItems.map((item, index) => {
          const firstImg =
            (Array.isArray(item?.images) && item.images[0]) ||
            item?.image ||
            null;
          const wish = isInWishlist(item?.id);

          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                {firstImg ? (
                  <img
                    src={firstImg}
                    alt={item?.name || "Product"}
                    className="w-12 h-12 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 grid place-items-center text-gray-400 text-xs">
                    —
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                  {item?.name || "Untitled"}
                </h4>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-600 text-sm">
                    ${Number(item?.price || 0).toFixed(2)}
                  </p>
                  {item?.isMonoFit && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      MonoFit
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleToggleWishlist(item?.id)}
                  className={`p-2 rounded-full transition-colors ${
                    wish
                      ? "text-red-500 bg-red-50"
                      : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                  title={wish ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`h-4 w-4 ${wish ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-colors"
                  title="Add to cart"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {recommendedItems.length === 0 && (
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recommendations available</p>
        </div>
      )}
    </div>
  );
};

export default RecommendedItems;
