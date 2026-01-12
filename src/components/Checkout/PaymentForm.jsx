// src/components/checkout/PaymentForm.jsx
import React, { useState } from "react";
import { Smartphone, CreditCard, Globe, Banknote, Pocket } from "lucide-react";

export default function PaymentForm({ orderType, onNext, onBack }) {
  const [selectedMethod, setSelectedMethod] = useState("RAZORPAY");

  const allowCOD = orderType !== "custom";

  const options = [
    { key: "RAZORPAY", label: "Online Payment (UPI / Card / NetBanking)", icon: <Smartphone /> },
    ...(allowCOD ? [{ key: "COD", label: "Cash on Delivery", icon: <Banknote /> }] : []),
  ];

  return (
    <div className="space-y-6 text-gray-100">
      <h2 className="text-lg font-semibold">Choose payment method</h2>

      <div className="space-y-3">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSelectedMethod(opt.key)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
              selectedMethod === opt.key
                ? "border-indigo-500 bg-gray-800"
                : "border-gray-700 bg-gray-900"
            }`}
          >
            <div className="flex items-center gap-3">
              {opt.icon}
              <span>{opt.label}</span>
            </div>
            {selectedMethod === opt.key && (
              <div className="w-3 h-3 bg-indigo-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {!allowCOD && (
        <p className="text-sm text-yellow-400">
          Custom products require advance online payment.
        </p>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 bg-gray-800 py-3 rounded-xl">
          Back
        </button>
        <button
          onClick={() => onNext({ method: selectedMethod })}
          className="flex-1 bg-indigo-600 py-3 rounded-xl font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
