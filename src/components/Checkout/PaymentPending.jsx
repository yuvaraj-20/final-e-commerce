import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { getOrder } from "../../api/orders";
import { PAYMENT_STATUS } from "../../constants/orderStatus";

export default function PaymentPending() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("checking");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await getOrder(orderId);
        const order = res?.data?.data ?? res?.data ?? null;

        if (!order) return;

        if (order.payment_status === PAYMENT_STATUS.PAID) {
          clearInterval(interval);
          toast.success("Payment confirmed!");
          navigate("/checkout/success", {
            state: {
              orderId: order.id,
              totalAmount: order.total,
            },
          });
        }

        if (order.payment_status === PAYMENT_STATUS.FAILED) {
          clearInterval(interval);
          setStatus("failed");
        }
      } catch (err) {
        console.warn("Polling error", err);
      }

      setAttempts((a) => a + 1);
    }, 3000);

    // stop polling after ~30 seconds
    if (attempts > 10) {
      clearInterval(interval);
      setStatus("timeout");
    }

    return () => clearInterval(interval);
  }, [orderId, attempts, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center"
      >
        {status === "checking" && (
          <>
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">
              Confirming your payment
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              Please don’t close this page.  
              We’re verifying your transaction.
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">
              Payment failed
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              The payment could not be confirmed.
            </p>

            <button
              onClick={() => navigate(`/checkout`)}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold"
            >
              Retry Payment
            </button>
          </>
        )}

        {status === "timeout" && (
          <>
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">
              Still verifying…
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              If money was deducted, it will be updated shortly or refunded.
            </p>

            <button
              onClick={() => navigate("/orders")}
              className="mt-6 w-full border border-gray-700 text-gray-200 py-3 rounded-xl hover:bg-gray-800"
            >
              Go to My Orders
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
