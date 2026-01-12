import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { api } from "../../lib/apiClient";

const ICONS = {
  initiated: Clock,
  retry: RotateCcw,
  paid: CheckCircle,
  webhook_paid: CheckCircle,
  failed: XCircle,
  expired: XCircle,
  refunded: RotateCcw,
};

export default function OrderPaymentTimeline({ orderId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/admin/orders/${orderId}/payment-timeline`)
      .then((res) => {
        setLogs(res.data.data.logs || []);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <p className="text-sm text-gray-400">Loading timeline…</p>;

  if (!logs.length)
    return <p className="text-sm text-gray-500">No payment activity yet.</p>;

  return (
    <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">
        Payment Timeline
      </h3>

      <ol className="space-y-3">
        {logs.map((log, idx) => {
          const Icon = ICONS[log.event] || Clock;

          return (
            <li key={idx} className="flex items-start gap-3">
              <Icon className="w-4 h-4 mt-1 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-200 capitalize">
                  {log.event.replace("_", " ")}
                </p>
                <p className="text-xs text-gray-500">
                  {log.source} • {log.time}
                </p>

                {log.payload && (
                  <pre className="mt-1 text-xs text-gray-400">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
