// src/components/SellerCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, CheckCircle, MessageCircle } from "lucide-react";

/**
 * Enterprise-grade SellerCard (no prop-types dependency)
 *
 * - Animated entrance (staggered by index)
 * - Hover scale + shadow
 * - Verified & trust signals
 * - CTA buttons for Chat and View Profile
 *
 * Props:
 * - seller: { id, name, avatar, verified, badge, bio, joined, itemsSold, rating, followers }
 * - index: number (optional) used for staggered animation delay
 */
const SellerCard = ({ seller = {}, index = 0 }) => {
  const navigate = useNavigate();

  const handleProfile = (e) => {
    e?.stopPropagation();
    navigate(`/seller/${seller.id}`);
  };

  const handleChat = (e) => {
    e?.stopPropagation();
    navigate(`/chat/${seller.id}`);
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.04 }}
      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(2,6,23,0.08)" }}
      onClick={handleProfile}
      onKeyDown={(e) => { if (e.key === "Enter") handleProfile(e); }}
      className="bg-white rounded-2xl border shadow-sm overflow-hidden cursor-pointer flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-indigo-100"
      aria-label={`View seller ${seller.name || "profile"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-5">
        <motion.img
          src={seller.avatar || "/avatar-placeholder.png"}
          alt={seller.name || "Seller avatar"}
          className="w-16 h-16 rounded-full object-cover border"
          whileHover={{ scale: 1.06 }}
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{seller.name || "Seller"}</h3>
            {seller.verified && <CheckCircle className="h-5 w-5 text-indigo-500" title="Verified seller" />}
          </div>
          <p className="text-sm text-gray-500 truncate">{seller.badge || seller.title || ""}</p>
          <div className="text-xs text-gray-400 mt-1">Joined {seller.joined ?? "—"}</div>
        </div>
      </div>

      {/* Bio / Short */}
      {seller.bio && (
        <div className="px-5 pb-3">
          <p className="text-sm text-gray-600 line-clamp-2">{seller.bio}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 border-t divide-x text-center text-sm">
        <div className="p-3">
          <div className="text-lg font-bold text-gray-800">{seller.itemsSold ?? "—"}</div>
          <div className="text-xs text-gray-500">Sold</div>
        </div>
        <div className="p-3 flex items-center justify-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-800">{Number(seller.rating ?? 0).toFixed(1)}</span>
        </div>
        <div className="p-3">
          <div className="text-lg font-bold text-gray-800">{seller.followers ?? "—"}</div>
          <div className="text-xs text-gray-500">Followers</div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 mt-auto flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleChat}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 text-white text-sm font-semibold shadow hover:from-violet-700 hover:to-blue-600 transition"
          aria-label={`Chat with ${seller.name || "seller"}`}
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={(e) => { e.stopPropagation(); handleProfile(e); }}
          className="flex-1 px-3 py-2 rounded-lg border text-sm font-medium bg-white hover:bg-gray-50 transition"
          aria-label={`View profile of ${seller.name || "seller"}`}
        >
          View Profile
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SellerCard;
