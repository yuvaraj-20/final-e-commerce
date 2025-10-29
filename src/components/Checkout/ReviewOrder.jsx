import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function ReviewOrder({ data, onBack, onSubmit }) {
  const { address, payment } = data;

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4">Review Your Order</h2>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Shipping Address</h3>
        <p>{address.fullName}</p>
        <p>{address.street}</p>
        <p>
          {address.city}, {address.state} - {address.pincode}
        </p>
        <p>📞 {address.phone}</p>
      </div>

      <div className="border-t border-gray-300 pt-4 space-y-2">
        <h3 className="font-semibold text-lg">Payment</h3>
        <p>
          💳 **** **** **** {payment.cardNumber.slice(-4)} (
          {payment.cardName})
        </p>
        <p>Expiry: {payment.expiry}</p>
      </div>

      <motion.div
        className="flex justify-between mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={onBack}
          className="bg-gray-200 text-black px-6 py-3"
        >
          Back
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-green-600 text-white px-6 py-3 hover:bg-green-700"
        >
          Place Order
        </Button>
      </motion.div>
    </motion.div>
  );
}
