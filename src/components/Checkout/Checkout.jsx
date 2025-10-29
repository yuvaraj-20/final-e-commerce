import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CheckoutSteps from "../components/checkout/CheckoutSteps";
import AddressForm from "../components/checkout/AddressForm";
import PaymentForm from "../components/checkout/PaymentForm";
import ReviewOrder from "../components/checkout/ReviewOrder";
import toast from "react-hot-toast";

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    address: {},
    payment: {},
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    toast.loading("Processing your order...");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutData),
      });
      const data = await res.json();
      toast.dismiss();
      toast.success("Order placed successfully!");
      console.log("Order:", data);
    } catch {
      toast.dismiss();
      toast.error("Checkout failed!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <CheckoutSteps step={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="address"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
          >
            <AddressForm
              onNext={(data) => {
                setCheckoutData({ ...checkoutData, address: data });
                nextStep();
              }}
            />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
          >
            <PaymentForm
              onNext={(data) => {
                setCheckoutData({ ...checkoutData, payment: data });
                nextStep();
              }}
              onBack={prevStep}
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
          >
            <ReviewOrder
              data={checkoutData}
              onBack={prevStep}
              onSubmit={handleSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
