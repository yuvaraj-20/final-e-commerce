// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { me, api } from "../lib/apiClient";
import CartSummary from "../components/cart/CartSummary";
import CartItem from "../components/cart/CartItem";
import PromoCode from "../components/cart/PromoCode";
import RecommendedItems from "../components/cart/RecommendedItems"; // <- import

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    setCart,
    removeFromCart,
    clearCart,
    loadGuestCart,
    mergeGuestCart,
  } = useStore();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false); // <- new

  useEffect(() => {
    const initCart = async () => {
      try {
        const user = await me();
        setIsLoggedIn(!!user?.id);

        const guestCart = loadGuestCart();

        if (guestCart.length > 0) {
          toast("Merging your guest cart...");
          await Promise.all(
            guestCart.map((item) =>
              api.post("/api/cart/items", {
                product_id: item.product?.id,
                quantity: item.quantity,
              })
            )
          );
          localStorage.removeItem("guestCart");
        }

        const { data } = await api.get("/api/cart");
        setCart(data.items || []);
      } catch {
        const guestCart = loadGuestCart();
        setCart(guestCart);
      } finally {
        setLoading(false);
      }
    };

    initCart();
  }, [setCart, loadGuestCart]);

  const handleRemove = async (id) => {
    try {
      if (isLoggedIn) {
        await api.delete(`/api/cart/items/${id}`);
        const { data } = await api.get("/api/cart");
        setCart(data.items || []);
      } else {
        const updated = cart.filter((item) => item.id !== id);
        localStorage.setItem("guestCart", JSON.stringify(updated));
        setCart(updated);
      }
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.product?.price || 0) * (item.quantity || 1),
    0
  );

  // Checkout handler now sets isCheckingOut while routing
  const handleCheckout = () => {
    setIsCheckingOut(true);

    if (!isLoggedIn) {
      toast("Please log in to continue checkout");
      // next param helps return to cart after login
      navigate("/login?next=/cart");
      setIsCheckingOut(false); // reset because user will be navigated to login
      return;
    }

    // If logged in - navigate to checkout
    navigate("/checkout");
    // no need to immediately set false, because we're navigating away.
    // If you want a spinner before navigation while you call an API, keep it true until that finishes.
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading cart...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>

        <AnimatePresence>
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-6">Your cart is empty</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/")}
                className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-purple-700 transition"
              >
                Continue Shopping
              </motion.button>
            </motion.div>
          ) : (
            // TWO-COLUMN LAYOUT: left = cart items, right = CartSummary
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT: items list (span 2 on large screens) */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="flex items-center justify-between border-b border-gray-200 py-4 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product?.image || "/placeholder.png"}
                        alt={item.product?.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.product?.title}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {item.store || "Main Store"} — {item.size || "M"}
                        </p>
                        <p className="text-purple-600 font-medium">
                          ${item.product?.price} × {item.quantity}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* RIGHT: summary panel (CartSummary) */}
              <div>
                <CartSummary
                  onCheckout={handleCheckout}      // <- wired here
                  isCheckingOut={isCheckingOut}    // <- spinner state
                  appliedPromo={null}              // pass promo if you have one
                />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Cart;
