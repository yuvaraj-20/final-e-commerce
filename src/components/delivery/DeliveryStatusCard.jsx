// src/components/delivery/DeliveryStatusCard.jsx
import React from "react";

export default function DeliveryStatusCard({ order, location, onContactRider }) {
  const partner = order?.delivery_partner || "—";
  const eta = location?.eta ?? order?.eta_minutes ?? "—";
  return (
    <div style={{
      background: "#fff", padding: 12, borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, color: "#111", fontWeight: 700 }}>Status: <span style={{ color: "#065f46" }}>{order?.status}</span></div>
          <div style={{ marginTop: 6, fontSize: 13 }}>Partner: {partner}</div>
          <div style={{ marginTop: 6, fontSize: 13 }}>ETA: {eta} min</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>₹{order?.delivery_fee ?? "—"}</div>
          <button className="btn" style={{ marginTop: 8 }} onClick={() => onContactRider && onContactRider()}>
            Contact rider
          </button>
        </div>
      </div>

      {location?.rider_name && (
        <div style={{ marginTop: 10, fontSize: 13, color: "#374151" }}>
          Rider: <strong>{location.rider_name}</strong> {location.rider_phone ? `• ${location.rider_phone}` : ""}
        </div>
      )}
    </div>
  );
}
