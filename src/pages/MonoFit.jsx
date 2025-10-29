// src/pages/MonoFit.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, Grid, List, Zap, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useStore } from "../store/useStore";
import { api } from "../services/api";
import ComboCard from "../components/monofit/ComboCard";
import TrendingCombos from "../components/monofit/TrendingCombos";
import CommunityFeed from "../components/monofit/CommunityFeed";
import UploadComboForm from "../components/monofit/UploadComboForm";
import { me } from "../lib/apiClient";

const MonoFit = () => {
  const {
    monofitCombos,
    setMonofitCombos,
    monofitFilters,
    setMonofitFilters,
  } = useStore();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("combos"); // 'combos' | 'trending' | 'community'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    "All",
    "Casual",
    "Formal",
    "Streetwear",
    "Vintage",
    "Minimalist",
    "Sporty",
  ];
  const occasions = ["All", "Work", "Date Night", "Weekend", "Party", "Travel", "Gym"];
  const seasons = ["All", "Spring", "Summer", "Fall", "Winter"];
  const genders = ["All", "Men", "Women", "Unisex"];

  useEffect(() => {
    loadCombos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monofitFilters]);

  const loadCombos = async () => {
    setIsLoading(true);
    try {
      const combos = await api.getMonofitCombos(monofitFilters);
      setMonofitCombos(combos || []);
    } catch (err) {
      toast.error("Failed to load combos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setMonofitFilters({ ...monofitFilters, [key]: value });
  };

  const ensureAdminForUpload = async () => {
    try {
      const u = await me(); // 200 if logged in
      if (!u || !u.role) throw new Error("not-auth");
      if (String(u.role).toLowerCase() !== "admin") {
        toast.error("Only admins can create combos");
        return false;
      }
      return true;
    } catch {
      toast.error("Please sign in to continue");
      window.location.href = `/login?next=${encodeURIComponent("/monofit")}`;
      return false;
    }
  };

  const handleUploadClick = async () => {
    const ok = await ensureAdminForUpload();
    if (ok) setShowUploadForm(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    toast.success("Combo uploaded successfully! It will be reviewed and published soon.");
    loadCombos();
  };

  if (showUploadForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <UploadComboForm onSuccess={handleUploadSuccess} onCancel={() => setShowUploadForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg">
                <Zap className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">MonoFit Store</h1>
            </div>
            <p className="text-gray-600">AI-curated outfit combinations for the perfect look</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUploadClick}
            className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold flex items-center space-x-2 hover:from-purple-700 hover:to-blue-700 transition-colors shadow-lg"
          >
            <Zap className="h-5 w-5" />
            <span>Create Combo</span>
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab("combos")}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                activeTab === "combos"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Combos
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`px-6 py-3 rounded-full font-medium transition-colors flex items-center space-x-2 ${
                activeTab === "trending"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Flame className="h-4 w-4" />
              <span>Trending Now</span>
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                activeTab === "community"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Community Looks
            </button>
          </div>

          {activeTab === "combos" && (
            <>
              {/* Search */}
              <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search outfit combos..."
                  value={monofitFilters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Quick gender filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {genders.map((g) => {
                  const lower = g.toLowerCase();
                  return (
                    <button
                      key={g}
                      onClick={() => handleFilterChange("gender", lower)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        monofitFilters.gender === lower
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="h-4 w-4" />
                    <span>More Filters</span>
                  </button>

                  <select
                    value={monofitFilters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="trending">Trending</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{monofitCombos.length} combos found</span>
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

              {/* Advanced filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Style Category</h3>
                        <select
                          value={monofitFilters.category}
                          onChange={(e) => handleFilterChange("category", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c.toLowerCase()}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Occasion</h3>
                        <select
                          value={monofitFilters.occasion}
                          onChange={(e) => handleFilterChange("occasion", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {occasions.map((o) => (
                            <option key={o} value={o.toLowerCase()}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Season</h3>
                        <select
                          value={monofitFilters.season}
                          onChange={(e) => handleFilterChange("season", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {seasons.map((s) => (
                            <option key={s} value={s.toLowerCase()}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          value={monofitFilters.priceRange[1]}
                          onChange={(e) =>
                            handleFilterChange("priceRange", [0, parseInt(e.target.value, 10)])
                          }
                          className="w-full"
                        />
                        <div className="text-sm text-gray-600">
                          $0 – ${monofitFilters.priceRange[1]}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() =>
                          setMonofitFilters({
                            gender: "all",
                            category: "all",
                            occasion: "all",
                            season: "all",
                            priceRange: [0, 500],
                            sortBy: "newest",
                            search: "",
                          })
                        }
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeTab === "combos" && (
            <motion.div
              key="combos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                      <div className="aspect-square bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : monofitCombos.length > 0 ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {monofitCombos.map((combo, idx) => (
                    <ComboCard
                      key={combo.id}
                      combo={combo}
                      index={idx}
                      viewMode={viewMode}
                      onOpen={(comboId) => {
                        // debug log
                        // eslint-disable-next-line no-console
                        console.log("[MonoFit] onOpen called for combo:", comboId);

                        // Immediate hard redirect (bypass potential runtime exception
                        // that stops react-router navigation). This ensures the user
                        // always reaches the detail page.
                        try {
                          window.location.assign(`/monofit/${comboId}`);
                        } catch (err) {
                          // fallback: try setting href
                          // eslint-disable-next-line no-console
                          console.error("[MonoFit] window.location.assign failed, trying href:", err);
                          window.location.href = `/monofit/${comboId}`;
                        }

                        // If you want to try react-router navigate instead, uncomment:
                        // try { navigate(`/monofit/${comboId}`); } catch(e){ console.error(e); }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No combos found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                  <button
                    onClick={() =>
                      setMonofitFilters({
                        gender: "all",
                        category: "all",
                        occasion: "all",
                        season: "all",
                        priceRange: [0, 500],
                        sortBy: "newest",
                        search: "",
                      })
                    }
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "trending" && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TrendingCombos />
            </motion.div>
          )}

          {activeTab === "community" && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CommunityFeed />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MonoFit;
