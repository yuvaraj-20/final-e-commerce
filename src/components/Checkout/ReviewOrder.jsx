// src/components/checkout/ReviewOrder.jsx
import React, { useEffect, useState } from "react";

export default function ReviewOrder({
  data,
  onBack,
  onSubmit,
  onUpdate,
  isPlacingOrder,
}) {
  const [items, setItems] = useState([]);
  const address = data.address || {};

  // Load items from parent or localStorage as fallback
  useEffect(() => {
    let sourceItems = [];

    if (Array.isArray(data.items) && data.items.length > 0) {
      sourceItems = data.items;
    } else {
      try {
        const guest = JSON.parse(localStorage.getItem("guestCart") || "[]") || [];
        const latest = JSON.parse(localStorage.getItem("latestCart") || "[]") || [];
        sourceItems = guest.length > 0 ? guest : latest;
      } catch (e) {
        sourceItems = [];
      }
    }

    setItems(sourceItems);

    if (onUpdate) {
      onUpdate({ items: sourceItems });
    }
  }, [data.items, onUpdate]);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || item.quantity || 1),
    0
  );

  const itemCount = items.reduce(
    (count, item) => count + Number(item.qty || item.quantity || 1),
    0
  );

  return (
    <div className="space-y-6">
      {/* Address Summary */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Shipping Address
        </h3>
        {address && Object.keys(address).length > 0 ? (
          <div className="text-gray-300 text-sm space-y-1">
            <p className="font-medium text-gray-100">
              {address.name ||
                `${address.firstName || ""} ${address.lastName || ""}`.trim()}
            </p>
            <p>{address.address || address.line1}</p>
            <p>
              {address.city} {address.pincode || address.zip}
            </p>
            {address.phone && (
              <p className="text-gray-400 text-xs mt-1">{address.phone}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            No address found. Go back and add shipping details.
          </p>
        )}
      </div>

      {/* Items Summary */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Items ({itemCount})
        </h3>
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">Your cart seems empty.</p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {items.map((item) => (
              <li
                key={item.id || item.product_id}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-100 text-sm font-medium">
                    {item.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Qty: {item.qty || item.quantity || 1}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-100 text-sm">
                    ₹{Number(item.price || 0).toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    ₹
                    {(
                      Number(item.price || 0) *
                      Number(item.qty || item.quantity || 1)
                    ).toFixed(2)}{" "}
                    total
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Price Summary */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Price Summary
        </h3>
        <div className="space-y-1 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Delivery (will be calculated)</span>
            <span>₹0.00</span>
          </div>
          <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between font-semibold text-gray-100">
            <span>Estimated Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg border border-gray-600 text-gray-200 text-sm hover:bg-gray-800 transition"
          disabled={isPlacingOrder}
        >
          Back
        </button>

        <button
          onClick={onSubmit}
          disabled={isPlacingOrder || items.length === 0}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
            isPlacingOrder || items.length === 0
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
          }`}
        >
          {isPlacingOrder ? "Processing..." : "Pay with Razorpay"}
        </button>
      </div>
    </div>
  );
}
