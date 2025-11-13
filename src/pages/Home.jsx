// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShoppingCart,
  User,
  Zap,
  Palette,
  Shirt,
  Globe,
  Undo2,
  Gem,
  Sparkles,
  Glasses,
} from "lucide-react";
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ProductCard from '../components/common/ProductCard';
import HeroCarousel from '../components/home/HeroCarousel';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext'; // Add authentication
import { api as http } from '../lib/apiClient';
import NewArrivalsCarousel from '../components/home/NewArrivalsCarousel';  
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useStore } from "../store/useStore";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

/**
 * Responsive luxury landing (Thrift / MonoFit / Customize)
 * - Inline luxury gradients (hex)
 * - Lucide icons for features & promo cards
 * - Mobile-first responsive layout (1 -> 2 -> 3 columns)
 * - Replace placeholder product src '/placeholder-sweatshirt.png' with your image path
 */

const Home = () => {
  const { products, setProducts } = useStore();
  const { requireAuth, isLoggedIn, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await http.get('/api/products', { params: { per_page: 24 } });
        const items = res?.data?.data || res?.data || [];
        if (mounted) setProducts(items);
      } catch (e) {
        // ignore; sections gracefully handle empty
      }
    })();
    return () => { mounted = false; };
  }, [setProducts]);

  useEffect(() => {
    const openDashboardOrLogin = () => navigate(isLoggedIn ? "/dashboard" : "/login");
    window.openDashboardOrLogin = openDashboardOrLogin;
    return () => delete window.openDashboardOrLogin;
  }, [isLoggedIn, navigate]);

  const sampleProduct = products?.[0] ?? { id: "sample", name: "Premium Cotton T-Shirt" };

  // Pastel card configs
  const stores = [
    {
      key: "thrift",
      title: "Thrift Store",
      subtitle: "Sustainable Fashion Finds ♻️",
      cta: "SHOP NOW",
      gradientBG: "bg-gradient-to-br from-[#E9DFFF] to-[#E0D1FF]",
      route: "/thrift",
    },
    {
      key: "monofit",
      title: "MonoFit",
      subtitle: "Matching sets from ₹499",
      cta: "VIEW COLLECTION",
      gradientBG: "bg-gradient-to-br from-[#FFF6D9] to-[#FFF0C9]",
      route: "/monofit",
    },
    {
      key: "customize",
      title: "Customize",
      subtitle: "Create your own design 🎨",
      cta: "START DESIGNING",
      gradientBG: "bg-gradient-to-br from-[#E8FBFF] to-[#D4F3FF]",
      route: "/design",
    },
  ];

  const features = [
    { icon: <Zap className="h-5 w-5 text-[#6C46FF]" />, title: "Instant Delivery", desc: "10-min drop-offs" },
    { icon: <Gem className="h-5 w-5 text-[#6C46FF]" />, title: "Premium Fabric", desc: "Curated textiles" },
    { icon: <Undo2 className="h-5 w-5 text-[#6C46FF]" />, title: "Free Returns", desc: "Hassle-free pickup" },
    { icon: <Globe className="h-5 w-5 text-[#6C46FF]" />, title: "Worldwide Access", desc: "We ship globally" },
  ];

  const addToCart = (item) => {
    requireAuth(() => {
      setCart((prev) => {
        const ex = prev.find((p) => p.id === item.id);
        if (ex) {
          toast.success(`${item.name || "Item"} quantity updated`);
          return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p));
        } else {
          toast.success(`${item.name || "Item"} added to cart`);
          return [...prev, { ...item, quantity: 1 }];
        }
      });
    });
  };

  const toggleWishlist = (item) => {
    requireAuth(() => {
      setWishlist((prev) => {
        if (prev.some((p) => p.id === item.id)) {
          toast.success("Removed from wishlist");
          return prev.filter((p) => p.id !== item.id);
        } else {
          toast.success("Added to wishlist");
          return [...prev, item];
        }
      });
    });
  };

  return (
    <div className="min-h-screen bg-[#FBFCFE] text-[#0F1724] antialiased">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ background: "linear-gradient(90deg,#6C46FF,#CFA6FF)" }}
              >
                Y
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold">YourBrand</div>
                <div className="text-xs text-gray-500">Delivering to: Chennai</div>
              </div>
            </div>

            <div className="flex-1 px-4">
              <div className="max-w-2xl mx-auto relative">
                <input
                  className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-[#6C46FF]/30"
                  placeholder="Search products, collections..."
                  aria-label="Search"
                />
                <button
                  className="absolute right-1 top-1.5 h-8 px-3 rounded-full text-white font-medium shadow-sm"
                  style={{ background: "linear-gradient(90deg,#6C46FF,#5B4BDB)" }}
                >
                  Search
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.openDashboardOrLogin?.()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100"
              >
                <User className="h-5 w-5 text-gray-700" />
                <span className="hidden md:inline text-sm font-medium">{isLoggedIn && user ? user.name : "Sign in"}</span>
              </button>

              <button onClick={() => navigate("/cart")} className="p-2 rounded-full hover:bg-gray-100">
                <ShoppingCart className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Fast Fashion, <br />
              <span className="block text-[#6C46FF]">Faster Delivery — in 10 mins 🚀</span>
            </h1>
            <p className="mt-4 text-gray-600 max-w-xl">
              Exclusive designs, Zero waiting. Curated Thrift & MonoFit sets — delivered fast.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/thrift"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold shadow-lg"
                style={{ background: "linear-gradient(90deg,#6C46FF,#CFA6FF)" }}
              >
                <Zap className="h-4 w-4" />
                <span className="text-sm">Shop Now</span>
              </Link>

              <Link
                to="/collection"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 text-gray-700 font-medium shadow-sm"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">View Collection</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-64 sm:w-72 md:w-80 lg:w-[360px] rounded-xl bg-white p-6 shadow-xl">
              <div className="w-full h-64 rounded-md flex items-center justify-center bg-gradient-to-br from-gray-50 to-white text-gray-400">
                {/* Use your real product image here; placeholder included */}
                <img
                  src="/placeholder-sweatshirt.png"
                  alt="Premium Sweatshirt"
                  className="object-cover w-48 h-48"
                  onError={(e) => {
                    // hide broken img and show fallback text
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="text-center text-sm text-gray-400">Premium Sweatshirt</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store cards */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((s) => (
              <motion.article
                key={s.key}
                whileHover={{ translateY: -6 }}
                className={`${s.gradientBG} rounded-2xl p-6 shadow-lg cursor-pointer`}
                onClick={() => navigate(s.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(s.route)}
              >
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-2xl font-bold text-[#0F1724]">{s.title}</h3>
                    <p className="text-gray-700 mt-2">{s.subtitle}</p>
                  </div>

                  <div className="mt-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full font-semibold text-sm text-[#0F1724] shadow-sm">
                      {s.cta} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Super Saver Zone */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden bg-[#2F9D67] text-white shadow-lg">
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-extrabold">Super Saver Zone</h2>
                <p className="text-sm text-white/90">Lowest Prices of the Month</p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-end gap-3">
                <div className="bg-[#DFF6EA] p-4 rounded-xl text-[#0A3A25] min-w-[150px] text-center">
                  <Shirt className="h-5 w-5 mx-auto mb-1" />
                  <div className="font-semibold">Top deals</div>
                  <div className="text-sm">on denim</div>
                </div>

                <div className="bg-[#FFF7E6] p-4 rounded-xl text-[#4B3B16] min-w-[150px] text-center">
                  <Sparkles className="h-5 w-5 mx-auto mb-1" />
                  <div className="font-semibold">Best offers</div>
                  <div className="text-sm">on outerwear</div>
                </div>

                <div className="bg-[#E8F7FF] p-4 rounded-xl text-[#0E3A45] min-w-[150px] text-center">
                  <Glasses className="h-5 w-5 mx-auto mb-1" />
                  <div className="font-semibold">Buy 1 Get 1</div>
                  <div className="text-sm">free eyewear</div>
                </div>
              </div>
            </div>

            {/* Feature icons row */}
            <div className="bg-white p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {features.map((f, idx) => (
                <div key={idx} className="p-4 bg-white rounded-xl shadow-sm text-center border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-center mb-2">{f.icon}</div>
                  <div className="font-semibold text-[#0F1724]">{f.title}</div>
                  <div className="text-sm text-gray-500">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Floating cart/wishlist summary */}
      {isLoggedIn && (cart.length > 0 || wishlist.length > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed bottom-6 right-6 z-50">
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg w-72">
            <div className="font-semibold">Your Items</div>
            <div className="mt-2 text-sm text-gray-600">
              {cart.length} in cart • {wishlist.length} wishlist
            </div>
            <div className="mt-3 flex gap-2">
              <Link to="/cart" className="flex-1 text-center py-2 rounded-md bg-[#6C46FF] text-white font-semibold">View Cart</Link>
              <Link to="/wishlist" className="flex-1 text-center py-2 rounded-md bg-gray-100 text-gray-700">Wishlist</Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
