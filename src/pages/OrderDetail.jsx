// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";

export default function OrderDetail() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Data may come from navigation state (faster)
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-semibold text-white">Order Details #{orderId}</h1>
      </div>

      {/* Order Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6"
      >
        {/* Order Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-2 flex items-center">
            <Package className="w-5 h-5 mr-2 text-gray-400" />
            Order Summary
          </h2>
          <p className="text-sm text-gray-400">
            Placed on{" "}
            <span className="text-gray-200">
              {new Date(order.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </p>
          <p className="text-sm text-gray-400">
            Status:{" "}
            <span
              className={`font-medium capitalize ${
                (order.status || "confirmed").toLowerCase() === "delivered"
                  ? "text-green-400"
                  : "text-amber-400"
              }`}
            >
              {order.status || "Confirmed"}
            </span>
          </p>
        </div>

        {/* Items List */}
        <div className="border-t border-b border-gray-800 py-4 space-y-4">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img
                  src={item.image || `https://source.unsplash.com/100x100/?${encodeURIComponent(item.name)}`}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-800"
                />
                <div>
                  <p className="font-medium text-gray-100">{item.name}</p>
                  <p className="text-sm text-gray-400">Qty: {item.quantity ?? 1}</p>
                </div>
              </div>
              <p className="font-semibold text-gray-100">₹{typeof item.price === "number" ? item.price.toFixed(2) : item.price}</p>
            </div>
          ))}

          {/* If no items */}
          {(!order.items || order.items.length === 0) && (
            <div className="py-6 text-center text-gray-400">No items listed for this order.</div>
          )}
        </div>

        {/* Address */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-2 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-400" />
              Delivery Address
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {order.address?.fullName ?? "—"}
              {order.address?.street ? `, ${order.address.street}` : ""}
              <br />
              {order.address?.city ? `${order.address.city}, ` : ""}
              {order.address?.state ? `${order.address.state} - ` : ""}
              {order.address?.zip ?? order.address?.pincode ?? ""}
            </p>
          </div>

          {/* Payment Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-2 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
              Payment Details
            </h2>
            <p className="text-gray-300 text-sm">Method: {order.payment?.method ?? "Card / UPI"}</p>
            <p className="text-gray-300 text-sm mt-1">
              Total Amount:{" "}
              <span className="font-medium text-gray-100">
                ₹{typeof order.totalAmount === "number" ? order.totalAmount.toFixed(2) : order.totalAmount ?? "0.00"}
              </span>
            </p>
            <p className="text-sm text-gray-400 mt-3">Transaction ID: <span className="text-gray-200">{order.transactionId ?? "—"}</span></p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <button
            onClick={() => navigate(`/orders/${orderId}/track`)}
            className="flex-1 px-4 py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition"
          >
            Track Shipment
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-800 text-gray-200 hover:bg-white/5 transition"
          >
            Back to Orders
          </button>

          <button
            onClick={() => {
              // copy order id
              try {
                navigator.clipboard.writeText(String(orderId));
                // small inline feedback
                // you can swap for toast if using react-hot-toast
                alert("Order ID copied to clipboard");
              } catch {
                alert("Copy failed — please copy manually");
              }
            }}
            className="px-4 py-3 rounded-lg bg-white/5 text-gray-200 hover:bg-white/10 transition"
          >
            Copy Order ID
          </button>
        </div>
      </motion.div>
    </div>
  );
}
