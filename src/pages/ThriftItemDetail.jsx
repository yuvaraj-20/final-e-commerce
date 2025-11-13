// src/pages/ThriftItemDetail.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Eye,
  Calendar,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { api } from "../../services/api";
import { useStore } from "../../store/useStore";
import SellerProfileCard from "../components/thrift/SellerProfileCard";
import ThriftCard from "../components/thrift/ThriftCard";
import { me } from "../lib/apiClient"; // used to verify sanctum session

export default function ThriftItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, likedThriftItems = [], toggleThriftLike } = useStore();

  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // helpers
  const norm = (v) => (v === undefined || v === null ? "" : String(v));
  const itemId = useMemo(() => (item?.id ?? item?._id ?? id), [item, id]);

  const isLiked = useMemo(() => {
    return Array.isArray(likedThriftItems)
      ? likedThriftItems.map(norm).includes(norm(itemId))
      : false;
  }, [likedThriftItems, itemId]);

  useEffect(() => {
    if (!id) return;
    loadItemDetails(id);
    setCurrentImageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function ensureAuth() {
    try {
      await me?.();
      return true;
    } catch {
      toast.error("Please login to continue");
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?next=${next}`, { replace: true });
      return false;
    }
  }

  async function loadItemDetails(itemIdParam) {
    setIsLoading(true);
    try {
      const itemData = await api.getThriftItem(itemIdParam);

      if (!itemData) {
        setItem(null);
        return;
      }

      // normalize minimal shape
      const normalized = {
        ...itemData,
        id: itemData.id ?? itemData._id ?? itemIdParam,
        images: Array.isArray(itemData.images)
          ? itemData.images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean)
          : itemData.image
          ? [itemData.image]
          : [],
        tags: Array.isArray(itemData.tags) ? itemData.tags : [],
        likes: Number(itemData.likes ?? itemData.likes_count ?? 0),
        views: Number(itemData.views ?? 0),
        createdAt: itemData.createdAt || itemData.created_at || new Date().toISOString(),
        sellerId: itemData.sellerId || itemData.seller_id || itemData.user_id,
        title: itemData.title || itemData.name || "Untitled item",
      };

      setItem(normalized);

      // Load seller if available
      if (normalized.sellerId && api.getSellerProfile) {
        const sellerData = await api.getSellerProfile(normalized.sellerId);
        setSeller(sellerData || null);
      } else {
        setSeller(null);
      }

      // Related items (if API provides)
      if (api.getThriftRecommendations) {
        const related = await api.getThriftRecommendations(user?.id || "", normalized.id);
        setRelatedItems(Array.isArray(related) ? related : []);
      } else {
        setRelatedItems([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load item details");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLike() {
    const ok = await ensureAuth();
    if (!ok || !item) return;

    toggleThriftLike(itemId);
    try {
      if (api.toggleThriftLike) {
        await api.toggleThriftLike(itemId, user?.id);
      } else if (api.post) {
        await api.post(`/thrift/items/${itemId}/like`);
      }
      toast.success(isLiked ? "Removed from likes" : "Added to likes");
    } catch (error) {
      toggleThriftLike(itemId); // revert
      console.error(error);
      toast.error("Failed to update like");
    }
  }

  async function handleStartChat() {
    const ok = await ensureAuth();
    if (!ok || !item) return;

    try {
      const conv = await api.createOrGetConversationWithSeller(
        item.sellerId,
        itemId,
        user?.id
      );
      if (conv?.id) {
        navigate(`/chat/${conv.id}`);
      } else {
        toast.error("Could not open chat");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to start conversation");
    }
  }

  async function handleShare() {
    const url = window.location.href;
    const text = item?.description || "Check out this thrift item!";
    const title = item?.name || "Thrift Item";
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  }

  function getConditionColor(condition) {
    const c = String(condition || "unknown").toLowerCase();
    switch (c) {
      case "new":
        return "bg-green-100 text-green-800";
      case "like-new":
      case "like new":
      case "like-new":
      case "like_new":
        return "bg-yellow-50 text-yellow-800";
      case "good":
        return "bg-blue-50 text-blue-800";
      case "fair":
        return "bg-orange-50 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function formatCondition(condition) {
    return String(condition || "Unknown")
      .replace(/[-_]/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-[4/5] bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
          <Link to="/thrift" className="text-purple-600 hover:text-purple-700 font-medium">
            Back to Thrift Store
          </Link>
        </div>
      </div>
    );
  }

  const gallery = item.images?.length ? item.images : [];
  const safeIndex = Math.min(currentImageIndex, Math.max(gallery.length - 1, 0));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link
          to="/thrift"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Thrift Store</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Gallery */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg"
            >
              {gallery.length ? (
                <div className="relative">
                  <img
                    src={gallery[safeIndex]}
                    alt={item.title || "Thrift item"}
                    className="w-full aspect-[4/5] object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(item.condition)}`}>
                      {formatCondition(item.condition)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-[4/5] grid place-items-center text-gray-400">
                  No image
                </div>
              )}
            </motion.div>

            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {gallery.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${safeIndex === idx ? "border-purple-600" : "border-gray-200 hover:border-gray-300"}`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`${item.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="pr-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{Number(item.views ?? 0)} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{Number(item.likes ?? 0)} likes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-extrabold text-gray-900">${Number(item.price || 0).toFixed(2)}</div>
                <div className="mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(item.condition)}`}>
                    {formatCondition(item.condition)}
                  </span>
                </div>
              </div>
            </div>

            {/* Key meta */}
            <div className="grid grid-cols-2 gap-4 bg-white border border-gray-100 rounded-lg p-4">
              <div>
                <div className="text-sm text-gray-500">Size</div>
                <div className="font-medium text-gray-900">{item.size || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Category</div>
                <div className="font-medium text-gray-900">{item.category || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Color</div>
                <div className="font-medium text-gray-900">{item.color || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Gender</div>
                <div className="font-medium text-gray-900 capitalize">{item.gender || "—"}</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{item.description || "Pre-loved fashion item."}</p>
            </div>

            {/* Tags */}
            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, idx) => (
                  <span key={`${tag}-${idx}`} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#{String(tag)}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleLike}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-3 ${isLiked ? "bg-red-500 text-white hover:bg-red-600" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  <Heart className="h-5 w-5" />
                  <span>{isLiked ? "Liked" : "Like"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center gap-3"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>

              <button
                onClick={handleStartChat}
                className="w-full bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] text-white py-3 rounded-lg font-semibold hover:from-[#6B21A8] hover:to-[#0891B2] transition"
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat with Seller</span>
                </div>
              </button>
            </div>

            {/* Trust box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Trust & Safety</h4>
                  <p className="text-sm text-blue-700">
                    All items are reviewed before listing. Meet in public places and inspect items before purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller */}
        {seller && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Seller</h2>
            <SellerProfileCard seller={seller} onMessageClick={handleStartChat} />
          </div>
        )}

        {/* Related */}
        {relatedItems?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((relatedItem, idx) => (
                <ThriftCard
                  key={relatedItem.id || relatedItem._id || idx}
                  item={relatedItem}
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
