import React, { useEffect, useState } from "react";
import { DispatchAPI } from "../../api";

/**
 * Props:
 *  - open (bool)
 *  - orderId (number|string)
 *  - onClose() callback
 */
export default function HandoverOTPModal({ open, orderId, onClose }) {
  const [otp, setOtp] = useState("");
  const [riderId, setRiderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!open) {
      setOtp("");
      setRiderId("");
      setMsg(null);
    }
  }, [open]);

  const onConfirm = async () => {
    if (!orderId) return alert("No order selected");
    setLoading(true);
    setMsg(null);
    try {
      await DispatchAPI.handoverOrder(orderId, { delivery_token: otp, rider_id: riderId, handed_over_by: "hub_operator" });
      setMsg({ type: "success", text: "Handover confirmed" });
      // small delay then close
      setTimeout(() => { onClose && onClose(); }, 900);
    } catch (e) {
      setMsg({ type: "error", text: e?.data?.message || e?.message || "Failed to confirm handover" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Confirm Handover — Order #{orderId}</h3>
          <button className="text-slate-400" onClick={() => onClose && onClose()}>✕</button>
        </div>

        <div className="grid gap-3">
          <label className="text-sm text-slate-600">Delivery OTP</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP from rider" className="w-full border rounded-lg px-3 py-2" />

          <label className="text-sm text-slate-600">Rider ID (optional)</label>
          <input value={riderId} onChange={(e) => setRiderId(e.target.value)} placeholder="Rider identifier" className="w-full border rounded-lg px-3 py-2" />

          {msg && (
            <div className={`text-sm ${msg.type==="error" ? "text-red-600" : "text-emerald-600"}`}>
              {msg.text}
            </div>
          )}

          <div className="flex gap-3 mt-3">
            <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white" onClick={onConfirm} disabled={loading}>
              {loading ? "Confirming..." : "Confirm Handover"}
            </button>
            <button className="px-4 py-2 rounded-lg border" onClick={() => onClose && onClose()}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
