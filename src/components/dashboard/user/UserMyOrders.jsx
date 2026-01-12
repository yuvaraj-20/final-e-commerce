// src/components/dashboard/user/UserMyOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { api } from "../../../services/api";
import { useStore } from "../../../store/useStore";

/* ---------------- Payment Pending Helpers ---------------- */

const isPaymentPending = (order) => {
  const paymentStatus = (order.payment_status || "").toLowerCase();
  const paymentMethod = (order.payment_method || "").toLowerCase();

  return (
    paymentMethod !== "cod" &&
    (paymentStatus === "pending" ||
      paymentStatus === "initiated" ||
      paymentStatus === "verification_pending")
  );
};

const PendingPaymentBanner = ({ order, onResume }) => {
  return (
    <div className="mb-3 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />

        <div className="flex-1">
          <p className="text-sm font-semibold text-yellow-800">
            Payment Pending
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            We couldn’t confirm your payment yet. If money was deducted, it will
            be updated shortly or refunded.
          </p>

          <button
            onClick={onResume}
            className="mt-3 inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition"
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Status Config ---------------- */

const statusOptions = [
  { id: "all", label: "All Orders" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const statusStyles = {
  processing: "bg-amber-50 text-amber-700 border border-amber-100",
  shipped: "bg-blue-50 text-blue-700 border border-blue-100",
  delivered: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  cancelled: "bg-rose-50 text-rose-700 border border-rose-100",
};

const statusIcon = (status) => {
  switch (status) {
    case "processing":
      return <Clock className="h-4 w-4" />;
    case "shipped":
      return <Truck className="h-4 w-4" />;
    case "delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

/* ---------------- Formatters ---------------- */

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (value) => {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch {
    return `₹${value}`;
  }
};

/* ---------------- Component ---------------- */

const UserMyOrders = () => {
  const { user, orders, setOrders } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const data = await api.getOrders(user.id);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user, setOrders]);

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    if (selectedStatus === "all") return orders;
    return orders.filter(
      (o) => (o.status || "").toLowerCase() === selectedStatus.toLowerCase()
    );
  }, [orders, selectedStatus]);

  /* ---------------- UI States ---------------- */

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center pt-16 pb-24">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="text-base md:text-lg font-semibold text-gray-900">
        No orders found
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        You haven&apos;t placed any orders yet.
      </p>
      <button
        onClick={() => navigate("/products")}
        className="mt-6 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition"
      >
        Start Shopping
      </button>
    </div>
  );

  const renderSkeleton = () => (
    <div className="mt-6 space-y-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-xl border border-gray-100 bg-white px-4 py-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
          <div className="h-3 w-48 bg-gray-100 rounded mb-2" />
          <div className="h-3 w-40 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );

  const renderOrders = () => (
    <div className="mt-6 space-y-4">
      {filteredOrders.map((order, idx) => {
        const status = (order.status || "processing").toLowerCase();
        const items = order.items || order.order_items || [];
        const firstItem = items[0];
        const itemCount = items.length;

        return (
          <motion.div
            key={order.id || idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
            className="rounded-xl border border-gray-100 bg-white px-4 py-4 sm:px-5 sm:py-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {isPaymentPending(order) && (
              <PendingPaymentBanner
                order={order}
                onResume={() =>
                  navigate(`/checkout/pending/${order.id}`)
                }
              />
            )}

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order
                  </span>
                  <span className="text-sm font-mono text-gray-900">
                    #{order.id ?? order.order_number ?? "—"}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  Placed on{" "}
                  <span className="font-medium">
                    {formatDate(order.created_at || order.date)}
                  </span>
                </p>

                {firstItem && (
                  <p className="text-sm text-gray-700 line-clamp-1">
                    {firstItem.name ||
                      firstItem.product_name ||
                      "Fashion item"}
                    {itemCount > 1 && (
                      <span className="text-gray-500">
                        {" "}
                        + {itemCount - 1} more item
                        {itemCount - 1 > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <div
                  className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                    statusStyles[status] ||
                    "bg-gray-50 text-gray-700 border border-gray-100"
                  }`}
                >
                  {statusIcon(status)}
                  <span className="capitalize">{status}</span>
                </div>

                <p className="text-sm text-gray-600">
                  Total{" "}
                  <span className="font-semibold text-gray-900">
                    {formatPrice(order.total || order.total_amount)}
                  </span>
                </p>

                <button
                  onClick={() =>
                    navigate(`/order/${order.id ?? order.order_number}`)
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <Eye className="h-4 w-4" />
                  View details
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <section className="w-full px-6 md:px-10 pt-6 pb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900">
            My Orders
          </h2>
          <p className="text-xs md:text-sm text-gray-600">
            Track and manage your fashion orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-xs text-gray-500">
            Filter
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs md:text-sm border border-gray-200 rounded-full px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading
        ? renderSkeleton()
        : filteredOrders.length === 0
        ? renderEmpty()
        : renderOrders()}
    </section>
  );
};

export default UserMyOrders;
