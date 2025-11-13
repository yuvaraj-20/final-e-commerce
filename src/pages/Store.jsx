// src/pages/Store.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Grid,
  List,
  ArrowLeft,
  Palette,
  Check,
  ShoppingCart,
  Heart,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import ProductCard from "../components/common/ProductCard";
// FilterSortPanel intentionally removed for a cleaner header UI

import { useStore } from "../store/useStore";
import { useAuth } from "../context/AuthContext";

import { productMatchesFilters } from "../utils/filtering";
import usePaginated from "../components/hooks/usePaginated";

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use global store as single source of truth
  const {
    products: storeProducts,
    searchQuery,
    // If your store exposes a setter for global search, include it here.
    // If not present that's fine — we call it conditionally.
    setSearchQuery,
    filters,
    setFilters,
    cart: globalCart,
    wishlist: globalWishlist,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleWishlist,
  } = useStore();

  const { isLoggedIn } = useAuth();

  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  // Local UI-only search input (clean search bar) — stays in sync with global search when possible
  const [localSearch, setLocalSearchState] = useState(searchQuery || "");

  // Show/hide compact filter panel
  const [showFilters, setShowFilters] = useState(false);

  // Keep local state and also update global store if setter is available. This preserves existing behaviour
  // while wiring the search to the store when present (minimal-nature change).
  const setLocalSearch = (val) => {
    setLocalSearchState(val);
    if (typeof setSearchQuery === "function") {
      try {
        setSearchQuery(val);
      } catch (e) {
        // harmless if store setter behaves differently
        console.debug("setSearchQuery call failed:", e);
      }
    }
  };

  // Mix & Match context from navigation state
  const { category: mixMatchCategory, targetCategory, fromMixMatch, currentSelection } =
    location.state || {};

  const mixMatchCategoryMapping = {
    tops: ["T-Shirts", "Hoodies", "Jackets"],
    bottoms: ["Shorts", "Pants", "Jeans"],
    footwear: ["Shoes", "Sneakers", "Boots"],
  };

  useEffect(() => {
    if (fromMixMatch && mixMatchCategory) {
      const relevant = mixMatchCategoryMapping[mixMatchCategory] || [];
      if (relevant.length > 0) setFilters({ category: relevant[0] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureAuth = async (nextPath = location.pathname) => {
    if (isLoggedIn) return true;
    toast.error("Please sign in to continue");
    navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
    return false;
  };

  const handleAddToCart = (product, event) => {
    event?.stopPropagation();
    if (!isLoggedIn) {
      try {
        const stored = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const defaultSize = product.default_size || "M";
        const defaultColor = product.colors?.[0] || product.color || "default";

        const existing = stored.find(
          (i) =>
            i.product.id === product.id &&
            i.size === defaultSize &&
            i.color === defaultColor
        );

        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
          toast.success(`${product.name} quantity updated in cart!`);
        } else {
          stored.push({
            id: `${product.id}-${defaultSize}-${defaultColor}-${Date.now()}`,
            product,
            size: defaultSize,
            color: defaultColor,
            quantity: 1,
          });
          toast.success(`${product.name} added to cart!`);
        }

        localStorage.setItem("guestCart", JSON.stringify(stored));
      } catch (err) {
        console.error(err);
        toast.error("Could not add to cart");
      }
      return;
    }

    if (typeof addToCart === "function") {
      const item = {
        product,
        size: product.default_size || "M",
        color: product.colors?.[0] || product.color || "default",
        quantity: 1,
      };
      addToCart(item);
      toast.success(`${product.name} added to cart!`);
      return;
    }

    toast.error("Cart action unavailable");
  };

  const handleAddToWishlist = (product, event) => {
    event?.stopPropagation();
    if (!isLoggedIn) {
      toast.error("Please sign in to continue");
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }

    if (typeof toggleWishlist === "function") {
      const isCurrently = (globalWishlist || []).includes(product.id);
      toggleWishlist(product.id);
      toast.success(
        isCurrently ? `${product.name} removed from wishlist!` : `${product.name} added to wishlist!`
      );
      return;
    }

    toast.error("Wishlist action unavailable");
  };

  const isInWishlist = (productId) => (globalWishlist || []).includes(productId);

  // --- PAGINATION / REMOTE FETCHING ---
  const serializedFilters = useMemo(() => {
    try {
      return JSON.stringify(filters || {});
    } catch (e) {
      return "";
    }
  }, [filters]);

  const {
    data: fetchedProducts = [],
    meta,
    loading,
    error,
    fetchPage,
    refresh,
  } = usePaginated("/api/products", [searchQuery, serializedFilters, sortBy], {
    initialPage: 1,
    pageSize: 24,
    params: {
      search: searchQuery || "",
      min_price: Array.isArray(filters?.priceRange) ? filters.priceRange[0] : undefined,
      max_price: Array.isArray(filters?.priceRange) ? filters.priceRange[1] : undefined,
      sort: sortBy || "name",
    },
  });

  const sourceProducts =
    (fetchedProducts && fetchedProducts.length > 0) ? fetchedProducts : storeProducts || [];

  const filteredProducts = sourceProducts.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (product.description || "").toLowerCase().includes((searchQuery || "").toLowerCase());

    let matchesMixMatchCategory = true;
    if (fromMixMatch && mixMatchCategory) {
      const relevant = mixMatchCategoryMapping[mixMatchCategory] || [];
      matchesMixMatchCategory =
        relevant.length === 0 || relevant.includes(product.category);
    }

    return (
      matchesSearch &&
      productMatchesFilters(product, filters) &&
      matchesMixMatchCategory
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      case "popular":
        return (b.likes ?? 0) - (a.likes ?? 0);
      case "newest":
        if (a.created_at && b.created_at) return new Date(b.created_at) - new Date(a.created_at);
        return String(b.id).localeCompare(String(a.id));
      default:
        return (a.name || "").localeCompare(b.name || "");
    }
  });

  // Clear filters function still kept for empty state usage
  const clearFilters = () => {
    setFilters({
      category: "",
      priceRange: [0, 1000],
      sizes: [],
      colors: [],
      rating: 0,
      gender: undefined,
      occasion: undefined,
      fabric: undefined,
      fit: undefined,
      season: undefined,
      brand: undefined,
      condition: undefined,
      era: undefined,
      setType: undefined,
      clothingType: undefined,
      printingType: undefined,
      colorBase: undefined,
    });
  };

  const getCategoryDisplayName = (category) => {
    const displayNames = {
      tops: "Tops & Shirts",
      bottoms: "Pants & Shorts",
      footwear: "Shoes & Footwear",
    };
    return displayNames[category] || category;
  };

  const totalCount = meta?.total ?? sourceProducts.length;
  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;

  const cartCount = (globalCart || []).reduce((total, item) => total + (item.quantity || 0), 0);

  // Search submit handler — now uses global setter when available
  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (typeof setSearchQuery === "function") {
      setSearchQuery(localSearch);
    } else {
      // Fallback: update URL to persist query or keep UI-only behavior
      navigate({ pathname: location.pathname, search: `?q=${encodeURIComponent(localSearch)}` });
    }
  };

  // Small helper: quick local filter changes (keeps shape)
  const applyQuickFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mix & Match Context Header */}
        {fromMixMatch && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Palette className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Mix & Match Selection</h3>
                  <p className="text-gray-600 mt-1">
                    Choose a {getCategoryDisplayName(mixMatchCategory)} for your {targetCategory} outfit
                  </p>
                  {currentSelection && (
                    <p className="text-sm text-blue-600 mt-1">Currently replacing: {currentSelection.name}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate("/mix-match")}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Mix & Match</span>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between bg-white/50 rounded-lg p-3">
              <div className="text-sm text-gray-600">
                {sortedProducts.length} {getCategoryDisplayName(mixMatchCategory).toLowerCase()} available
              </div>
              <div className="text-sm text-blue-600 font-medium">Click any product to add to your outfit</div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {fromMixMatch
                  ? `${getCategoryDisplayName(mixMatchCategory)} for Mix & Match`
                  : "Products"}
              </h1>
              <p className="text-gray-600">
                {fromMixMatch
                  ? `Find the perfect ${mixMatchCategory} to complete your outfit`
                  : "Discover our collection of premium fashion items"}
              </p>
            </div>

            {/* Clean search bar + view toggles + filter icon */}
            <div className="flex items-center space-x-4">
              {/* Search form (clean UI) */}
              <form onSubmit={onSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products, collections..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-72 sm:w-96 px-4 py-2 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4 text-gray-600" />
                </button>
              </form>

              {/* View mode toggles (kept) */}
              <div className="hidden sm:flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* FILTER ICON - toggles compact filter panel */}
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="p-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50"
                aria-label="Open filters"
              >
                <Filter className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Filter Panel (visible when filter icon toggled) */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Category</label>
                <select
                  value={filters?.category || ""}
                  onChange={(e) => applyQuickFilter("category", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All</option>
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Hoodies">Hoodies</option>
                  <option value="Jackets">Jackets</option>
                  <option value="Pants">Pants</option>
                  <option value="Shoes">Shoes</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Max Price</label>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={(filters?.priceRange?.[1]) ?? 1000}
                  onChange={(e) => applyQuickFilter("priceRange", [0, parseInt(e.target.value, 10)])}
                  className="w-48"
                />
                <div className="text-sm text-gray-600">{`₹${(filters?.priceRange?.[1]) ?? 1000}`}</div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => {
                    clearFilters();
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        <section className="mt-4">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Showing {sortedProducts.length} of {totalCount} products
              {fromMixMatch && mixMatchCategory && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {getCategoryDisplayName(mixMatchCategory)}
                </span>
              )}
            </p>

            {fromMixMatch && (
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                💡 Click any product to add to your {targetCategory} selection
              </div>
            )}
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded shadow p-6 animate-pulse h-72" />
              ))}
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="text-red-600 mb-3">Error: {error}</div>
              <div className="flex gap-3">
                <button onClick={() => fetchPage(currentPage)} className="px-3 py-2 border rounded">Retry</button>
                <button onClick={() => refresh()} className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded">Refresh</button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {sortedProducts.map((product, index) => (
                <div key={product.id} className="relative group">
                  <ProductCard
                    product={product}
                    index={index}
                    onClick={() => {
                      if (fromMixMatch) {
                        navigate("/mix-match", {
                          state: {
                            selectedProduct: {
                              id: product.id,
                              name: product.name,
                              image: product.images?.[0] || product.image,
                              price: product.price,
                              color: product.colors?.[0] || "bg-blue-500",
                              description: product.description,
                            },
                            targetCategory,
                            fromProducts: true,
                          },
                        });
                      } else {
                        navigate(`/product/${product.id}`);
                      }
                    }}
                    showMixMatchBadge={fromMixMatch}
                    mixMatchText={fromMixMatch ? "Select for Outfit" : undefined}
                  />

                  {!fromMixMatch && (
                    <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => handleAddToWishlist(product, e)}
                        className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                          isInWishlist(product.id)
                            ? "bg-red-500 text-white"
                            : "bg-white text-gray-600 hover:text-red-500 hover:bg-red-50"
                        }`}
                      >
                        <Heart
                          className="h-4 w-4"
                          fill={isInWishlist(product.id) ? "currentColor" : "none"}
                        />
                      </button>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transition-all duration-200"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {fromMixMatch && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {}}
                      className="absolute inset-0 bg-blue-600/10 hover:bg-blue-600/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300"
                    >
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center space-x-2 shadow-lg">
                        <Check className="h-4 w-4" />
                        <span>Select for {targetCategory}</span>
                      </div>
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {fromMixMatch ? `No ${mixMatchCategory} found` : "No products found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {fromMixMatch
                  ? `Try browsing other categories or adjusting your filters`
                  : "Try adjusting your filters or search terms"}
              </p>
              <div className="space-x-4">
                <button
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear all filters
                </button>
                {fromMixMatch && (
                  <button
                    onClick={() => navigate("/mix-match")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Back to Mix & Match
                  </button>
                )}
              </div>
            </div>
          )}

          {!loading && !error && totalCount > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {lastPage} — {totalCount} products
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => fetchPage(Math.min(lastPage, currentPage + 1))}
                  disabled={currentPage >= lastPage}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {fromMixMatch && sortedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-xl p-4 shadow-lg"
          >
            <div className="text-sm text-gray-600 mb-2">Mix & Match</div>
            <button
              onClick={() => navigate("/mix-match")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Return to Outfit
            </button>
          </motion.div>
        )}

        {isLoggedIn && (cartCount > 0 || (globalWishlist || []).length > 0) && !fromMixMatch && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-xl p-4 shadow-lg max-w-xs"
          >
            <div className="text-sm font-medium text-gray-900 mb-2">Your Items</div>
            <div className="space-y-1 text-sm text-gray-600">
              {cartCount > 0 && (
                <div className="flex items-center justify-between">
                  <span>Cart:</span>
                  <span className="font-medium">{cartCount} items</span>
                </div>
              )}
              {(globalWishlist || []).length > 0 && (
                <div className="flex items-center justify-between">
                  <span>Wishlist:</span>
                  <span className="font-medium">{(globalWishlist || []).length} items</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Products;
