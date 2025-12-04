// src/components/delivery/RiderBadge.jsx
import React from "react";

export default function RiderBadge({ rider }) {
  if (!rider) return null;
  return (
    <div style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: 6, background: "#f8fafc", borderRadius: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: "#e6f6f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img alt="rider" src={rider.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40"} style={{ width: 30, height: 30, borderRadius: 999 }} />
      </div>
      <div style={{ fontSize: 13 }}>
        <div style={{ fontWeight: 700 }}>{rider.name}</div>
        <div style={{ color: "#6b7280", fontSize: 12 }}>{rider.eta ? `${rider.eta} min` : ""}</div>
      </div>
    </div>
  );
}
