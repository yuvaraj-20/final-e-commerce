// src/pages/MonoFit.jsx
import React, { useState, useEffect } from "react";
import { Search, Filter, Flame, Zap } from "lucide-react";
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

  // local search state to debounce updates to store
  const [localSearch, setLocalSearch] = useState(monofitFilters?.search || "");

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

  useEffect(() => {
    // keep localSearch in sync when external filters change (e.g. clear filters)
    setLocalSearch(monofitFilters?.search || "");
  }, [monofitFilters?.search]);

  // debounce localSearch -> setMonofitFilters
  useEffect(() => {
    const t = setTimeout(() => {
      if ((monofitFilters?.search || "") !== localSearch) {
        setMonofitFilters({ ...monofitFilters, search: localSearch });
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

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
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg">
                <Zap className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">MonoFit Store</h1>
            </div>
            <p className="text-gray-600">AI-curated outfit combinations for the perfect look</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <button
              onClick={handleUploadClick}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-full font-medium flex items-center space-x-2 hover:from-purple-700 hover:to-blue-700 transition-colors shadow-sm"
            >
              <Zap className="h-4 w-4" />
              <span>Create Combo</span>
            </button>
          </div>
        </div>

        {/* Tabs + search/filter (minimal) */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab("combos")}
                className={`px-5 py-2 rounded-full font-medium transition-colors ${
                  activeTab === "combos" ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Combos
              </button>

              <button
                onClick={() => setActiveTab("trending")}
                className={`px-5 py-2 rounded-full font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === "trending" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Flame className="h-4 w-4" />
                <span>Trending Now</span>
              </button>

              <button
                onClick={() => setActiveTab("community")}
                className={`px-5 py-2 rounded-full font-medium transition-colors ${
                  activeTab === "community" ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Community Looks
              </button>
            </div>

            {/* visible sort, search + filter icon */}
            <div className="flex items-center gap-3">
              {/* Sort select (visible) */}
              <select
                value={monofitFilters?.sortBy || "newest"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg mr-2"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <div className="relative w-64 sm:w-96">
                <input
                  type="text"
                  placeholder="Search outfit combos..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50"
                aria-label="Filters"
              >
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* compact filter panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={monofitFilters?.category || "all"}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c.toLowerCase()}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={monofitFilters?.gender || "all"}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Genders</option>
                  {genders.map((g) => (
                    <option key={g} value={g.toLowerCase()}>
                      {g}
                    </option>
                  ))}
                </select>

                <select
                  value={monofitFilters?.season || "all"}
                  onChange={(e) => handleFilterChange("season", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Seasons</option>
                  {seasons.map((s) => (
                    <option key={s} value={s.toLowerCase()}>
                      {s}
                    </option>
                  ))}
                </select>

                <div>
                  <label className="text-sm text-gray-600">Max Price</label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={(monofitFilters?.priceRange?.[1]) ?? 500}
                    onChange={(e) => handleFilterChange("priceRange", [0, parseInt(e.target.value, 10)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                  {monofitCombos.map((combo, idx) => (
                    <ComboCard
                      key={combo.id}
                      combo={combo}
                      index={idx}
                      viewMode={viewMode}
                      onOpen={(comboId) => {
                        try {
                          window.location.assign(`/monofit/${comboId}`);
                        } catch (err) {
                          window.location.href = `/monofit/${comboId}`;
                        }
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
