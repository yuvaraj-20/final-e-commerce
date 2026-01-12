import { Clock, CreditCard, AlertTriangle, RotateCcw } from "lucide-react";

const ICONS = {
  initiated: CreditCard,
  retry: AlertTriangle,
  webhook_paid: CreditCard,
  expired: AlertTriangle,
  refunded: RotateCcw,
};

export default function PaymentTimeline({ logs = [] }) {
  if (!logs.length) {
    return (
      <p className="text-sm text-gray-500">No payment activity yet.</p>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        Payment Timeline
      </h3>

      <ol className="space-y-4 border-l border-gray-200 pl-4">
        {logs.map((log, i) => {
          const Icon = ICONS[log.event] || Clock;

          return (
            <li key={i} className="relative">
              <span className="absolute -left-[22px] bg-white p-1 rounded-full border">
                <Icon className="h-4 w-4 text-indigo-600" />
              </span>

              <div className="text-sm">
                <p className="font-medium capitalize">
                  {log.event.replace("_", " ")}
                </p>
                <p className="text-xs text-gray-500">
                  {log.source} • {log.time}
                </p>

                {log.payload && (
                  <pre className="mt-1 text-xs text-gray-600 bg-gray-50 rounded p-2">
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
