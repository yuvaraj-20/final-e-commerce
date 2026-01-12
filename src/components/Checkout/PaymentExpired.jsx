import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PaymentExpired() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center"
      >
        <XCircle className="mx-auto h-14 w-14 text-red-400 mb-4" />

        <h1 className="text-xl font-semibold text-white mb-2">
          Payment Expired
        </h1>

        <p className="text-sm text-gray-400 mb-6">
          This payment session expired.
          <br />
          Please place the order again to continue.
        </p>

        <button
          onClick={() => navigate("/cart")}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition"
        >
          Go to Cart
        </button>
      </motion.div>
    </div>
  );
}
