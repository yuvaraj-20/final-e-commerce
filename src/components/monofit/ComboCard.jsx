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

  // Adds combo items to cart (used by both Add-to-cart icon and Buy Now)
  const addComboToCart = async () => {
    const ok = await ensureAuth();
    if (!ok) return false;

    safeItems.forEach((item) => {
      const size = Array.isArray(item?.sizes) ? item.sizes[0] : undefined;
      const color = Array.isArray(item?.colors) ? item.colors[0] : undefined;

      if (typeof addToCart === "function") {
        addToCart({
          product: item,
          quantity: 1,
          size,
          color,
        });
      }
    });

    toast.success("Combo added to cart!");
    return true;
  };

  // called by cart icon (small) -> only add to cart
  const handleAddToCart = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    await addComboToCart();
  };

  // Buy Now: add to cart, then redirect to checkout
  const handleBuyNow = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const ok = await addComboToCart();
    if (ok) {
      // Redirect to checkout - adjust path if your checkout route differs
      try {
        window.location.assign("/checkout");
      } catch {
        window.location.href = "/checkout";
      }
    }
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

  const renderAvatars = (arr = []) => {
    const show = arr.slice(0, 3);
    return (
      <div className="flex -space-x-2">
        {show.map((a, i) => (
          <img
            key={i}
            src={a || "/images/default-avatar.png"}
            alt="avatar"
            className="h-6 w-6 rounded-full border-2 border-white shadow-sm object-cover"
            onError={(e) => (e.currentTarget.src = "/images/default-avatar.png")}
          />
        ))}
        {arr.length > 3 && (
          <div className="h-6 w-6 rounded-full bg-gray-200 text-xs flex items-center justify-center border-2 border-white text-gray-700">
            +{arr.length - 3}
          </div>
        )}
      </div>
    );
  };

  /* LIST MODE */
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: index * 0.05 }}
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-gray-400">No image</div>
              )}
            </div>

            {/* compact badge stack */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Zap className="h-3 w-3" />
                MonoFit
              </span>
              {combo?.isTrending && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  Trending
                </span>
              )}
            </div>

            {/* tiny action cluster (non-intrusive) */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-90">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleWishlist(e);
                }}
                className={`p-2 rounded-full shadow-lg transition-colors ${
                  isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-600"
                }`}
                aria-label="Save combo"
                title={isWishlisted ? "Saved" : "Save"}
              >
                <Heart className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(e);
                }}
                className="p-2 rounded-full shadow-lg bg-white text-gray-600"
                aria-label="Share combo"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 pr-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-1 truncate">
                  {combo?.name || "Untitled Combo"}
                </h3>

                <p
                  className="text-sm text-gray-600 mb-2"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {combo?.description || "Explore this outfit combo."}
                </p>

                <div className="flex flex-wrap gap-2">
                  {(combo?.tags || []).slice(0, 3).map((tag, i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right ml-2 flex-shrink-0">
                {combo?.discountPercentage ? (
                  <div className="text-xs text-gray-400 line-through">
                    ${totalPrice.toFixed(2)}
                  </div>
                ) : null}
                <div className="text-xl font-bold text-gray-900">
                  ${discountedPrice.toFixed(2)}
                </div>
                {combo?.discountPercentage ? (
                  <div className="text-xs text-green-600 font-medium">{combo.discountPercentage}% off</div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{combo?.likes ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{combo?.views ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>{combo?.rating ?? "-"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-600">{safeItems.length} items</div>
                {renderAvatars(safeItems.map((it) => it?.ownerAvatar || it?.images?.[0] || it?.image))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Buy Now (primary) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow(e);
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white py-2 px-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-600 transition-colors flex items-center justify-center gap-2"
                aria-label="Buy now"
              >
                <span className="text-sm">Buy Now</span>
              </button>

              {/* Small cart icon (adds to cart only) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
                className="p-2 rounded-lg bg-white border border-gray-100 shadow-sm text-gray-700"
                aria-label="Add to cart"
                title="Add to cart"
              >
                <ShoppingCart className="h-4 w-4" />
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
      transition={{ duration: 0.28, delay: index * 0.05 }}
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
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400">No image</div>
        )}

        {/* badge row */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Zap className="h-3 w-3" />
            MonoFit
          </span>
          {combo?.isTrending && (
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
            >
              <Flame className="h-3 w-3" />
              Trending
            </motion.span>
          )}
        </div>

        {/* top-right compact actions (less noisy) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-90">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleWishlist(e);
            }}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-600"
            }`}
            aria-label="Save combo"
          >
            <Heart className="h-4 w-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(e);
            }}
            className="p-2 rounded-full shadow-lg bg-white text-gray-600"
            aria-label="Share combo"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* overlay meta visible on hover (subtle) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-between items-center text-white text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{combo?.likes ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{combo?.views ?? 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{combo?.rating ?? "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{combo?.name || "Untitled Combo"}</h3>
          <div className="text-right ml-2 flex-shrink-0">
            {combo?.discountPercentage ? (
              <div className="text-xs text-gray-400 line-through">
                ${totalPrice.toFixed(2)}
              </div>
            ) : null}
            <div className="text-lg font-bold text-gray-900">
              ${discountedPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <p
          className="text-gray-600 text-xs sm:text-sm mb-3"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {combo?.description || "Explore this outfit combo."}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">{safeItems.length} items</span>
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

          <div className="text-xs text-gray-600">{combo?.occasion || ""}</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Buy Now (primary) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow(e);
            }}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white py-2 px-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-600 transition-colors flex items-center justify-center gap-2"
            aria-label="Buy now"
          >
            <span className="text-sm">Buy Now</span>
          </button>

          {/* Small cart icon (adds to cart only) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
            className="p-2 rounded-lg bg-white border border-gray-100 shadow-sm text-gray-700"
            aria-label="Add to cart"
            title="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ComboCard;
