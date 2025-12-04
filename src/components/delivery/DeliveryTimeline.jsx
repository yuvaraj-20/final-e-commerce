// src/components/delivery/DeliveryTimeline.jsx
import React from "react";

const steps = [
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKING", label: "Packing" },
  { key: "READY_FOR_PICKUP", label: "Ready" },
  { key: "RIDER_ASSIGNED", label: "Rider Assigned" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function DeliveryTimeline({ status = "PENDING", timestamps = {} }) {
  const idx = steps.findIndex((s) => s.key === status);
  return (
    <div className="delivery-timeline" style={{ display: "flex", gap: 12, alignItems: "center", padding: 12 }}>
      {steps.map((s, i) => {
        const active = i <= idx;
        return (
          <div key={s.key} style={{ textAlign: "center", width: 110 }}>
            <div style={{
              height: 34,
              width: 34,
              borderRadius: 999,
              background: active ? "#059669" : "#e6e6e6",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700
            }}>
              {i+1}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: active ? "#064e3b" : "#6b7280" }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
              {(i === 0 && timestamps.confirmed_at) ||
               (i === 1 && timestamps.packed_at) ||
               (i === 2 && timestamps.ready_at) ||
               (i === 3 && timestamps.assigned_at) ||
               (i === 4 && timestamps.picked_at) ||
               (i === 5 && timestamps.delivered_at) || ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}
