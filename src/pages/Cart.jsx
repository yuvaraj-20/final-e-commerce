// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { me, api } from "../lib/apiClient";

import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import RecommendedItems from "../components/cart/RecommendedItems";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, setCart, loadGuestCart } = useStore();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // 🧭 Initialize cart and merge guest data
  useEffect(() => {
    const initCart = async () => {
      setLoading(true);
      try {
        const user = await me();
        setIsLoggedIn(!!user?.id);

        const guestCart = loadGuestCart();
        if (Array.isArray(guestCart) && guestCart.length > 0) {
          toast("Merging your guest cart...");
          await Promise.all(
            guestCart.map((item) =>
              api.post("/api/cart/items", {
                product_id: item.product?.id ?? item.id,
                quantity: item.quantity ?? 1,
              })
            )
          );
          localStorage.removeItem("guestCart");
        }

        const resp = await api.get("/api/cart");
        const payload = resp?.data ?? resp;

        let normalized = [];
        if (Array.isArray(payload)) normalized = payload;
        else if (payload?.items) normalized = payload.items;
        else if (payload?.cart?.items) normalized = payload.cart.items;
        else if (payload?.data) normalized = payload.data;
        else {
          console.warn("Unexpected /api/cart shape:", payload);
          normalized =
            Object.values(payload || {}).find((v) => Array.isArray(v)) ?? [];
        }

        setCart(Array.isArray(normalized) ? normalized : []);
      } catch (err) {
        console.warn("Failed to load server cart, using guest cart", err);
        const guestCart = loadGuestCart();
        setCart(Array.isArray(guestCart) ? guestCart : []);
      } finally {
        setLoading(false);
      }
    };

    initCart();
  }, [setCart, loadGuestCart]);

  // 🧩 Remove item handler
  const handleRemove = async (id) => {
    try {
      if (isLoggedIn) {
        try {
          await api.delete(`/api/cart/items/${id}`);
        } catch {
          await api.delete(`/api/cart/items`, { params: { product_id: id } });
        }

        const resp = await api.get("/api/cart");
        const payload = resp?.data ?? resp;
        const items =
          payload?.items ??
          payload?.cart?.items ??
          (Array.isArray(payload) ? payload : []);
        setCart(Array.isArray(items) ? items : []);
      } else {
        const updated = cart.filter(
          (i) => i.id !== id && i.product?.id !== id
        );
        localStorage.setItem("guestCart", JSON.stringify(updated));
        setCart(updated);
      }

      toast.success("Removed from cart");
    } catch (err) {
      console.error("Remove failed:", err);
      toast.error("Failed to remove item");
    }
  };

  // 🧮 Update quantity handler (sync with backend or localStorage)
  const handleQuantityChange = async (id, newQty) => {
    const updated = cart.map((i) =>
      i.id === id || i.product?.id === id ? { ...i, quantity: newQty } : i
    );
    setCart(updated);

    if (isLoggedIn) {
      try {
        await api.patch(`/api/cart/items/${id}`, { quantity: newQty });
      } catch (err) {
        console.warn("Server quantity update failed:", err);
      }
    } else {
      localStorage.setItem("guestCart", JSON.stringify(updated));
    }
  };

  // 🧾 Checkout flow
  const handleCheckout = () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);

    if (!isLoggedIn) {
      toast.error("Please log in to continue checkout");
      setTimeout(() => {
        setIsCheckingOut(false);
        navigate("/login?next=/cart");
      }, 800);
      return;
    }

    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty");
      setIsCheckingOut(false);
      return;
    }

    try {
      toast.success("Redirecting to checkout...");
      navigate("/checkout");
    } catch (err) {
      console.error("Checkout navigation failed:", err);
      toast.error("Could not start checkout");
      setIsCheckingOut(false);
    }
  };

  // 🌀 Loading state
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading cart...
      </div>
    );

  // 🧱 Empty cart
  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 text-gray-500">
        <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
        <p className="mb-6">Your cart is empty</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/")}
          className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-purple-700 transition"
        >
          Continue Shopping
        </motion.button>
      </div>
    );
  }

  // ✅ Main Render
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>

        <AnimatePresence>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 space-y-4">
              {cart.map((item, index) => (
                <CartItem
                  key={item.id ?? item.product?.id ?? index}
                  item={item}
                  index={index}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* RIGHT: Summary */}
            <div>
              <CartSummary
                onCheckout={handleCheckout}
                isCheckingOut={isCheckingOut}
                appliedPromo={null}
              />
            </div>
          </div>
        </AnimatePresence>

        {/* Suggested Items */}
        <RecommendedItems />
      </div>
    </div>
  );
};

export default Cart;
