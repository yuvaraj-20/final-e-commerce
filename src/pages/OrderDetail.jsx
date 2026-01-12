// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import OrderPaymentSection from "../../components/orders/OrderPaymentSection";
import { api } from "../../lib/apiClient";
import { PAYMENT_STATUS } from "../../constants/orderStatus";

export default function OrderDetail() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [user, setUser] = useState(null);

  /* ---------------- Load user (for payment retry) ---------------- */
  useEffect(() => {
    api
      .get("/api/users/me")
      .then((res) => setUser(res?.data?.user || res?.data || null))
      .catch(() => {});
  }, []);

  /* ---------------- Fetch order ---------------- */
  useEffect(() => {
    if (!order) fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      setOrder(res?.data?.data || null);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- AUTO POLL PAYMENT STATUS ---------------- */
  useEffect(() => {
    if (!order) return;
    if (order.payment_status !== PAYMENT_STATUS.PENDING) return;

    const startedAt = Date.now();

    const timer = setInterval(async () => {
      // stop after 3 mins
      if (Date.now() - startedAt > 3 * 60 * 1000) {
        clearInterval(timer);
        return;
      }

      try {
        const res = await api.get(`/api/orders/${orderId}`);
        const updated = res?.data?.data;
        if (!updated) return;

        if (updated.payment_status !== PAYMENT_STATUS.PENDING) {
          setOrder(updated);
          clearInterval(timer);
        }
      } catch {}
    }, 5000);

    return () => clearInterval(timer);
  }, [order, orderId]);

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-300 px-6">
        <p className="mb-4">Order not found.</p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-2 px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 py-10 px-4 text-gray-100">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center text-gray-300 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Orders
        </button>
        <h1 className="text-2xl font-semibold text-white">
          Order Details #{orderId}
        </h1>
      </div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6"
      >
        {/* Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-2 flex items-center">
            <Package className="w-5 h-5 mr-2 text-gray-400" />
            Order Summary
          </h2>
          <p className="text-sm text-gray-400">
            Placed on{" "}
            <span className="text-gray-200">
              {new Date(order.created_at).toLocaleDateString()}
            </span>
          </p>
          <p className="text-sm text-gray-400">
            Status:{" "}
            <span className="font-medium capitalize text-amber-400">
              {order.status}
            </span>
          </p>
        </div>

        {/* 🔥 PAYMENT SECTION */}
        <OrderPaymentSection order={order} user={user} />

        {/* Items */}
        <div className="border-t border-b border-gray-800 py-4 space-y-4">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img
                  src={item.image || "https://via.placeholder.com/80"}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-800"
                />
                <div>
                  <p className="font-medium text-gray-100">{item.name}</p>
                  <p className="text-sm text-gray-400">
                    Qty: {item.quantity ?? 1}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-gray-100">₹{item.price}</p>
            </div>
          ))}
        </div>

        {/* Address + Payment */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-2 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-400" />
              Delivery Address
            </h2>
            <p className="text-gray-300 text-sm">{order.shipping_address}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-2 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
              Payment
            </h2>
            <p className="text-sm text-gray-300">
              Total: <span className="font-semibold">₹{order.total}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
