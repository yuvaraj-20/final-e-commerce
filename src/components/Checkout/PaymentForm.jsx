import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function PaymentForm({ onNext, onBack }) {
  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleChange = (e) =>
    setPayment({ ...payment, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(payment);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4">Payment Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <input
          name="cardName"
          value={payment.cardName}
          onChange={handleChange}
          placeholder="Name on Card"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 col-span-2"
          required
        />
        <input
          name="cardNumber"
          value={payment.cardNumber}
          onChange={handleChange}
          placeholder="Card Number"
          maxLength={16}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 col-span-2"
          required
        />
        <input
          name="expiry"
          value={payment.expiry}
          onChange={handleChange}
          placeholder="MM/YY"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          name="cvv"
          value={payment.cvv}
          onChange={handleChange}
          placeholder="CVV"
          maxLength={3}
          className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          className="bg-gray-200 text-black px-6 py-3"
          onClick={onBack}
        >
          Back
        </Button>
        <Button type="submit" className="bg-indigo-600 text-white px-6 py-3">
          Review Order
        </Button>
      </div>
    </motion.form>
  );
}
