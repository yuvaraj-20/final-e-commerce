import React, { useState, useEffect } from "react";
import { Heart, ArrowLeft, LogIn } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { api } from "../services/api"; // keep if you have getWishlistItems here
import { useStore } from "../store/useStore";
import WishlistStats from "../components/wishlist/WishlistStats";
import WishlistFilters from "../components/wishlist/WishlistFilters";
import WishlistItem from "../components/wishlist/WishlistItem";
import { me } from "../lib/apiClient";

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  // Auth/user state resolved via Sanctum (not from store)
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Page data
  const [wishlistItems, setWishlistItems] = useState({
    products: [],
    thriftItems: [],
    combos: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");

  const navigate = useNavigate();
  const location = useLocation();

  // Auth check on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await me();
        if (mounted) setAuthUser(u || null);
      } catch {
        if (mounted) setAuthUser(null);
      } finally {
        if (mounted) setAuthChecked(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load wishlist items when logged in and list changes
  useEffect(() => {
    if (!authChecked) return;

    if (authUser && wishlist.length > 0) {
      loadWishlistItems();
    } else {
      // not logged in or empty list
      setWishlistItems({ products: [], thriftItems: [], combos: [] });
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, authUser, wishlist]);

  const loadWishlistItems = async () => {
    setIsLoading(true);
    try {
      // If your services/api exposes getWishlistItems, use it:
      if (api?.getWishlistItems) {
        const data = await api.getWishlistItems(wishlist);
        setWishlistItems(data || { products: [], thriftItems: [], combos: [] });
      } else {
        // fallback: if no API, just store empty groups (or build from local data)
        setWishlistItems({ products: [], thriftItems: [], combos: [] });
      }
    } catch (error) {
      console.error("Failed to load wishlist items:", error);
      toast.error("Could not load wishlist right now.");
    } finally {
      setIsLoading(false);
    }
  };

  // Only require login when user performs protected actions
  const ensureAuth = async (nextPath = "/wishlist") => {
    try {
      await me();
      return true;
    } catch {
      toast.error("Please sign in to continue");
      navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
      return false;
    }
  };

  const handleRemoveFromWishlist = (itemId) => {
    toggleWishlist(itemId);
    toast.success("Removed from wishlist");
  };

  const handleAddAllToCart = async () => {
    const ok = await ensureAuth("/cart");
    if (!ok) return;

    let added = 0;

    wishlistItems.products.forEach((product) => {
      addToCart({
        product,
        quantity: 1,
        size: product.sizes?.[0],
        color: product.colors?.[0],
      });
      added++;
    });

    wishlistItems.combos.forEach((combo) => {
      combo.items?.forEach((item) => {
        addToCart({
          product: item,
          quantity: 1,
          size: item.sizes?.[0],
          color: item.colors?.[0],
        });
        added++;
      });
    });

    if (added > 0) {
      toast.success(`Added ${added} items to cart!`);
    } else {
      toast("Nothing to add right now.");
    }
  };

  const handleShareWishlist = async () => {
    const ok = await ensureAuth("/wishlist");
    if (!ok) return;

    const shareUrl = `${window.location.origin}/wishlist/shared/${authUser?.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Fashion Wishlist",
          text: "Check out my wishlist on AI Fashion!",
          url: shareUrl,
        });
      } catch {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Wishlist link copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Wishlist link copied to clipboard!");
    }
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case "products":
        return { products: wishlistItems.products, thriftItems: [], combos: [] };
      case "thrift":
        return { products: [], thriftItems: wishlistItems.thriftItems, combos: [] };
      case "combos":
        return { products: [], thriftItems: [], combos: wishlistItems.combos };
      default:
        return wishlistItems;
    }
  };

  const currentItems = getCurrentItems();
  const totalItems =
    currentItems.products.length +
    currentItems.thriftItems.length +
    currentItems.combos.length;

  // Loading skeleton
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                <div className="w-3/4 h-4 bg-gray-200 rounded mb-2" />
                <div className="w-1/2 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not logged in → friendly gate
  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-50 flex items-center justify-center">
            <Heart className="w-10 h-10 text-purple-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign in to view your wishlist</h1>
          <p className="text-gray-600 mb-8">
            Save items you love and find them here anytime. Create an account or sign in to continue.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to={`/login?next=${encodeURIComponent("/wishlist")}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-semibold"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              to="/products"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/products"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Continue Shopping</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          {totalItems > 0 && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              {totalItems} items
            </span>
          )}
        </div>

        {totalItems === 0 ? (
          // Empty State (logged in)
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love to your wishlist. They'll appear here so you can easily find them later.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-semibold"
              >
                Explore Products
              </Link>
              <Link
                to="/thrift"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Browse Thrift Store
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <WishlistStats
              totalItems={totalItems}
              productsCount={wishlistItems.products.length}
              thriftCount={wishlistItems.thriftItems.length}
              combosCount={wishlistItems.combos.length}
            />

            {/* Filters */}
            <WishlistFilters
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              setSortBy={setSortBy}
              totalItems={totalItems}
              productsCount={wishlistItems.products.length}
              thriftCount={wishlistItems.thriftItems.length}
              combosCount={wishlistItems.combos.length}
              onShareWishlist={handleShareWishlist}
              onAddAllToCart={handleAddAllToCart}
            />

            {/* Items Grid */}
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {/* Products */}
              {currentItems.products.map((product, index) => (
                <WishlistItem
                  key={`product-${product.id}`}
                  item={product}
                  type="product"
                  index={index}
                  viewMode={viewMode}
                  onRemove={handleRemoveFromWishlist}
                />
              ))}

              {/* Thrift Items */}
              {currentItems.thriftItems.map((item, index) => (
                <WishlistItem
                  key={`thrift-${item.id}`}
                  item={item}
                  type="thrift"
                  index={index + currentItems.products.length}
                  viewMode={viewMode}
                  onRemove={handleRemoveFromWishlist}
                />
              ))}

              {/* Combos */}
              {currentItems.combos.map((combo, index) => (
                <WishlistItem
                  key={`combo-${combo.id}`}
                  item={combo}
                  type="combo"
                  index={
                    index +
                    currentItems.products.length +
                    currentItems.thriftItems.length
                  }
                  viewMode={viewMode}
                  onRemove={handleRemoveFromWishlist}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
