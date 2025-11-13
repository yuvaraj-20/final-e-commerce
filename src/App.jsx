import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthModal from "./components/common/AuthModal";
import Protected from "./Protected";

// 🏠 Pages
import Home from "./pages/Home";
import Products from "./pages/Store";
import ProductDetail from "./pages/ProductDetail";
import CustomDesign from "./pages/CustomDesign";
import ThriftStore from "./pages/ThriftStore";
import ThriftItemDetail from "./pages/ThriftItemDetail";
import ContactSeller from "./pages/ContactSeller";
import Seller from "./pages/Seller";
import MonoFit from "./pages/MonoFit";
import About from "./components/home/About";
import Cart from "./pages/Cart";
import Dashboard from "./pages/DashBoard";
import Wishlist from "./pages/Wishlist";
import MixMatch from "./pages/MixMatch";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./components/dashboard/admin/AdminDashboard";

// 🧠 New features
import UploadForm from "./components/thrift/UploadForm"; // seller upload page
// import ThriftCommunityFeed from "./pages/ThriftCommunityFeed"; // thrift feed
import SearchResults from "./pages/SearchResults";
import ThriftSell from "./pages/ThriftSell"
import Chat from "./pages/Chat";
import TrustSafety from "./pages/TrustSafety";

import { useStore } from "./store/useStore";
import { me } from "./lib/apiClient";
import {
  mockUser,
  mockThriftItems,
  mockMonofitCombos,
} from "./components/data/mockData";

// 🔹 Auth bootstrapper
function AuthBootstrap({ children }) {
  const { setUser, markLoggedIn } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await me().catch(() => null);
        if (u) {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
          markLoggedIn?.(true);
        } else {
          const saved = localStorage.getItem("user");
          if (saved) {
            const parsed = JSON.parse(saved);
            setUser(parsed);
            markLoggedIn?.(true);
          } else {
            markLoggedIn?.(false);
          }
        }
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [setUser, markLoggedIn]);

  if (!ready) return null;
  return children;
}

// 🔹 Main App Content
function AppContent() {
  const { setUser, setProducts, setThriftItems, setMonofitCombos } = useStore();

  useEffect(() => {
    setUser((prev) => prev ?? mockUser);
    setThriftItems(mockThriftItems);
    setMonofitCombos(mockMonofitCombos);
  }, [setUser, setProducts, setThriftItems, setMonofitCombos]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="transition-[padding] duration-200 pt-[var(--header-height,64px)]">
        <Routes>
          {/* 🔐 Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 🌐 Public */}
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/design" element={<CustomDesign />} />
          <Route path="/mix-match" element={<MixMatch />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/monofit" element={<MonoFit />} />
          <Route path="/monofit/:id" element={<MonoFit />} />

          {/* 🧵 Thrift */}
          <Route path="/thrift" element={<ThriftStore />} />
          <Route path="/thrift/:id" element={<ThriftItemDetail />} />
          {/* <Route path="/thrift/community" element={<ThriftCommunityFeed />} /> */}
          <Route
            path="/thrift/upload"
            element={
              <Protected allow={["user", "seller", "admin"]}>
                <UploadForm />
              </Protected>
            }
          />
          <Route
  path="/thrift/sell"
  element={
    <Protected allow={["seller", "admin"]}>
      <ThriftSell />
    </Protected>
  }
/>

          {/* 👥 Seller */}
          <Route path="/seller/:sellerId" element={<Seller />} />
          <Route path="/seller/:sellerId/policies" element={<TrustSafety />} />
          <Route path="/seller/:sellerId/contact" element={<ContactSeller />} />

          {/* 💬 Chat / Safety */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:sellerId" element={<Chat />} />
          <Route path="/trust-safety" element={<TrustSafety />} />

          {/* 🔎 Search */}
          <Route path="/search" element={<SearchResults />} />

          {/* 📊 Dashboards */}
          <Route
            path="/dashboard"
            element={
              <Protected allow={["user", "seller", "admin"]}>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <Protected allow={["admin"]}>
                <AdminDashboard />
              </Protected>
            }
          />

          {/* 🚧 Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      <Footer />
      <Toaster position="top-right" />
      <AuthModal />
    </div>
  );
}

// 🔹 Root App
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthBootstrap>
          <AppContent />
        </AuthBootstrap>
      </AuthProvider>
    </Router>
  );
}
