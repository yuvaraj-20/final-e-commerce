import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Truck, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function Orders() {
  const location = useLocation();
  const navigate = useNavigate();

  // latest order comes from either navigation state or localStorage
  const [latestOrder, setLatestOrder] = useState(null);
  // orders list from API
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // load latestOrder from location.state or localStorage
  useEffect(() => {
    const stateOrder = location.state?.order || location.state; // compatible with various states
    if (stateOrder) {
      setLatestOrder(stateOrder);
      localStorage.setItem("latestOrder", JSON.stringify(stateOrder));
    } else {
      const saved = localStorage.getItem("latestOrder");
      if (saved) setLatestOrder(JSON.parse(saved));
    }
  }, [location.state]);

  // fetch user's orders (best-effort, backend must expose /api/orders)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Orders fetch failed:", err);
      toast.error("Could not load orders (falling back to latest order).");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearLatest = () => {
    localStorage.removeItem("latestOrder");
    setLatestOrder(null);
    toast.success("Cleared saved recent order");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {/* Latest Order Card */}
      {latestOrder ? (
        <div className="bg-white border rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-500">Latest Order</div>
              <div className="text-lg font-semibold mt-1">
                #{latestOrder.orderId ?? latestOrder.order_id ?? "—"}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Items: {latestOrder.items?.length ?? latestOrder.itemsCount ?? "—"}
              </div>
              <div className="text-sm text-gray-600">
                Total: {typeof latestOrder.totalAmount === "number" ? `₹${latestOrder.totalAmount.toFixed(2)}` : latestOrder.totalAmount ?? "—"}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(`/orders/${latestOrder.orderId ?? latestOrder.order_id ?? ""}`, { state: { order: latestOrder } })}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
              >
                <Truck className="w-4 h-4" /> Track
              </button>

              <button
                onClick={clearLatest}
                className="flex items-center gap-2 px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md mb-6 text-sm text-yellow-800">
          No recent order found. Place an order to see it here.
        </div>
      )}

      {/* Orders list header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">All Orders</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="text-sm text-gray-500">You have no past orders (or fetching failed).</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const id = o.orderId ?? o.order_id ?? o.id ?? "—";
            const total = o.total ?? o.amount ?? o.totalAmount;
            const itemsCount = o.items?.length ?? o.itemsCount ?? "—";
            return (
              <div key={id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Order #{id}</div>
                  <div className="font-medium">{itemsCount} items • ₹{typeof total === "number" ? total.toFixed(2) : total ?? "—"}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/orders/${id}`, { state: { order: o } })}
                    className="px-3 py-1 rounded-md border hover:bg-gray-50 transition text-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
