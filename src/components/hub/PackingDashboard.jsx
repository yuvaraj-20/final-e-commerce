import React, { useState } from "react";
import HubOrdersList from "./HubOrdersList";
import HandoverOTPModal from "./HandoverOTPModal";
import QRScanner from "./QRScanner";

/**
 * Props:
 *  - hubId
 */
export default function PackingDashboard({ hubId }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showHandover, setShowHandover] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Packing Dashboard</h1>
          <p className="text-sm text-gray-500">Hub #{hubId} • Live packing queue</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
            onClick={() => setShowScanner((s) => !s)}
          >
            {showScanner ? "Close Scanner" : "Open QR Scanner"}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
            onClick={() => { window.location.reload(); }}
          >
            Refresh
          </button>
        </div>
      </header>

      {showScanner && (
        <div className="mb-6">
          <QRScanner
            onDetected={(text) => {
              // parse scanned order id or token and open handover modal
              const orderId = String(text).match(/\d+/)?.[0];
              if (orderId) {
                setSelectedOrder(orderId);
                setShowHandover(true);
              } else {
                alert("Scanned value doesn't contain an order id: " + text);
              }
            }}
            width={420}
            height={300}
          />
        </div>
      )}

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4">
          <HubOrdersList
            hubId={hubId}
            onOpenHandover={(order) => {
              setSelectedOrder(order);
              setShowHandover(true);
            }}
          />
        </section>

        <aside className="bg-white rounded-xl shadow-sm p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-600">Quick Actions</h3>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  onClick={() => alert("Manual scan: enter order id in the modal")}
                >
                  Manual Handover (enter order id)
                </button>

                <button
                  className="w-full px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => window.open("/admin/hub/reports", "_blank")}
                >
                  Open Hub Reports
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-600">How to use</h4>
              <ol className="text-sm text-slate-500 mt-2 list-decimal list-inside space-y-1">
                <li>Accept/pack orders from the left list.</li>
                <li>Open QR scanner and scan rider OTP or order QR.</li>
                <li>Confirm handover using OTP or scanned token.</li>
              </ol>
            </div>
          </div>
        </aside>
      </main>

      <HandoverOTPModal
        open={showHandover}
        orderId={selectedOrder}
        onClose={() => { setShowHandover(false); setSelectedOrder(null); }}
      />
    </div>
  );
}
