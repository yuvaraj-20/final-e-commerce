import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PendingPaymentBanner({ order }) {
  const navigate = useNavigate();

  if (!order) return null;

  const isPending =
    order.payment_status === "pending" ||
    order.payment_status === "initiated";

  if (!isPending) return null;

  return (
    <div className="border border-yellow-600/40 bg-yellow-900/20 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-300">
            Payment Pending
          </h4>
          <p className="text-xs text-yellow-200 mt-1">
            We haven’t confirmed your payment yet. If money was deducted, it will
            be updated shortly or refunded.
          </p>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() =>
                navigate(`/checkout/pending/${order.id}`)
              }
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
            >
              Complete Payment
            </button>

            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition"
            >
              View Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
