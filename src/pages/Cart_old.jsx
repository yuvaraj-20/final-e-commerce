// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { useStore } from "../store/useStore";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import PromoCode from "../components/cart/PromoCode";
import RecommendedItems from "../components/cart/RecommendedItems";
import { me } from "../lib/apiClient";

const Cart = () => {
  // From store
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    mergeGuestCart,
    clearGuestCart,
  } = useStore();

  const [guestCart, setGuestCart] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const navigate = useNavigate();
  const isUserLoggedIn = !!localStorage.getItem("authToken");

  // Load guest cart or merge when logged in
  useEffect(() => {
    try {
      const storedGuest = JSON.parse(localStorage.getItem("guestCart") || "[]");
      if (!isUserLoggedIn) {
        setGuestCart(Array.isArray(storedGuest) ? storedGuest : []);
      } else if (Array.isArray(storedGuest) && storedGuest.length > 0) {
        mergeGuestCart(storedGuest);
        localStorage.removeItem("guestCart");
        setGuestCart([]);
        toast.success("Merged items from your guest cart");
      }
    } catch (err) {
      console.error("Cart load error", err);
      setGuestCart([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserLoggedIn]);

  const handleGuestQuantityChange = (itemId, newQuantity) => {
    const updatedCart = guestCart
      .map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
      .filter((item) => item.quantity > 0);

    setGuestCart(updatedCart);
    localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    toast.success("Cart updated");
  };

  const handleGuestRemoveItem = (itemId) => {
    const updatedCart = guestCart.filter((item) => item.id !== itemId);
    setGuestCart(updatedCart);
    localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    toast.success("Item removed from cart");
  };

  const ensureAuth = async (nextPath = "/checkout") => {
    try {
      await me();
      return true;
    } catch {
      toast.error("Please sign in to continue");
      navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
      return false;
    }
  };

  const handleCheckout = async () => {
    const ok = await ensureAuth("/checkout");
    if (!ok) return;

    setIsCheckingOut(true);
    try {
      const remainingGuest = JSON.parse(localStorage.getItem("guestCart") || "[]");

      if (isUserLoggedIn && Array.isArray(remainingGuest) && remainingGuest.length > 0) {
        await fetch("/api/cart/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(remainingGuest),
        });
        localStorage.removeItem("guestCart");
        clearGuestCart();
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));
      clearCart();
      setGuestCart([]);
      setAppliedPromo(null);
      localStorage.removeItem("mixMatchItems");
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Checkout error", error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const effectiveCart = isUserLoggedIn ? cart : guestCart;

  // 🟩 Helper: Show store badge + logo
  const getStoreBadge = (storeName) => {
    if (!storeName) return null;
    const s = storeName.toLowerCase();
    const logoMap = {
      monofit: "/assets/store-logos/monofit.png",
      thrift: "/assets/store-logos/thrift.png",
      custom: "/assets/store-logos/custom.png",
    };
    const colorMap = {
      monofit: "bg-blue-100 text-blue-700",
      thrift: "bg-green-100 text-green-700",
      custom: "bg-purple-100 text-purple-700",
    };
    const labelMap = {
      monofit: "MonoFit",
      thrift: "Thrift",
      custom: "Custom",
    };
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colorMap[s] || "bg-gray-100 text-gray-600"}`}>
        {logoMap[s] && (
          <img src={logoMap[s]} alt={s} className="w-4 h-4 rounded-full object-cover" />
        )}
        {labelMap[s] || "Store"}
      </div>
    );
  };

  if (!effectiveCart || effectiveCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Continue Shopping
              </Link>
              <Link
                to="/monofit"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold"
              >
                Explore MonoFit
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/products"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Continue Shopping</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">
            Shopping Cart ({effectiveCart.length})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {effectiveCart.map((item, index) => (
                <div key={item.id}>
                  <div className="flex justify-between items-center mb-1">
                    {getStoreBadge(item.store)}
                  </div>
                  <CartItem
                    item={item}
                    index={index}
                    onQuantityChange={
                      isUserLoggedIn
                        ? (id, qty) => updateCartQuantity(id, qty)
                        : (id, qty) => handleGuestQuantityChange(id, qty)
                    }
                    onRemove={
                      isUserLoggedIn
                        ? (id) => removeFromCart(id)
                        : (id) => handleGuestRemoveItem(id)
                    }
                  />
                </div>
              ))}
            </AnimatePresence>

            <PromoCode
              appliedPromo={appliedPromo}
              onApplyPromo={setAppliedPromo}
              onRemovePromo={() => setAppliedPromo(null)}
            />
          </div>

          <div className="space-y-6">
            <CartSummary
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
              appliedPromo={appliedPromo}
            />
            <RecommendedItems cartItems={effectiveCart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
