// src/pages/ProductDetail.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Shield,
  Truck,
  RefreshCw,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { useStore } from "../store/useStore";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/common/ProductCard";

/**
 * ProductDetail with improved "You may also like" recommendations.
 *
 * Recommendation strategy (fast & client-side):
 * - category match => +50
 * - shared tags/colors/brand => +10 each
 * - popularity (likes/reviews) => normalized +0..20
 * - boost if in recentlyViewed => +15
 *
 * Persist recently viewed items to localStorage (max 12).
 */

const Skeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div className="h-10 w-36 bg-gray-200 rounded mb-6 animate-pulse" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white rounded-2xl shadow overflow-hidden p-4">
        <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-5 gap-3 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[1.3] bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="h-20 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const RECENTLY_VIEWED_KEY = "recently_viewed_products_v1";
const RECENTLY_VIEWED_MAX = 12;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { products, addToCart, wishlist, toggleWishlist } = useStore();
  const { isLoggedIn } = useAuth();

  // local UI state
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("details");

  // Recommendation carousel ref
  const carouselRef = useRef(null);

  // Find product and set defaults
  useEffect(() => {
    const found = (products || []).find((p) => String(p.id) === String(id)) || null;
    setProduct(found);
    if (found) {
      const firstImg = found.images?.[0] || found.image || "";
      setMainImage(firstImg);
      if (found.sizes?.length) setSelectedSize(found.sizes[0]);
      if (found.colors?.length) setSelectedColor(found.colors[0]);
    }
    // small delay for skeleton polish
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [id, products]);

  // track recently viewed in localStorage
  useEffect(() => {
    if (!product) return;
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let arr = raw ? JSON.parse(raw) : [];
      // remove existing occurrences
      arr = arr.filter((x) => String(x) !== String(product.id));
      arr.unshift(product.id); // newest at front
      if (arr.length > RECENTLY_VIEWED_MAX) arr = arr.slice(0, RECENTLY_VIEWED_MAX);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(arr));
    } catch (e) {
      // ignore localstorage errors
    }
  }, [product]);

  // build a small lookup for popularity normalization
  const popularityRange = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 1 };
    let min = Infinity, max = -Infinity;
    products.forEach((p) => {
      const score = (p.likes ?? 0) + (p.reviewsCount ?? 0) * 2;
      if (score < min) min = score;
      if (score > max) max = score;
    });
    if (min === Infinity || max === -Infinity) return { min: 0, max: 1 };
    return { min, max: Math.max(max, min + 1) };
  }, [products]);

  // Recommendation algorithm
  const getRecommendations = () => {
    if (!product || !products) return [];

    // collect recently viewed IDs
    let recent = [];
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      recent = raw ? JSON.parse(raw) : [];
    } catch (e) {
      recent = [];
    }

    const scoreFor = (cand) => {
      if (!cand || cand.id === product.id) return -Infinity;
      let score = 0;

      // strong: same category
      if (cand.category && product.category && cand.category === product.category) score += 50;

      // medium: brand
      if (cand.brand && product.brand && cand.brand === product.brand) score += 15;

      // medium: shared tags (if you have tags array)
      const tagsA = cand.tags || [];
      const tagsB = product.tags || [];
      const sharedTags = tagsA.filter((t) => tagsB.includes(t)).length;
      score += sharedTags * 10;

      // medium: shared colors
      const colorsA = cand.colors || [];
      const colorsB = product.colors || [];
      const sharedColors = colorsA.filter((c) => colorsB.includes(c)).length;
      score += sharedColors * 8;

      // light: popularity normalized
      const pop = (cand.likes ?? 0) + (cand.reviewsCount ?? 0) * 2;
      const { min, max } = popularityRange;
      const normalized = (pop - min) / (max - min || 1); // 0..1
      score += normalized * 20;

      // recently viewed boost
      if (recent.includes(cand.id)) score += 15;

      // small random jitter to vary order on ties
      score += Math.random() * 0.0001;
      return score;
    };

    const scored = products
      .filter((p) => p.id !== product.id)
      .map((p) => ({ p, score: scoreFor(p) }))
      .sort((a, b) => b.score - a.score);

    // return top N (cap 8)
    return scored.slice(0, 8).map((s) => s.p);
  };

  const recommendations = useMemo(() => getRecommendations(), [product, products, popularityRange]);

  // simple carousel controls
  const scrollCarousel = (dir = "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const offset = dir === "right" ? w * 0.7 : -w * 0.7;
    el.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Actions (auth soft-gate)
  const ensureAuth = async (nextPath = `/product/${id}`) => {
    if (isLoggedIn) return true;
    toast.error("Please sign in to continue");
    navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
    return false;
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!selectedSize && product?.sizes?.length) return toast.error("Please choose a size");
    if (!selectedColor && product?.colors?.length) return toast.error("Please choose a color");

    const ok = await ensureAuth();
    if (!ok) return;

    addToCart({
      product,
      quantity: qty,
      size: selectedSize,
      color: selectedColor,
    });
    toast.success(`${product.name} (${qty}x) added to cart`);
  };

  const handleWishlist = async () => {
    const ok = await ensureAuth();
    if (!ok) return;
    toggleWishlist(product.id);
    toast.success(wishlist.includes(product.id) ? "Removed from wishlist" : "Added to wishlist");
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (loading) return <Skeleton />;

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-2">Product not found</h1>
        <p className="text-gray-600 mb-6">It may have been moved or is currently unavailable.</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button onClick={share} className="px-3 py-2 rounded-lg border hover:bg-gray-50" title="Share">
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleWishlist}
            className={`px-3 py-2 rounded-lg border ${isWishlisted ? "bg-red-50 text-red-600 border-red-200" : "hover:bg-gray-50"}`}
            title="Wishlist"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="bg-white rounded-2xl shadow overflow-hidden p-4">
          <motion.img
            key={mainImage}
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            src={mainImage}
            alt={product.name}
            className="aspect-square w-full object-cover rounded-xl"
          />

          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-3 mt-4">
            {(product.images?.length ? product.images : [product.image]).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img)}
                className={`aspect-[1.3] rounded-lg overflow-hidden border ${mainImage === img ? "border-gray-900" : "border-transparent"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1 text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i + 1 <= Math.round(product.rating ?? 0) ? "fill-current" : ""}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {Number(product.rating ?? 0).toFixed(1)} · {product.reviewsCount ?? 48} reviews
            </span>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <div className="text-2xl font-semibold text-gray-900">
              {typeof product.price === "number" ? `₹${product.price.toLocaleString("en-IN")}` : product.price}
            </div>
            {product.mrp && <div className="text-gray-400 line-through">{typeof product.mrp === "number" ? `₹${product.mrp.toLocaleString("en-IN")}` : product.mrp}</div>}
            {product.discount && <span className="text-sm font-medium text-green-600">-{product.discount}%</span>}
          </div>

          <p className="mt-4 text-gray-700 leading-relaxed">{product.description}</p>

          {/* Size */}
          {product.sizes?.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Size</span>
                <button className="text-sm text-gray-500 hover:text-gray-700">Size guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const active = selectedSize === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3 py-2 rounded-lg border text-sm ${active ? "border-gray-900 bg-gray-900 text-white" : "hover:bg-gray-50"}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color */}
          {product.colors?.length > 0 && (
            <div className="mt-6">
              <div className="font-medium mb-2">Color</div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const active = selectedColor === c;
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-2 rounded-lg border text-sm ${active ? "border-gray-900 bg-gray-900 text-white" : "hover:bg-gray-50"}`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <div className="font-medium mb-2">Quantity</div>
            <div className="inline-flex items-center rounded-lg border overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50">-</button>
              <div className="px-4 py-2 min-w-[3rem] text-center">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 hover:bg-gray-50">+</button>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-900 text-white hover:bg-black">
              <ShoppingCart className="h-5 w-5" /> Add to cart
            </motion.button>
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleWishlist}
              className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${isWishlisted ? "bg-red-50 text-red-600 border-red-200" : "hover:bg-gray-50"}`}>
              <Heart className="h-5 w-5" /> {isWishlisted ? "Wishlisted" : "Add to wishlist"}
            </motion.button>
          </div>

          {/* Service badges */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3"><Truck className="h-4 w-4" /> <span>Fast shipping</span></div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3"><Shield className="h-4 w-4" /> <span>Secure checkout</span></div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3"><RefreshCw className="h-4 w-4" /> <span>7-day returns</span></div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex items-center gap-6 border-b">
              {["details", "care", "shipping"].map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`py-3 -mb-px border-b-2 text-sm font-medium ${activeTab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500"}`}>
                  {t === "details" ? "Details" : t === "care" ? "Care" : "Shipping"}
                </button>
              ))}
            </div>

            <div className="pt-4 text-sm text-gray-700 space-y-2">
              {activeTab === "details" && (
                <>
                  <p>{product.longDescription || "Premium fabric with excellent fit and finish."}</p>
                  <ul className="list-disc ml-5 space-y-1">
                    {product.fabric && <li>Fabric: {product.fabric}</li>}
                    {product.fit && <li>Fit: {product.fit}</li>}
                    {product.seasons?.length > 0 && <li>Season: {product.seasons.join(", ")}</li>}
                  </ul>
                </>
              )}
              {activeTab === "care" && (
                <>
                  <p>Wash at 30°C with similar colors. Do not bleach. Iron on low.</p>
                  <p className="flex items-center gap-2 text-green-700"><Check className="h-4 w-4" /> Built to last with reinforced stitching.</p>
                </>
              )}
              {activeTab === "shipping" && (
                <>
                  <p>Ships in 1–2 business days. Delivery ETA 2–5 days depending on your location.</p>
                  <p>Free returns within 7 days on unworn items with tags attached.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== You may also like (improved) ===================== */}
      {recommendations.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">You may also like</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => scrollCarousel("left")} className="p-2 rounded-md border bg-white hover:bg-gray-50" aria-label="Scroll left">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => scrollCarousel("right")} className="p-2 rounded-md border bg-white hover:bg-gray-50" aria-label="Scroll right">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div ref={carouselRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1" style={{ scrollBehavior: "smooth" }}>
            {recommendations.map((p, i) => (
              <div key={p.id} className="min-w-[220px] flex-shrink-0">
                <ProductCard product={p} index={i} onClick={() => navigate(`/product/${p.id}`)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3">
        <button onClick={handleWishlist} className={`flex-1 px-4 py-3 rounded-lg border ${isWishlisted ? "bg-red-50 text-red-600 border-red-200" : "hover:bg-gray-50"}`}>
          <span className="font-medium">{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
        </button>
        <button onClick={handleAddToCart} className="flex-1 px-4 py-3 rounded-lg bg-gray-900 text-white font-medium">Add to cart</button>
      </div>
    </div>
  );
};

export default ProductDetail;
