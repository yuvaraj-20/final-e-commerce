// src/components/hub/HandoverScreen.jsx
import React, { useState } from "react";
import { DispatchAPI } from "../../api";

export default function HandoverScreen({ orderId, onDone }) {
  const [token, setToken] = useState("");
  const [riderId, setRiderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const handover = async () => {
    setLoading(true); setErr(null);
    try {
      await DispatchAPI.handoverOrder(orderId, { delivery_token: token, rider_id: riderId });
      onDone && onDone();
    } catch (e) {
      setErr(e?.data?.message || e?.message || "handover failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
      <h4>Confirm Handover</h4>
      <div style={{ marginTop: 8 }}>
        <label>Delivery token (OTP)</label>
        <input value={token} onChange={(e) => setToken(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 6 }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Rider ID</label>
        <input value={riderId} onChange={(e) => setRiderId(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 6 }} />
      </div>

      {err && <div style={{ color: "#b91c1c", marginTop: 8 }}>{err}</div>}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button className="btn" onClick={handover} disabled={loading}>{loading ? "Working..." : "Confirm Handover"}</button>
        <button onClick={() => onDone && onDone()} style={{ background: "#ef4444", color: "#fff", borderRadius: 8, padding: "8px 12px" }}>Cancel</button>
      </div>
    </div>
  );
}
