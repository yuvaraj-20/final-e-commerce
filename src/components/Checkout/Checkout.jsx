import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { api } from "../../lib/apiClient";
import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import ReviewOrder from "./ReviewOrder";

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    address: {},
    payment: {},
  });

  const [savedAddress, setSavedAddress] = useState(null);
  const [useExisting, setUseExisting] = useState(true);
  const navigate = useNavigate();

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // 🧭 Fetch saved address if logged in
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await api.get("/api/users/me");
        const addr = res?.data?.default_address;
        if (addr) {
          setSavedAddress(addr);
        }
      } catch (err) {
        console.warn("[Checkout] no saved address found");
      }
    };
    fetchAddress();
  }, []);

  // ✨ handle update from ReviewOrder
  const handleUpdate = (partial) => {
    setCheckoutData((prev) => ({ ...prev, ...partial }));
  };

  // 💥 Submit order
  const handleSubmit = async () => {
    toast.loading("Processing your order...");

    try {
      const fallbackItems =
        JSON.parse(localStorage.getItem("guestCart") || "[]") ||
        JSON.parse(localStorage.getItem("latestCart") || "[]") ||
        [];

      const finalAddress = useExisting && savedAddress ? savedAddress : checkoutData.address;

      const payload = {
        ...checkoutData,
        address: finalAddress,
        items:
          Array.isArray(checkoutData.items) && checkoutData.items.length > 0
            ? checkoutData.items
            : fallbackItems,
      };

      console.log("[Checkout] submitting payload:", payload);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      toast.dismiss();
      toast.success("Order placed successfully!");

      // 🧠 If used a new address, update user's saved address
      if (!useExisting) {
        try {
          await api.post("/api/users/update-address", finalAddress);
        } catch (err) {
          console.warn("[Checkout] address update failed:", err);
        }
      }

      const orderInfo = {
        orderId: data?.orderId ?? data?.id ?? "123456",
        totalAmount:
          data?.totalAmount ??
          data?.total ??
          payload?.totalAmount ??
          payload?.total ??
          0,
        items: data?.items ?? payload.items ?? [],
      };

      localStorage.setItem("latestOrder", JSON.stringify(orderInfo));
      navigate("/checkout/success", { state: orderInfo });
    } catch (err) {
      toast.dismiss();
      toast.error("Checkout failed!");
      console.error("Checkout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Steps header */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-400">
            Step {step} of 3 — {step === 1 ? "Shipping" : step === 2 ? "Payment" : "Review"}
          </h3>
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

                {/* ✅ Address selection logic */}
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
                        <p className="font-medium text-gray-100">{savedAddress.name}</p>
                        <p>{savedAddress.line1}, {savedAddress.city}</p>
                        <p>{savedAddress.pincode}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {savedAddress.phone}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 📝 Address form appears only if “new” selected or no saved address */}
                {!useExisting && (
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
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
