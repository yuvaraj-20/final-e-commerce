// src/components/monofit/ComboCard.jsx
import React, { useRef } from "react";
import {
  Heart,
  ShoppingCart,
  Share2,
  Zap,
  Flame,
  Eye,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { useStore } from "../../store/useStore";
import { me } from "../../lib/apiClient";

const ComboCard = ({ combo, index = 0, viewMode = "grid", onOpen = () => {} }) => {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const touchHandledRef = useRef(false);

  const isWishlisted = Array.isArray(wishlist)
    ? wishlist.some((w) => (typeof w === "object" ? w?.id === combo?.id : w === combo?.id))
    : false;

  const nextPath = window.location.pathname + window.location.search || "/monofit";

  const ensureAuth = async () => {
    try {
      await me();
      return true;
    } catch {
      toast.error("Please sign in to continue");
      window.location.href = `/login?next=${encodeURIComponent(nextPath)}`;
      return false;
    }
  };

  const safeItems = Array.isArray(combo?.items) ? combo.items : [];
  const firstComboImg = combo?.images?.[0] || null;

  const totalPrice = safeItems.reduce((sum, item) => sum + (Number(item?.price) || 0), 0);
  const discountedPrice = combo?.discountPercentage
    ? totalPrice * (1 - Number(combo.discountPercentage) / 100)
    : totalPrice;

  const handleAddToCart = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const ok = await ensureAuth();
    if (!ok) return;

    safeItems.forEach((item) => {
      const size = Array.isArray(item?.sizes) ? item.sizes[0] : undefined;
      const color = Array.isArray(item?.colors) ? item.colors[0] : undefined;

      addToCart({
        product: item,
        quantity: 1,
        size,
        color,
      });
    });

    toast.success("Combo added to cart!");
  };

  const handleToggleWishlist = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const ok = await ensureAuth();
    if (!ok) return;

    toggleWishlist(combo?.id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const url = `${window.location.origin}/monofit/${combo?.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: combo?.name || "MonoFit Combo",
          text: combo?.description || "",
          url,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  // NEW: call parent onOpen
  const handleOpen = (e) => {
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }
    if (!combo?.id) return;
    try {
      console.log("[ComboCard] handleOpen for", combo.id);
      onOpen(combo.id);
    } catch (err) {
      console.error("onOpen failed:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  const handleTouchEnd = (e) => {
    touchHandledRef.current = true;
    setTimeout(() => (touchHandledRef.current = false), 500);
    handleOpen(e);
  };

  /* LIST MODE */
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.07 }}
        className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          onTouchEnd={handleTouchEnd}
          className="flex flex-col md:flex-row cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <div className="relative md:w-1/3">
            <div className="aspect-square md:aspect-auto md:h-64 overflow-hidden bg-gray-100">
              {firstComboImg ? (
                <img
                  src={firstComboImg}
                  alt={combo?.name || "Combo"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-gray-400">No image</div>
              )}
            </div>

            <div className="absolute top-3 left-3 flex flex-col space-y-2">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>MonoFit</span>
              </span>
              {combo?.isTrending && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Flame className="h-3 w-3" />
                  <span>Trending</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2 line-clamp-1">
                  {combo?.name || "Untitled Combo"}
                </h3>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {combo?.description || "Explore this outfit combo."}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(combo?.tags || []).slice(0, 3).map((tag, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right ml-4">
                {combo?.discountPercentage ? (
                  <span className="text-sm text-gray-500 line-through block">
                    ${totalPrice.toFixed(2)}
                  </span>
                ) : null}
                <span className="text-2xl font-bold text-gray-900 block">
                  ${discountedPrice.toFixed(2)}
                </span>
                {combo?.discountPercentage ? (
                  <span className="text-sm text-green-600 font-medium">
                    {combo.discountPercentage}% off
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{combo?.likes ?? 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{combo?.views ?? 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>{combo?.rating ?? "-"}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleWishlist(e);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  isWishlisted ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                <span>{isWishlisted ? "Saved" : "Save"}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(e);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add Combo</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  /* GRID MODE */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        onTouchEnd={handleTouchEnd}
        className="relative overflow-hidden aspect-square bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {firstComboImg ? (
          <img
            src={firstComboImg}
            alt={combo?.name || "Combo"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400">No image</div>
        )}

        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>MonoFit</span>
          </span>
          {combo?.isTrending && (
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
            >
              <Flame className="h-3 w-3" />
              <span>Trending</span>
            </motion.span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleWishlist(e);
            }}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleShare(e);
            }}
            className="p-2 bg-white text-gray-600 rounded-full shadow-lg hover:bg-blue-50 hover:text-blue-500 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-between items-center text-white text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{combo?.likes ?? 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{combo?.views ?? 0}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{combo?.rating ?? "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1 flex-1">
            {combo?.name || "Untitled Combo"}
          </h3>
          <div className="text-right ml-2">
            {combo?.discountPercentage ? (
              <span className="text-sm text-gray-500 line-through block">
                ${totalPrice.toFixed(2)}
              </span>
            ) : null}
            <span className="text-lg font-bold text-gray-900">
              ${discountedPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {combo?.description || "Explore this outfit combo."}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {(combo?.tags || []).slice(0, 3).map((tag, i) => (
            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              {tag}
            </span>
          ))}
          {Array.isArray(combo?.tags) && combo.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{combo.tags.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{safeItems.length} items</span>
            <div className="flex -space-x-2">
              {safeItems.slice(0, 3).map((item, i) => {
                const img = item?.images?.[0];
                return img ? (
                  <img
                    key={i}
                    src={img}
                    alt={item?.name || "Item"}
                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 grid place-items-center text-[10px] text-gray-500"
                  >
                    —
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-sm text-gray-600">{combo?.occasion || ""}</div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(e);
          }}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Add Combo to Cart</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ComboCard;
