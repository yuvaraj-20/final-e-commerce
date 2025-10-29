import React from "react";
import { Minus, Plus, Trash2, Heart } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useStore } from "../../store/useStore";
import { me } from "../../lib/apiClient";

const CartItem = ({ item, index, onQuantityChange, onRemove }) => {
  const { wishlist, toggleWishlist } = useStore();
  const navigate = useNavigate();

  const nextPath =
    (window.location && window.location.pathname + window.location.search) ||
    "/cart";

  const isWishlisted = Array.isArray(wishlist)
    ? wishlist.some((w) =>
        typeof w === "object" ? w?.id === item?.product?.id : w === item?.product?.id
      )
    : false;

  const ensureAuth = async () => {
    try {
      await me();
      return true;
    } catch {
      toast.error("Please sign in to continue");
      navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
      return false;
    }
  };

  const handleMoveToWishlist = async () => {
    const ok = await ensureAuth();
    if (!ok) return;

    if (!isWishlisted && item?.product?.id) {
      toggleWishlist(item.product.id);
      toast.success("Moved to wishlist");
    }
    onRemove?.(item?.id);
  };

  const decQty = () => {
    const q = Number(item?.quantity) || 1;
    if (q <= 1) return;
    onQuantityChange?.(item?.id, q - 1);
  };

  const incQty = () => {
    const q = Number(item?.quantity) || 1;
    onQuantityChange?.(item?.id, q + 1);
  };

  const img =
    (Array.isArray(item?.product?.images) && item.product.images[0]) || null;
  const name = item?.product?.name || "Untitled";
  const desc = item?.product?.description || "—";
  const unit = Number(item?.product?.price) || 0;
  const qty = Number(item?.quantity) || 1;
  const line = unit * qty;

  // Detect store type dynamically
  const storeType = item?.storeType || item?.product?.storeType || "general";
  const storeLabel =
    storeType === "monofit"
      ? { name: "MonoFit Store", color: "bg-purple-100 text-purple-800" }
      : storeType === "thrift"
      ? { name: "Thrift Store", color: "bg-green-100 text-green-800" }
      : storeType === "custom"
      ? { name: "Custom Design", color: "bg-blue-100 text-blue-800" }
      : { name: "General Store", color: "bg-gray-100 text-gray-700" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
            {img ? (
              <img
                src={img}
                alt={name}
                className="w-24 h-24 object-cover"
              />
            ) : (
              <div className="w-24 h-24 grid place-items-center text-gray-400 text-xs">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                {name}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">{desc}</p>

              {/* 🏷️ Animated Store Label */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${storeLabel.color}`}
              >
                {storeLabel.name}
              </motion.div>
            </div>
            <button
              onClick={() => onRemove?.(item?.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            {item?.size && (
              <span className="text-sm text-gray-600">
                Size: <span className="font-medium">{item.size}</span>
              </span>
            )}
            {item?.color && (
              <span className="text-sm text-gray-600">
                Color: <span className="font-medium">{item.color}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Qty:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={decQty}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  title="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-medium">{qty}</span>
                <button
                  onClick={incQty}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  title="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900 mb-2">
                ${line.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                ${unit.toFixed(2)} each
              </div>
              <button
                onClick={handleMoveToWishlist}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                title={isWishlisted ? "Already in wishlist" : "Save for later"}
              >
                <Heart className={`h-3 w-3 ${isWishlisted ? "fill-current" : ""}`} />
                <span>{isWishlisted ? "In wishlist" : "Save for later"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
