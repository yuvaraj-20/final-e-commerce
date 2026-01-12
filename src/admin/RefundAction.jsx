import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../lib/apiClient";

export default function RefundAction({ orderId, paymentStatus, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  if (paymentStatus !== "paid") return null;

  const handleRefund = async () => {
    if (!reason.trim()) {
      toast.error("Refund reason required");
      return;
    }

    if (!confirm("Are you sure you want to refund this payment?")) return;

    setLoading(true);

    try {
      await api.post(`/api/admin/orders/${orderId}/refund`, { reason });
      toast.success("Refund initiated");
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Refund failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
      <h3 className="text-sm font-semibold text-red-800 mb-2">
        Refund Payment
      </h3>

      <input
        type="text"
        placeholder="Refund reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full mb-3 rounded border px-3 py-2 text-sm"
      />

      <button
        disabled={loading}
        onClick={handleRefund}
        className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? "Processing..." : "Initiate Refund"}
      </button>
    </div>
  );
}
