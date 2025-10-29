// src/components/seller/SellerProfileCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, MessageCircle, Calendar, Award, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { me } from "../../lib/apiClient"; // session check via Sanctum

const SellerProfileCard = ({ seller = {}, productId, onMessageClick, compact = false }) => {
  const navigate = useNavigate();

  const nextPath =
    (window.location && window.location.pathname + window.location.search) || "/";

  const ensureAuth = async () => {
    try {
      await me(); // 200 if authenticated
      return true;
    } catch {
      toast.error("Please sign in to continue");
      navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
      return false;
    }
  };

  const startChat = async () => {
    // Allow parent to override behavior if provided
    if (typeof onMessageClick === "function") {
      onMessageClick(seller, productId);
      return;
    }

    const ok = await ensureAuth();
    if (!ok) return;

    try {
      const sid = seller?.id;
      if (!sid) throw new Error("Missing seller id");

      const res = await fetch(`/start-chat/${sid}/${productId || ""}`, {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to start chat");

      const data = await res.json();
      const convoId = data?.conversation_id;
      if (!convoId) throw new Error("No conversation id");

      navigate(`/chat/${convoId}`);
    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error("Could not start chat. Please try again.");
    }
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    } catch {
      return "—";
    }
  };

  const avatar =
    seller?.avatar ||
    "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100";

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <img src={avatar} alt={seller?.name || "Seller"} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900 truncate">{seller?.name || "Seller"}</h3>
            {seller?.isVerified && <Award className="h-4 w-4 text-blue-500" />}
          </div>
          {seller?.rating ? (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{seller.rating}</span>
              <span className="text-sm text-gray-500">({seller?.totalSales || 0} sales)</span>
            </div>
          ) : null}
        </div>
        <button
          onClick={startChat}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Message seller"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <img src={avatar} alt={seller?.name || "Seller"} className="w-16 h-16 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900 truncate">{seller?.name || "Seller"}</h2>
            {seller?.isVerified && <Award className="h-5 w-5 text-blue-500" />}
          </div>

          {seller?.rating ? (
            <div className="flex items-center space-x-1 mb-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium text-gray-900">{seller.rating}</span>
              <span className="text-gray-600">({seller?.totalSales || 0} sales)</span>
            </div>
          ) : null}

          <div className="flex items-center space-x-1 text-gray-600 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Joined {formatJoinDate(seller?.joinedAt)}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {seller?.bio ? <p className="text-gray-700 mb-4">{seller.bio}</p> : null}

      {/* Badges */}
      {Array.isArray(seller?.badges) && seller.badges.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {seller.badges.map((badge, i) => (
            <span
              key={`${badge}-${i}`}
              className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {badge}
            </span>
          ))}
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <ShoppingBag className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{seller?.totalSales || 0}</div>
          <div className="text-sm text-gray-600">Items Sold</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{seller?.rating ?? "N/A"}</div>
          <div className="text-sm text-gray-600">Rating</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <Link
          to={`/seller/${seller?.id || ""}`}
          className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
        >
          View Profile
        </Link>

        <button
          onClick={startChat}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Message</span>
        </button>
      </div>
    </motion.div>
  );
};

export default SellerProfileCard;
