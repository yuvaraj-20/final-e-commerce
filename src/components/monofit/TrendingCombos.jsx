// src/components/monofit/TrendingCombos.jsx
import React, { useState, useEffect } from "react";
import {
  Flame,
  TrendingUp,
  Info,
  Eye,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../../../services/api";
import ComboCard from "./ComboCard";
import toast from "react-hot-toast";

const TrendingCombos = () => {
  const [trendingCombos, setTrendingCombos] = useState([]);
  const [timeFilter, setTimeFilter] = useState("today");
  const [isLoading, setIsLoading] = useState(true);
  const [showTrendingInfo, setShowTrendingInfo] = useState(false);

  useEffect(() => {
    loadTrendingCombos();
  }, [timeFilter]);

  const loadTrendingCombos = async () => {
    setIsLoading(true);
    try {
      const combos = await api.getTrendingCombos(timeFilter);
      setTrendingCombos(combos);
    } catch (error) {
      toast.error("Failed to load trending combos");
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendingScore = (combo) => {
    return (
      combo.likes * 2 + combo.shares * 3 + combo.orders * 4 + combo.comments * 1
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-white/20 p-3 rounded-full"
              >
                <Flame className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Trending Now</h1>
                <p className="text-orange-100 text-sm sm:text-base">
                  Hottest outfit combos based on community engagement
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <button
                onClick={() => setTimeFilter("today")}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  timeFilter === "today"
                    ? "bg-white text-orange-500"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeFilter("week")}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  timeFilter === "week"
                    ? "bg-white text-orange-500"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                This Week
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowTrendingInfo(!showTrendingInfo)}
            className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors self-start sm:self-auto"
          >
            <Info className="h-6 w-6" />
          </button>
        </div>

        {showTrendingInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 bg-white/10 rounded-lg"
          >
            <h3 className="font-semibold mb-2">How Trending Works</h3>
            <p className="text-sm text-orange-100 mb-3">
              Our AI analyzes real-time engagement to surface the hottest combos:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Likes × 2</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Shares × 3</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Orders × 4</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Comments × 1</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {trendingCombos.length}
              </div>
              <div className="text-sm text-gray-600">Trending Combos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {trendingCombos
                  .reduce((sum, combo) => sum + combo.views, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {trendingCombos
                  .reduce((sum, combo) => sum + combo.likes, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {trendingCombos
                  .reduce((sum, combo) => sum + combo.orders, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Combos List */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
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
      ) : trendingCombos.length > 0 ? (
        <>
          {trendingCombos[0] && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">#1 Trending Combo</h3>
                    <p className="text-yellow-100 text-sm sm:text-base">
                      Trending Score:{" "}
                      {getTrendingScore(trendingCombos[0]).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <ComboCard combo={trendingCombos[0]} viewMode="list" />
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              More Trending Combos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trendingCombos.slice(1).map((combo, index) => (
                <div key={combo.id} className="relative">
                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    #{index + 2}
                  </div>
                  <ComboCard combo={combo} index={index + 1} />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flame className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No trending combos yet
          </h3>
          <p className="text-gray-600">
            Check back later to see what's trending in the community!
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendingCombos;
