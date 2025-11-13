// src/pages/ThriftStore.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Grid,
  List,
  Plus,
  TrendingUp,
  Heart,
  ShoppingCart,
  Filter,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import UploadForm from "../components/thrift/UploadForm";
import FilterSortPanel from "../components/FilterSortPanel";

import { useStore } from "../store/useStore";
import { api } from "../services/api";
import { me } from "../lib/apiClient";

import { THRIFT_FILTERS, UNIVERSAL_SORTS } from "../config/filters";
import { mergeIncomingFilters } from "../utils/filtering";

const ThriftStore = () => {
  const {
    thriftItems,
    setThriftItems,
    thriftFilters,
    setThriftFilters,
    resetThriftFilters,
    addToCart,
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [viewMode, setViewMode] = useState("grid");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Compact sticky bar visible on upward scroll
  const [showCompactBar, setShowCompactBar] = useState(true);
  // full panel open state (overlay)
  const [filtersOpen, setFiltersOpen] = useState(false);

  // FAB bounce when results change (optional subtle cue)
  const [fabBounce, setFabBounce] = useState(false);
  const prevCountRef = useRef((thriftItems && thriftItems.length) || 0);

  useEffect(() => {
    loadThriftItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thriftFilters]);

  // Trigger subtle FAB bounce when results change
  useEffect(() => {
    const prev = prevCountRef.current;
    const now = thriftItems?.length ?? 0;
    if (now !== prev) {
      setFabBounce(true);
      const t = setTimeout(() => setFabBounce(false), 1000);
      prevCountRef.current = now;
      return () => clearTimeout(t);
    }
    prevCountRef.current = now;
  }, [thriftItems]);

  // Scroll: aggressive — show compact bar on ANY upward scroll, hide on down
  useEffect(() => {
    let lastY = window.scrollY || 0;
    let ticking = false;
    const THRESHOLD = 6;

    function onScroll() {
      const currentY = window.scrollY || 0;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (Math.abs(currentY - lastY) < THRESHOLD) {
            // ignore
          } else if (currentY > lastY) {
            // down -> hide compact bar
            setShowCompactBar(false);
            // also close full panel to avoid odd states
            setFiltersOpen(false);
          } else {
            // up -> show compact bar (aggressive)
            setShowCompactBar(true);
          }
          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadThriftItems = async () => {
    setIsLoading(true);
    try {
      const items = await api.getThriftItems(thriftFilters);
      setThriftItems(items || []);
    } catch {
      toast.error("Failed to load thrift items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => e.preventDefault();

  const handleQuickGender = (gender) => setThriftFilters({ gender });

  const handleSortChange = (value) => setThriftFilters({ sortBy: value });

  const handlePanelFilterChange = (incoming) => {
    setThriftFilters(mergeIncomingFilters(thriftFilters, incoming));
  };

  const ensureAuth = async (nextPath = "/thrift") => {
    try {
      await me();
      return true;
    } catch {
      toast.error("Please sign in to continue");
      navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
      return false;
    }
  };

  const onSellClick = async () => {
    const ok = await ensureAuth("/thrift");
    if (ok) setShowUploadForm(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    toast.success("Item uploaded successfully! It will be reviewed soon.");
    loadThriftItems();
  };

  // Unified Add to Cart
  const handleAddToCart = async (item) => {
    let isUserLoggedIn = false;

    try {
      await me();
      isUserLoggedIn = true;
    } catch {
      isUserLoggedIn = false;
    }

    const productPayload = {
      product: item,
      size: item.default_size || "M",
      color: item.colors?.[0] || item.color || "default",
      quantity: 1,
      store: "Thrift",
    };

    if (isUserLoggedIn) {
      try {
        addToCart(productPayload);
        toast.success(`${item.title} added to your cart`);
      } catch (err) {
        console.error("Cart update failed:", err);
        toast.error("Could not add to cart");
      }
      return;
    }

    // Guest fallback
    try {
      const stored = JSON.parse(localStorage.getItem("guestCart") || "[]");
      const existing = stored.find(
        (i) =>
          i.product?.id === item.id &&
          i.size === productPayload.size &&
          i.color === productPayload.color
      );

      if (existing) {
        existing.quantity += 1;
        toast.success(`${item.title} quantity updated in cart`);
      } else {
        stored.push({
          id: `${item.id}-${productPayload.size}-${productPayload.color}-${Date.now()}`,
          ...productPayload,
        });
        toast.success(`${item.title} added to cart`);
      }

      localStorage.setItem("guestCart", JSON.stringify(stored));
      addToCart(productPayload); // update Zustand
    } catch (err) {
      console.error("Guest cart error:", err);
      toast.error("Could not add to cart");
    }
  };

  if (showUploadForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <UploadForm
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thrift Store</h1>
              <p className="text-gray-600">Discover unique pre-loved fashion items</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSellClick}
              className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold flex items-center space-x-2 hover:from-purple-700 hover:to-blue-700 transition-colors shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Sell Item</span>
            </motion.button>
          </div>
        </div>

        {/* Compact Sticky Search + Filter icon (shows on upward scroll) */}
        <div
          className={`sticky top-16 z-30 transition-transform duration-250 ${
            showCompactBar ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-white rounded-full shadow-md px-4 py-2 flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search thrift items..."
                  value={thriftFilters.search}
                  onChange={(e) => setThriftFilters({ search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm"
                />
              </div>
            </form>

            {/* Filter icon opens full panel */}
            <button
              onClick={() => setFiltersOpen(true)}
              className={`p-2 rounded-full hover:bg-gray-100 transition-all ${fabBounce ? "animate-bounce" : ""}`}
              aria-label="Open filters"
            >
              <Filter className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Full Filters panel as an overlay when filtersOpen */}
        {filtersOpen && (
          <div className="fixed inset-0 z-40 flex items-start justify-center p-4 sm:p-6">
            {/* translucent backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setFiltersOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="relative z-50 w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters & Sort</h3>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {["all", "women", "men", "unisex"].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => handleQuickGender(gender)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        thriftFilters.gender === gender
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </button>
                  ))}
                </div>

                <FilterSortPanel
                  filters={THRIFT_FILTERS}
                  sortOptions={UNIVERSAL_SORTS}
                  onFilterChange={handlePanelFilterChange}
                  onSortChange={handleSortChange}
                  buttonLabel="Apply"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    resetThriftFilters();
                    setFiltersOpen(false);
                  }}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Reset
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Items Grid */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-[4/5] bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : thriftItems.length > 0 ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {thriftItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer border border-gray-100"
                  onClick={() => navigate(`/thrift/${item.id}`)}
                >
                  <div className="relative">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.title}
                      className="w-full aspect-[4/5] object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 bg-yellow-400 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {item.condition || "Like New"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // wishlist / like could go here
                      }}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm"
                    >
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">${item.price}</p>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/seller/${item.sellerId}`);
                      }}
                      className="mt-3 flex items-center gap-2 cursor-pointer group"
                    >
                      <img
                        src={item.sellerAvatar || "/avatar-placeholder.png"}
                        alt={item.sellerName}
                        className="w-8 h-8 rounded-full object-cover border"
                        loading="lazy"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
                        {item.sellerName}
                      </span>
                    </div>

                    <div className="mt-4">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white py-2 rounded-xl font-medium hover:from-[#6B21A8] hover:to-[#0891B2] transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-700">
                No items found
              </h3>
              <p className="text-gray-500 mt-2 mb-4">
                Try changing filters or search terms
              </p>
              <button
                onClick={resetThriftFilters}
                className="text-purple-600 font-medium hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Trending Section */}
        {!isLoading && thriftItems.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {thriftItems
                .filter((item) => item.isBoosted)
                .slice(0, 4)
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                    onClick={() => navigate(`/thrift/${item.id}`)}
                  >
                    <div className="aspect-[4/5] bg-gray-100">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500">${item.price}</p>

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/seller/${item.sellerId}`);
                        }}
                        className="mt-3 flex items-center gap-2 cursor-pointer group"
                      >
                        <img
                          src={item.sellerAvatar || "/avatar-placeholder.png"}
                          alt={item.sellerName}
                          className="w-8 h-8 rounded-full object-cover border"
                          loading="lazy"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
                          {item.sellerName}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThriftStore;
