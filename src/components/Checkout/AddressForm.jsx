// src/components/checkout/AddressForm.jsx
import React, { useState } from "react";

/**
 * Props:
 * - onNext(formData, assignResult)         // assignResult may be null if routing failed
 * - orderId (optional)                     // if provided, will use this order instead of creating one
 * - cartItems (optional)                   // used when creating an order if orderId not provided
 * - subtotal (optional)                    // used when creating an order
 */
export default function AddressForm({
  onNext,
  orderId: propOrderId = null,
  cartItems = [],
  subtotal = 0,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Helper: create an order if not provided
  async function createOrderIfNeeded() {
    if (propOrderId) return propOrderId;

    // Try localStorage first
    const cached = localStorage.getItem("currentOrderId");
    if (cached) return cached;

    // Minimal order creation payload. Adjust to your real shape if different.
    const payload = {
      items: cartItems,
      subtotal_amount: subtotal,
      // add more fields your backend expects (customer_id, shipping_method, etc.)
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(
        `Failed to create order (${res.status}) - ${txt || res.statusText}`
      );
    }
    const json = await res.json();
    if (!json?.id) {
      throw new Error("Order creation returned invalid response");
    }
    localStorage.setItem("currentOrderId", json.id);
    return json.id;
  }

  // Helper: send address to backend to geocode & save
  async function saveAddress(orderId, addressString) {
    const res = await fetch(`/api/orders/${orderId}/address`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ address: addressString }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(
        `Failed to save address (${res.status}) - ${txt || res.statusText}`
      );
    }
    return await res.json(); // expects { lat, lng, pincode } or similar
  }

  // Helper: trigger routing & assignment
  async function routeAndAssign(orderId) {
    const res = await fetch(`/api/route-and-assign/${orderId}`, {
      method: "POST",
      credentials: "include",
    });
    const txt = await res.text();
    let json = null;
    try {
      json = txt ? JSON.parse(txt) : null;
    } catch (e) {
      // non-json response
    }
    if (!res.ok) {
      throw new Error(
        `Routing failed (${res.status}) - ${json?.message || res.statusText || txt}`
      );
    }
    return json;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1) ensure order exists
      const orderId = await createOrderIfNeeded();

      // 2) build address string and save (geocode)
      const addressParts = [
        formData.addressLine1,
        formData.city,
        formData.state,
        formData.postalCode,
        formData.country,
      ]
        .filter(Boolean)
        .join(", ");
      await saveAddress(orderId, addressParts);

      // 3) trigger route & assign (this may return assigned_dealer_id or a retry message)
      const assignResult = await routeAndAssign(orderId);

      // 4) pass both formData and assignment result to parent
      if (typeof onNext === "function") {
        try {
          onNext(formData, assignResult);
        } catch (err) {
          // swallow parent errors but keep flow
          console.warn("onNext handler threw:", err);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {[
        { name: "fullName", label: "Full Name" },
        { name: "addressLine1", label: "Address Line" },
        { name: "city", label: "City" },
        { name: "state", label: "State" },
        { name: "postalCode", label: "Postal Code" },
        { name: "country", label: "Country" },
      ].map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-gray-300 text-sm mb-1 font-medium"
          >
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            disabled={loading}
          />
        </div>
      ))}

      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`mt-4 w-full ${
          loading ? "bg-gray-600" : "bg-indigo-600 hover:bg-indigo-500"
        } text-white font-semibold py-2 rounded-xl transition`}
      >
        {loading ? "Processing…" : "Continue to Payment"}
      </button>
    </form>
  );
}
