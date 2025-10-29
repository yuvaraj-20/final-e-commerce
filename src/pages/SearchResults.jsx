// src/pages/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { api } from "../services/api";
import ProductCard from "../components/common/ProductCard";
import ThriftCard from "../components/thrift/ThriftCard";
import SellerCard from "../pages/SellerCard";

import { Grid, List, Search } from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PAGE_SIZE = 12;

const SearchResults = () => {
  const qParams = useQuery();
  const navigate = useNavigate();
  const q = qParams.get("q") || "";

  const [tab, setTab] = useState("products"); // products | thrift | sellers
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    // whenever query or tab changes, reset
    setResults([]);
    setPage(1);
    setPagination({ page: 1, total: 0, totalPages: 0 });
    if (q && q.trim().length > 0) fetchResults({ reset: true, p: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tab]);

  useEffect(() => {
    // load more when page increments (skip initial page=1 handled above)
    if (page > 1) fetchResults({ reset: false, p: page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchResults = async ({ reset = true, p = 1 } = {}) => {
    if (!q || q.trim().length === 0) {
      setResults([]);
      setPagination({ page: 1, total: 0, totalPages: 0 });
      return;
    }

    setLoading(true);
    try {
      const resp = await api.search({ q, tab, page: p, pageSize: PAGE_SIZE });
      const items = resp?.items ?? [];
      const pag = resp?.pagination ?? { page: p, total: items.length, totalPages: 1 };

      setResults((prev) => (reset ? items : [...prev, ...items]));
      setPagination(pag);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Failed to fetch search results");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const updateTabAndUrl = (newTab) => {
    setTab(newTab);
    // keep query in URL and set tab param for shareability
    const url = new URL(window.location.href);
    url.searchParams.set("q", q);
    url.searchParams.set("tab", newTab);
    navigate(`${url.pathname}${url.search}`, { replace: true });
  };

  const tabs = [
    { key: "products", label: "Products" },
    { key: "thrift", label: "Thrift" },
    { key: "sellers", label: "Sellers" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Results for “{q}”</h1>
          <p className="text-gray-600">{pagination.total ?? 0} results found</p>
        </div>

        {/* Tabs + View toggles + Filters placeholder */}
        <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-3">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => updateTabAndUrl(t.key)}
                className={`pb-2 px-3 -mb-px border-b-2 font-medium text-sm transition-colors ${
                  tab === t.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              aria-pressed={viewMode === "grid"}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`p-2 rounded ${viewMode === "list" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Loading skeleton (first load) */}
        {loading && results.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-xl shadow">
                <div className="h-40 bg-gray-200 rounded mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <motion.div
            layout
            className={`grid gap-6 ${
              tab === "sellers"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {results.map((item, idx) => {
              if (tab === "products") return <ProductCard key={item.id ?? idx} product={item} index={idx} viewMode={viewMode} />;
              if (tab === "thrift") return <ThriftCard key={item.id ?? idx} item={item} index={idx} viewMode={viewMode} />;
              if (tab === "sellers") return <SellerCard key={item.id ?? idx} seller={item} index={idx} />;
              return null;
            })}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && results.length === 0 && (
          <div className="text-center py-16">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No results found</h3>
            <p className="text-gray-600 mt-2">Try different keywords or remove filters.</p>
          </div>
        )}

        {/* Load more */}
        {!loading && pagination.page < pagination.totalPages && (
          <div className="mt-8 flex justify-center">
            <button onClick={handleLoadMore} className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-shadow shadow">
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
