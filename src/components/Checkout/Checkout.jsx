import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { api } from "../../lib/apiClient";
import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import ReviewOrder from "./ReviewOrder";

/* ---------------- Razorpay Loader ---------------- */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  /* ---------------- State ---------------- */
  const [step, setStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    address: {},
    payment: {},
    items: [],
  });

  const [savedAddress, setSavedAddress] = useState(null);
  const [useExisting, setUseExisting] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // 🔒 payment lock (prevents double submit + back abuse)
  const paymentLockRef = useRef(false);

  const navigate = useNavigate();

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  /* ---------------- Load User + Address ---------------- */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get("/api/users/me");
        const user = res?.data?.user ?? res?.data ?? null;
        if (user) {
          setCurrentUser(user);
          setSavedAddress(user.default_address || null);
        }
      } catch {
        // guest allowed
      }
    };
    loadUser();
  }, []);

  /* ---------------- Sync updates from Review ---------------- */
  const handleUpdate = (partial) => {
    setCheckoutData((prev) => ({ ...prev, ...partial }));
  };

  /* ---------------- Main Submit ---------------- */
  const handleSubmit = async () => {
    // 🔒 HARD IDEMPOTENCY GUARD
    if (paymentLockRef.current || isPlacingOrder) return;

    paymentLockRef.current = true;
    setIsPlacingOrder(true);

    const toastId = toast.loading("Processing your order...");

    try {
      /* -------- Resolve Items -------- */
      let items = [];

      if (checkoutData.items.length > 0) {
        items = checkoutData.items;
      } else {
        try {
          const guest = JSON.parse(localStorage.getItem("guestCart") || "[]");
          const latest = JSON.parse(localStorage.getItem("latestCart") || "[]");
          items = guest.length ? guest : latest;
        } catch {
          items = [];
        }
      }

      if (!items.length) throw new Error("Your cart is empty");

      /* -------- Resolve Address -------- */
      const finalAddress =
        useExisting && savedAddress ? savedAddress : checkoutData.address;

      if (!finalAddress || !Object.keys(finalAddress).length) {
        throw new Error("Shipping address missing");
      }

      /* -------- Detect Store Type -------- */
      const isCustom = items.some(
        (i) => i.customization || i.custom === true
      );
      const storeType = isCustom ? "custom" : "normal";

      /* -------- Payment Method -------- */
      const paymentMethod = checkoutData.payment?.method || "RAZORPAY";

      if (storeType === "custom" && paymentMethod === "COD") {
        throw new Error("Cash on Delivery not allowed for custom products");
      }

      /* -------- Create Order -------- */
      const orderRes = await api.post("/api/orders", {
        store_type: storeType,
        payment_method: paymentMethod,
        shipping: finalAddress,
        meta: { items },
      });

      const order = orderRes?.data?.data ?? orderRes?.data?.order;
      if (!order) throw new Error("Order creation failed");

      /* ---------------- COD FLOW ---------------- */
      if (paymentMethod === "COD") {
        toast.dismiss(toastId);
        toast.success("Order placed with Cash on Delivery");

        navigate("/checkout/success", {
          state: {
            orderId: order.id,
            totalAmount: order.total,
          },
        });
        return;
      }

      /* ---------------- RAZORPAY FLOW ---------------- */

      const razorRes = await api.post("/api/payments/razorpay/create", {
        order_id: order.id,
      });

      const razorData = razorRes?.data?.data;
      if (!razorData?.razorpay_key || !razorData?.razorpay_order) {
        throw new Error("Failed to initialize payment");
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay");

      toast.dismiss(toastId);

      // 🔒 LOCK BACK BUTTON DURING PAYMENT
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = () => {
        window.history.pushState(null, "", window.location.href);
      };

      const rzp = new window.Razorpay({
        key: razorData.razorpay_key,
        order_id: razorData.razorpay_order.id,
        amount: razorData.razorpay_order.amount,
        currency: "INR",
        name: "MonoFit Commerce",
        description: `Order #${order.id}`,
        prefill: {
          name: finalAddress.fullName || currentUser?.name || "",
          email: currentUser?.email || "",
          contact: finalAddress.phone || "",
        },
        notes: {
          order_id: order.id,
          store_type: storeType,
        },
        theme: { color: "#6366f1" },

        handler: async (response) => {
          try {
            await api.post("/api/payments/razorpay/verify", response);

            // 🔓 RELEASE LOCK
            window.onpopstate = null;

            toast.success("Payment successful");

            navigate("/checkout/success", {
              state: {
                orderId: order.id,
                totalAmount: order.total,
              },
            });
          } catch {
            window.onpopstate = null;
            navigate(`/checkout/pending/${order.id}`);
          }
        },
      });

      rzp.on("payment.failed", () => {
        window.onpopstate = null;
        navigate(`/checkout/pending/${order.id}`);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error(err.message || "Checkout failed");

      paymentLockRef.current = false;
      setIsPlacingOrder(false);
      window.onpopstate = null;
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm text-gray-400">
            Step {step} of 3 —{" "}
            {step === 1 ? "Shipping" : step === 2 ? "Payment" : "Review"}
          </h3>

          {isPlacingOrder && (
            <span className="text-xs text-indigo-400 animate-pulse">
              Processing...
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="address" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                {savedAddress && (
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-gray-300">
                      <input type="radio" checked={useExisting} onChange={() => setUseExisting(true)} />
                      Use saved address
                    </label>
                    <label className="flex items-center gap-2 text-gray-300 mt-2">
                      <input type="radio" checked={!useExisting} onChange={() => setUseExisting(false)} />
                      Add new address
                    </label>
                  </div>
                )}

                {(!savedAddress || !useExisting) && (
                  <AddressForm
                    onNext={(addr) => {
                      setCheckoutData((p) => ({ ...p, address: addr }));
                      nextStep();
                    }}
                  />
                )}

                {useExisting && savedAddress && (
                  <button
                    onClick={nextStep}
                    className="w-full bg-indigo-600 py-3 rounded-xl text-white font-semibold"
                  >
                    Continue
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="payment" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <PaymentForm
                  orderType={checkoutData.items.some((i) => i.customization) ? "custom" : "normal"}
                  onBack={prevStep}
                  onNext={(payment) => {
                    setCheckoutData((p) => ({ ...p, payment }));
                    nextStep();
                  }}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="review" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <ReviewOrder
                  data={checkoutData}
                  onBack={prevStep}
                  onSubmit={handleSubmit}
                  onUpdate={handleUpdate}
                  isPlacingOrder={isPlacingOrder}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
