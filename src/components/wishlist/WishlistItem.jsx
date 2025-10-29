import React from "react";
import { Trash2, ShoppingCart, Star } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useStore } from "../../store/useStore";
import { me } from "../../lib/apiClient";

const WishlistItem = ({ item, type, index, viewMode, onRemove }) => {
  const { addToCart } = useStore();
  const navigate = useNavigate();

  const nextPath =
    (window.location && window.location.pathname + window.location.search) ||
    "/wishlist";

  const ensureAuth = async () => {
    try {
      await me(); // 200 if logged in via Sanctum
      return true;
    } catch {
      toast.error("Please sign in to continue");
      navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
      return false;
    }
  };

  const firstImage =
    (Array.isArray(item?.images) && item.images[0]) || item?.image || null;

  const getItemPrice = () => {
    if (type === "combo") {
      // support totalPrice OR compute from items
      const total =
        typeof item?.totalPrice === "number"
          ? item.totalPrice
          : (Array.isArray(item?.items) ? item.items : []).reduce(
              (sum, p) => sum + (Number(p?.price) || 0),
              0
            );
      const discount = Number(item?.discountPercentage) || 0;
      return discount ? total * (1 - discount / 100) : total;
    }
    return Number(item?.price) || 0;
  };

  const getItemRating = () => {
    const r = Number(item?.rating);
    return Number.isFinite(r) ? r : 0;
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

  const handleAddToCart = async () => {
    const ok = await ensureAuth();
    if (!ok) return;

    if (type === "product" || type === "thrift") {
      const success = addSingleProduct(item);
      if (success) toast.success("Added to cart!");
      return;
    }

    if (type === "combo") {
      const items = Array.isArray(item?.items) ? item.items : [];
      if (!items.length) {
        toast.error("This combo has no items.");
        return;
      }
      let added = 0;
      items.forEach((p) => {
        if (addSingleProduct(p)) added += 1;
      });
      if (added > 0) {
        toast.success(`Combo added to cart (${added} item${added > 1 ? "s" : ""})!`);
      }
      return;
    }

    toast.error("Unknown item type.");
  };

  /* ---------- LIST VIEW ---------- */
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
            {firstImage ? (
              <img
                src={firstImage}
                alt={item?.name || "Item"}
                className="w-20 h-20 object-cover"
              />
            ) : (
              <div className="w-20 h-20 grid place-items-center text-gray-400 text-xs">
                No image
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {item?.name || "Untitled"}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {item?.description || "—"}
                </p>

                <div className="flex items-center flex-wrap gap-4 mt-2">
                  <span className="text-lg font-bold text-gray-900">
                    ${getItemPrice().toFixed(2)}
                  </span>

                  {getItemRating() > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {getItemRating()}
                      </span>
                    </div>
                  )}

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      type === "product"
                        ? "bg-blue-100 text-blue-800"
                        : type === "thrift"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {type === "combo"
                      ? "MonoFit"
                      : type?.charAt(0)?.toUpperCase() + type?.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4 shrink-0">
                <button
                  onClick={handleAddToCart}
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                  title="Add to cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onRemove(item?.id)}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ---------- GRID CARD ---------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {firstImage ? (
          <img
            src={firstImage}
            alt={item?.name || "Item"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleAddToCart}
          className="bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          title="Add to cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
        <button
          onClick={() => onRemove(item?.id)}
          className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
          title="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {item?.name || "Untitled"}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item?.description || "—"}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${getItemPrice().toFixed(2)}
          </span>

          <div className="flex items-center space-x-2">
            {getItemRating() > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{getItemRating()}</span>
              </div>
            )}

            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                type === "product"
                  ? "bg-blue-100 text-blue-800"
                  : type === "thrift"
                  ? "bg-green-100 text-green-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {type === "combo"
                ? "MonoFit"
                : type?.charAt(0)?.toUpperCase() + type?.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WishlistItem;
