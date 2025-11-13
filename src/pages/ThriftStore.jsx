// src/pages/ThriftStore.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Grid,
  List,
  Plus,
  TrendingUp,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import UploadForm from "../components/thrift/UploadForm";
import FilterSortPanel from "../components/FilterSortPanel";

import { useStore } from "../store/useStore";
import { api as http, me } from "../lib/apiClient";

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
    setUser,
  } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [viewMode, setViewMode] = useState("grid");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThriftItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thriftFilters]);

  const loadThriftItems = async () => {
    setIsLoading(true);
    try {
      // normalize arrays from backend (can be JSON strings)
      const normArray = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
          try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : (val ? [val] : []);
          } catch {
            return val ? [val] : [];
          }
        }
        return [];
      };

      // Attempt backend fetch first
      let resp;
      try {
        resp = await http.get("/api/thrift/items", {
          params: {
            search: thriftFilters.search || "",
            gender: thriftFilters.gender && thriftFilters.gender !== "all" ? thriftFilters.gender : undefined,
            category: thriftFilters.category && thriftFilters.category !== "all" ? thriftFilters.category : undefined,
            condition: thriftFilters.condition && thriftFilters.condition !== "all" ? thriftFilters.condition : undefined,
            size: thriftFilters.size && thriftFilters.size !== "all" ? thriftFilters.size : undefined,
            sort: thriftFilters.sortBy || "newest",
          },
        });
      } catch (e) {
        resp = null; // backend may not have index yet
      }

      let itemsRaw = [];
      if (resp && resp.data) {
        itemsRaw = Array.isArray(resp.data?.data) ? resp.data.data : Array.isArray(resp.data) ? resp.data : [];
      } else {
        // fallback to mock API
        const mockMod = await import("../services/api");
        itemsRaw = await mockMod.api.getThriftItems(thriftFilters);
      }

      const mapped = (itemsRaw || []).map((it) => {
        const images = normArray(it.images);
        return {
          id: it.id,
          name: it.name || it.title || "",
          title: it.name || it.title || "",
          description: it.description || "",
          price: it.price,
          category: it.category || "",
          size: it.size || it.sizes?.[0] || "",
          condition: it.condition || "",
          gender: it.gender || "",
          color: it.color || (normArray(it.colors)[0] || ""),
          tags: normArray(it.tags),
          images,
          image: images[0] || it.image || "",
          likes: it.likes_count ?? it.likes ?? 0,
          views: it.views ?? 0,
          isBoosted: it.is_boosted ?? it.isBoosted ?? false,
          sellerId: it.user_id || it.seller_id || it.sellerId,
          sellerName: it.user?.name || it.sellerName || "",
          sellerAvatar: it.user?.avatar_url || it.sellerAvatar || "",
        };
      });

      setThriftItems(mapped);
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
      const u = await me();
      if (u) setUser(u);
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

  // 🔥 Unified Add to Cart
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
        <div className="mb-8">
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

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search thrift items..."
                value={thriftFilters.search}
                onChange={(e) => setThriftFilters({ search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </form>

          <div className="flex flex-wrap gap-2 mb-4">
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

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <FilterSortPanel
              filters={THRIFT_FILTERS}
              sortOptions={UNIVERSAL_SORTS}
              onFilterChange={handlePanelFilterChange}
              onSortChange={handleSortChange}
              buttonLabel="Filters & Sort"
            />

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {thriftItems.length} items found
              </span>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && thriftItems.length > 0 && (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {thriftItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
              >
                <div className="aspect-square bg-gray-100">
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
                    onClick={() => item.sellerId && navigate(`/seller/${item.sellerId}`)}
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
                      className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && thriftItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={resetThriftFilters}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Trending Section */}
        {!isLoading && thriftItems.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                const boosted = thriftItems.filter((it) => it.isBoosted);
                const pool = boosted.length > 0 ? boosted : [...thriftItems].sort(() => Math.random() - 0.5);
                return pool.slice(0, 4).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                  >
                    <div className="aspect-square bg-gray-100">
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
                        onClick={() => item.sellerId && navigate(`/seller/${item.sellerId}`)}
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
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThriftStore;
