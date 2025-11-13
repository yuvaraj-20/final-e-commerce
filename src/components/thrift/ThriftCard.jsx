// src/components/thrift/ThriftCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Eye, Star, Zap, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { useStore } from "../../store/useStore";
import { api } from "../../services/api";
import { me } from "../../lib/apiClient";

const ThriftCard = ({ item, index = 0 }) => {
  const { likedThriftItems, toggleThriftLike } = useStore();
  const navigate = useNavigate();

  // Normalize id to number/string consistently for comparisons
  const itemId = item?.id ?? item?.ID ?? item?._id;
  const norm = (v) => (v === undefined || v === null ? "" : String(v));
  const isLiked = Array.isArray(likedThriftItems)
    ? likedThriftItems.map(norm).includes(norm(itemId))
    : false;

  const nextPath =
    (typeof window !== "undefined" &&
      window.location &&
      window.location.pathname + window.location.search) ||
    "/thrift";

  const ensureAuth = async () => {
    try {
      await me(); // 200 if logged in
      return true;
    } catch {
      toast.error("Please login to continue");
      navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
      return false;
    }
  };

  // Images can be: array of URLs, array of {url}, single string
  const images = Array.isArray(item?.images)
    ? item.images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean)
    : typeof item?.image === "string"
    ? [item.image]
    : [];
  const firstImg = images?.[0] || null;

  const tags = Array.isArray(item?.tags) ? item.tags : [];
  const condition = String(item?.condition || "unknown").toLowerCase();

  const getConditionColor = (c) => {
    switch (c) {
      case "new":
        return "bg-green-100 text-green-800";
      case "like-new":
        return "bg-blue-100 text-blue-800";
      case "good":
        return "bg-yellow-100 text-yellow-800";
      case "fair":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCondition = (c) =>
    String(c || "Unknown")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const handleChatClick = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const ok = await ensureAuth();
    if (!ok) return;

    try {
      const sellerId = item?.sellerId || item?.seller_id || item?.user_id;
      if (!sellerId) throw new Error("Missing seller id");

      if (api?.startChat) {
        const data = await api.startChat(sellerId, itemId);
        const convoId = data?.conversation_id || data?.id;
        if (!convoId) throw new Error("No conversation id");
        navigate(`/chat/${convoId}`);
      } else {
        const res = await fetch(`/start-chat/${sellerId}/${itemId}`, {
          method: "POST",
          headers: { "X-Requested-With": "XMLHttpRequest" },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Chat start failed");
        const data = await res.json();
        const convoId = data?.conversation_id || data?.id;
        if (!convoId) throw new Error("No conversation id");
        navigate(`/chat/${convoId}`);
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error("Failed to start chat. Please try again.");
    }
  };

  const handleLike = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const ok = await ensureAuth();
    if (!ok) return;

    const prev = isLiked;
    toggleThriftLike(itemId);

    try {
      if (typeof api?.toggleThriftLike === "function") {
        await api.toggleThriftLike(itemId);
      } else if (typeof api?.post === "function") {
        await api.post(`/thrift/items/${itemId}/like`);
      } else {
        await fetch(`/api/thrift/items/${itemId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
      }
      toast.success(prev ? "Removed from likes" : "Added to likes");
    } catch (err) {
      console.error("toggle like failed", err);
      toggleThriftLike(itemId); // revert
      toast.error("Failed to update like");
    }
  };

  const handleShare = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const url = `${window.location.origin}/thrift/${itemId}`;
    const text =
      item?.name ? `Check this thrift: ${item.name}` : "Check this thrift item!";
    try {
      if (navigator.share) {
        await navigator.share({ title: "AI Fashion Thrift", text, url });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
      }
    } catch {
      // ignore
    }
  };

  const price = Number(item?.price || item?.amount || 0);
  const views = Number(item?.views ?? 0);
  const likesCount = Number(item?.likes ?? item?.likes_count ?? 0);
  const sellerAvatar =
    item?.sellerAvatar ||
    item?.seller_avatar ||
    item?.user?.avatar_url ||
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100";
  const sellerName = item?.sellerName || item?.seller_name || item?.user?.name || "Seller";
  const sellerRating = item?.sellerRating || item?.seller_rating;

  const sellerId = item?.sellerId || item?.seller_id || item?.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/thrift/${itemId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate(`/thrift/${itemId}`);
        }
      }}
    >
      {/* Image: use 4:5 aspect to reduce vertical height on mobile */}
      <div className="relative overflow-hidden aspect-[4/5] bg-gray-100">
        {firstImg ? (
          <img
            src={firstImg}
            alt={item?.name || "Thrift Item"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => (e.currentTarget.style.display = "none")}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400">No image</div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(
              condition
            )}`}
          >
            {formatCondition(condition)}
          </span>
          {item?.isBoosted && (
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>Boosted</span>
            </span>
          )}
        </div>

        {/* Hover actions (handlers call stopPropagation) */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500"
            }`}
            title={isLiked ? "Unlike" : "Like"}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleChatClick}
            className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Chat with Seller"
          >
            <MessageCircle className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Stats overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-between items-center text-white text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{likesCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{views}</span>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {item?.size || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1 flex-1 text-sm md:text-base">
            {item?.name || item?.title || "Untitled item"}
          </h3>
          <span className="text-sm md:text-lg font-bold text-gray-900 ml-2">
            ${price.toFixed(2)}
          </span>
        </div>

        <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-2">
          {item?.description || "Pre-loved fashion item."}
        </p>

        {/* Seller info - explicit click to seller (stopPropagation) */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (sellerId) navigate(`/seller/${sellerId}`);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                if (sellerId) navigate(`/seller/${sellerId}`);
              }
            }}
            aria-label={`Open seller ${sellerName}`}
          >
            <img
              src={sellerAvatar}
              alt={sellerName}
              className="w-7 h-7 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-medium text-gray-900">
                {sellerName}
              </span>
              {sellerRating ? (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-[11px] text-gray-600">{sellerRating}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {String(tag)}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-gray-500">+{tags.length - 2}</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Chat Button (always visible) */}
      <div className="px-3 pb-3">
        <button
          onClick={handleChatClick}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 text-sm"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Chat with Seller</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ThriftCard;
