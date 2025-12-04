// src/components/checkout/Checkout.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { api } from "../../lib/apiClient";
import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import ReviewOrder from "./ReviewOrder";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    address: {},
    payment: {},
    items: [], // will be filled either from ReviewOrder or localStorage
  });

  const [savedAddress, setSavedAddress] = useState(null);
  const [useExisting, setUseExisting] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const navigate = useNavigate();

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // 🧭 Fetch logged-in user + default address (if any)
  useEffect(() => {
    const fetchUserAndAddress = async () => {
      try {
        const res = await api.get("/api/users/me");
        const user = res?.data?.user ?? res?.data ?? null;
        const addr = user?.default_address ?? res?.data?.default_address ?? null;

        if (user) setCurrentUser(user);
        if (addr) setSavedAddress(addr);
      } catch (err) {
        console.warn("[Checkout] no saved address / not logged in");
      }
    };
    fetchUserAndAddress();
  }, []);

  // ✨ handle partial updates from ReviewOrder
  const handleUpdate = (partial) => {
    setCheckoutData((prev) => ({ ...prev, ...partial }));
  };

  // 💥 Main Checkout submit → create Order (Laravel) → create Razorpay order → open Razorpay → verify
  const handleSubmit = async () => {
    if (isPlacingOrder) return;

    const toastId = toast.loading("Processing your order...");

    try {
      // 1) Get items (priority: checkoutData.items → guestCart → latestCart)
      let fallbackGuest = [];
      let fallbackLatest = [];

      try {
        fallbackGuest = JSON.parse(localStorage.getItem("guestCart") || "[]") || [];
      } catch (e) {}
      try {
        fallbackLatest = JSON.parse(localStorage.getItem("latestCart") || "[]") || [];
      } catch (e) {}

      const payloadItemsSource =
        (Array.isArray(checkoutData.items) && checkoutData.items.length > 0
          ? checkoutData.items
          : fallbackGuest.length > 0
          ? fallbackGuest
          : fallbackLatest) || [];

      if (!payloadItemsSource || payloadItemsSource.length === 0) {
        toast.dismiss(toastId);
        toast.error("Your cart is empty.");
        return;
      }

      // 2) Address
      const finalAddress =
        useExisting && savedAddress ? savedAddress : checkoutData.address;

      if (!finalAddress) {
        toast.dismiss(toastId);
        toast.error("Please provide a shipping address.");
        return;
      }

      // 🧭 Geo routing needs lat/lng – fallback to Chennai if missing (TEMP)
      const shippingLat = finalAddress.lat ?? 13.0827;
      const shippingLng = finalAddress.lng ?? 80.2707;

      // 3) Normalize items shape for backend (meta.items)
      const items = payloadItemsSource.map((item) => ({
        product_id: item.product_id ?? item.id,
        name: item.name,
        qty: item.qty ?? item.quantity ?? 1,
        price: item.price,
        variation: item.variation ?? null,
        custom: item.customization ?? null,
      }));

      // 4) Compute subtotal on frontend
      const subtotal = items.reduce(
        (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1),
        0
      );

      // 5) Build shipping object
      const fullName =
        finalAddress?.name ||
        (`${finalAddress?.firstName || ""} ${finalAddress?.lastName || ""}`.trim() ||
          "Customer");

      const phone = finalAddress?.phone || finalAddress?.mobile || "";

      const fullAddress =
        finalAddress?.address ||
        finalAddress?.line1 ||
        `${finalAddress?.street || ""} ${finalAddress?.city || ""} ${
          finalAddress?.pincode || finalAddress?.zip || ""
        }`.trim();

      const userId = currentUser?.id ?? 1; // TEMP fallback, replace when auth is wired fully
      const storeType = "normal"; // later: use actual active store type

      const orderPayload = {
        user_id: userId,
        store_type: storeType,
        subtotal,
        shipping: {
          name: fullName,
          phone,
          address: fullAddress,
          lat: shippingLat,
          lng: shippingLng,
        },
        meta: { items },
      };

      console.log("[Checkout] submitting order payload:", orderPayload);

      setIsPlacingOrder(true);

      // 6) Create order in Laravel (FulfillmentService + geo routing)
      const orderRes = await api.post("/api/orders", orderPayload);
      const orderBody = orderRes?.data || {};
      const orderSuccess = orderBody.success ?? false;
      const order = orderBody.data ?? orderBody.order ?? null;

      if (!orderSuccess || !order) {
        console.error("[Checkout] order API error:", orderBody);
        toast.dismiss(toastId);
        toast.error("Failed to create order. Please try again.");
        setIsPlacingOrder(false);
        return;
      }

      const amount = order.total ?? subtotal;

      // 7) Ask backend to create Razorpay order
      const razorRes = await api.post("/api/payments/razorpay/create", {
        order_id: order.id,
        amount,
      });

      const razorData = razorRes?.data?.data ?? {};
      const razorpayKey = razorData.razorpay_key;
      const razorpayOrder = razorData.razorpay_order;

      if (!razorpayKey || !razorpayOrder) {
        console.error("[Checkout] invalid Razorpay response:", razorRes?.data);
        toast.dismiss(toastId);
        toast.error("Unable to initiate payment. Please try again.");
        setIsPlacingOrder(false);
        return;
      }

      // 8) Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.dismiss(toastId);
        toast.error("Failed to load Razorpay. Check your network and try again.");
        setIsPlacingOrder(false);
        return;
      }

      toast.dismiss(toastId);

      // 9) Open Razorpay checkout
      const rzpOptions = {
        key: razorpayKey,
        amount: razorpayOrder.amount, // in paise
        currency: razorpayOrder.currency || "INR",
        name: "MonoFit Commerce",
        description: `Payment for Order #${order.id}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: fullName,
          email: currentUser?.email || "",
          contact: phone || "",
        },
        notes: {
          order_id: order.id,
          platform: "mono-fit-ecommerce",
        },
        theme: {
          color: "#6366f1",
        },
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/api/payments/razorpay/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verifyBody = verifyRes?.data || {};

            if (!verifyBody.success) {
              toast.error("Payment verification failed.");
              console.error("[Checkout] verify error:", verifyBody);
              setIsPlacingOrder(false);
              return;
            }

            toast.success("Payment successful! 🎉");

            const orderInfo = {
              orderId: order.id,
              totalAmount: amount,
              items,
              raw: order,
            };

            try {
              localStorage.setItem("latestOrder", JSON.stringify(orderInfo));
            } catch (e) {
              console.warn("[Checkout] failed to write latestOrder:", e);
            }

            setIsPlacingOrder(false);
            navigate("/checkout/success", { state: orderInfo });
          } catch (err) {
            console.error("[Checkout] verify error:", err);
            toast.error("Payment verification failed. Please contact support.");
            setIsPlacingOrder(false);
          }
        },
      };

      const rzp = new window.Razorpay(rzpOptions);

      rzp.on("payment.failed", function (res) {
        console.error("[Checkout] payment.failed event:", res);
        toast.error("Payment failed. Please try again.");
        setIsPlacingOrder(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      toast.dismiss(toastId);
      toast.error("Checkout failed! Please try again.");
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Steps header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm text-gray-400">
            Step {step} of 3 —{" "}
            {step === 1 ? "Shipping" : step === 2 ? "Payment" : "Review"}
          </h3>

          {isPlacingOrder && (
            <span className="text-xs text-indigo-400 animate-pulse">
              Processing your order & payment...
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="address"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                  Shipping Address
                </h2>

                {savedAddress && (
                  <div className="mb-6 bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-100 mb-3">
                      Choose Address Option
                    </h3>
                    <div className="space-y-2 text-gray-300">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={useExisting}
                          onChange={() => setUseExisting(true)}
                        />
                        <span>Use existing address</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={!useExisting}
                          onChange={() => setUseExisting(false)}
                        />
                        <span>Add new address</span>
                      </label>
                    </div>

                    {useExisting && (
                      <div className="mt-4 p-3 border border-gray-700 rounded-lg bg-gray-900 text-gray-300">
                        <p className="font-medium text-gray-100">
                          {savedAddress.name}
                        </p>
                        <p>
                          {savedAddress.line1}, {savedAddress.city}
                        </p>
                        <p>{savedAddress.pincode}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {savedAddress.phone}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* New address form if no saved OR they picked "add new" */}
                {(!savedAddress || !useExisting) && (
                  <AddressForm
                    onNext={(data) => {
                      setCheckoutData((prev) => ({ ...prev, address: data }));
                      nextStep();
                    }}
                  />
                )}

                {useExisting && savedAddress && (
                  <button
                    onClick={nextStep}
                    className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition"
                  >
                    Continue with Existing Address
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                  Payment Details
                </h2>
                <PaymentForm
                  onNext={(data) => {
                    setCheckoutData((prev) => ({ ...prev, payment: data }));
                    nextStep();
                  }}
                  onBack={prevStep}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                  Review Your Order
                </h2>
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
