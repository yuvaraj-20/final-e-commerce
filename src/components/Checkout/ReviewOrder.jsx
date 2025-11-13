// src/components/checkout/Checkout.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AddressForm from "./AddressForm";
import PaymentForm from "./PaymentForm";
import ReviewOrder from "./ReviewOrder";

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    address: {},
    payment: {},
    // items will be injected by ReviewOrder via onUpdate or pulled from localStorage/store
  });

  const navigate = useNavigate();

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Called by ReviewOrder when it has final items ready
  const handleUpdate = (partial) => {
    setCheckoutData((prev) => ({ ...prev, ...partial }));
  };

  const handleSubmit = async () => {
    toast.loading("Processing your order...");
    try {
      // build payload with sensible fallbacks
      let fallbackItems = [];
      try {
        fallbackItems =
          JSON.parse(localStorage.getItem("guestCart") || "null") ??
          JSON.parse(localStorage.getItem("latestCart") || "null") ??
          [];
      } catch (e) {
        fallbackItems = [];
      }

      const payload = {
        ...checkoutData,
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

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        console.warn("[Checkout] response had no json body", e);
      }

      console.log("[Checkout] api response:", data);

      toast.dismiss();
      toast.success("Order placed successfully!");

      const orderInfo = {
        orderId: data?.orderId ?? data?.id ?? data?.order?.id ?? "123456",
        totalAmount:
          data?.totalAmount ??
          data?.total ??
          data?.order?.total ??
          payload?.totalAmount ??
          payload?.total ??
          0,
        items: data?.items ?? data?.order?.items ?? payload.items ?? [],
      };

      try {
        localStorage.setItem("latestOrder", JSON.stringify(orderInfo));
      } catch (e) {
        console.warn("[Checkout] failed to write latestOrder to localStorage", e);
      }

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
        {/* Steps: inline indicator */}
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
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">Shipping Address</h2>

                <AddressForm
                  onNext={(data) => {
                    setCheckoutData((prev) => ({ ...prev, address: data }));
                    nextStep();
                  }}
                />
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
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">Payment Details</h2>

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
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">Review Your Order</h2>

                <ReviewOrder
                  data={checkoutData}
                  onBack={prevStep}
                  onSubmit={handleSubmit}    // Checkout will perform the final POST
                  onUpdate={handleUpdate}    // ReviewOrder should call this with { items }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
