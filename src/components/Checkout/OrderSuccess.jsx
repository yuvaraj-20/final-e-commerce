import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Truck, Home } from "lucide-react";
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
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 px-6 py-12 text-gray-100">
      {/* 🎉 Confetti */}
      <Confetti width={width} height={height} numberOfPieces={150} recycle={false} />

      {/* ✅ Success Icon */}
      <motion.div
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        className="flex flex-col items-center justify-center mb-8"
      >
        <CheckCircle className="text-green-400 w-20 h-20 mb-4 drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white tracking-wide"
        >
          Order Confirmed 🎉
        </motion.h1>
        <p className="text-gray-400 mt-2 text-sm">Your order has been placed successfully.</p>
      </motion.div>

      {/* 🧾 Order Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Order ID:</span>
            <span className="font-medium text-gray-100">#{orderId || "123456"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Amount:</span>
            <span className="font-medium text-gray-100">
              ₹{totalAmount?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Estimated Delivery:</span>
            <span className="font-medium text-gray-100">3 - 5 Business Days</span>
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
            className="flex items-center justify-center gap-2 bg-amber-500 text-black w-full py-3 rounded-xl font-semibold hover:bg-amber-400 transition-all"
          >
            <Truck className="w-5 h-5" />
            Track My Order
          </button>

          <button
            onClick={() => navigate("/home")}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-800 text-gray-200 hover:bg-white/5 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </motion.div>
      </motion.div>

      {/* 🎯 Recommended Items Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-14 text-center"
      >
        <h2 className="text-xl font-semibold text-white mb-6">You Might Also Like</h2>
        <div className="flex flex-wrap justify-center gap-5">
          {["Hoodie", "T-Shirt", "Jogger"].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900 border border-gray-800 rounded-xl shadow-md p-4 w-40 cursor-pointer hover:shadow-lg transition-all"
            >
              <img
                src={`https://source.unsplash.com/160x160/?${item}`}
                alt={item}
                className="rounded-lg mb-3 w-full h-32 object-cover border border-gray-800"
              />
              <h3 className="text-gray-100 font-medium text-sm">{item}</h3>
              <p className="text-xs text-gray-400 mt-1">Explore more</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
