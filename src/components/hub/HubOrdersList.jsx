// src/components/hub/HubOrdersList.jsx
import React, { useEffect, useState } from "react";
import { DispatchAPI } from "../../api";

export default function HubOrdersList({ hubId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setErr(null);

    try {
      const res = await DispatchAPI.getHubOrders(hubId, { status: "PACKING" });

      // Backend may return array OR { data: [...] }
      const list = Array.isArray(res) ? res : res.data;

      setOrders(list || []);
    } catch (e) {
      console.error(e);
      setErr(e?.data?.message || e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 8000); // auto-refresh every 8s
    return () => clearInterval(interval);
  }, [hubId]);

  const handlePacked = async (orderId) => {
    try {
      await DispatchAPI.markPacked(orderId, { packed_by: "operator" });
      loadOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to mark packed");
    }
  };

  const handleOtp = async (orderId) => {
    try {
      await DispatchAPI.generateHandoverOtp(orderId);
      loadOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to generate OTP");
    }
  };

  return (
    <div>
      <h3 style={{ marginBottom: 12 }}>Packing Queue</h3>

      {loading && <div>Loading…</div>}
      {err && <div style={{ color: "#b91c1c", marginBottom: 8 }}>{err}</div>}
      {!loading && !orders.length && <div>No orders waiting for packing.</div>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {orders.map((o) => (
          <li
            key={o.id}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div>
                  <strong>Order #{o.id}</strong> • {o.status}
                </div>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                  {o.items?.length} items • {o.shipping_address}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn"
                  onClick={() => handlePacked(o.id)}
                >
                  Mark Packed
                </button>

                <button
                  style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "none",
                  }}
                  onClick={() => handleOtp(o.id)}
                >
                  OTP
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
