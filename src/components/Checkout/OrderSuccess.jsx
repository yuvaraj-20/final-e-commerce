import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Truck, Home, ArrowRight } from "lucide-react";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "react-use";

export default function OrderSuccess({ orderId, totalAmount }) {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-100 px-6 py-10">
      {/* 🎉 Confetti */}
      <Confetti width={width} height={height} numberOfPieces={150} recycle={false} />

      {/* ✅ Success Icon */}
      <motion.div
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="flex flex-col items-center justify-center mb-6"
      >
        <CheckCircle className="text-green-500 w-20 h-20 mb-4" />
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-800"
        >
          Order Confirmed 🎉
        </motion.h1>
      </motion.div>

      {/* ✅ Order Details */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100"
      >
        <p className="text-gray-600 mb-3">
          Thank you for shopping with us. Your order has been placed successfully!
        </p>

        <div className="text-left mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID:</span>
            <span className="font-medium text-gray-800">#{orderId || "123456"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Amount:</span>
            <span className="font-medium text-gray-800">₹{totalAmount?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estimated Delivery:</span>
            <span className="font-medium text-gray-800">3 - 5 Business Days</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-3"
        >
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center justify-center gap-2 bg-black text-white w-full py-3 rounded-xl font-medium hover:bg-gray-800 transition-all"
          >
            <Truck className="w-5 h-5" />
            Track My Order
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </motion.div>
      </motion.div>

      {/* 🎯 Next Suggestion Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center"
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4">You might also like</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {["Hoodie", "T-Shirt", "Jogger"].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-4 w-40 cursor-pointer hover:shadow-md"
            >
              <img
                src={`https://source.unsplash.com/160x160/?${item}`}
                alt={item}
                className="rounded-lg mb-3 w-full h-32 object-cover"
              />
              <h3 className="text-gray-700 font-medium text-sm">{item}</h3>
              <div className="text-xs text-gray-500">Explore more</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
