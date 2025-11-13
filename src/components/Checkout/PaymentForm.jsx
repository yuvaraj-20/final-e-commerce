import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Globe, Banknote, Pocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * PaymentForm
 * Props:
 *  - onNext(paymentObject)  -> called when payment step finishes (either COD or successful online payment)
 *  - onBack()               -> go back to previous step
 *
 * Note: Make sure you have a backend endpoint POST /create-order { amount } -> { order_id }
 * and env var REACT_APP_RAZORPAY_KEY set to your Razorpay key_id.
 */

export default function PaymentForm({ onNext, onBack, amount = 0, prefill = {} }) {
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    upiId: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    bank: "",
    wallet: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // load razorpay script
  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // create order on backend (server must create Razorpay order)
  const createOrderOnServer = async (amountINR) => {
    // ensure amount is in rupees (integer or float)
    const res = await fetch("/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(amountINR) }), // server will multiply by 100
      credentials: "include", // optional — if your server uses cookies
    });
    if (!res.ok) throw new Error("Failed to create order");
    return await res.json(); // expected { order_id: "order_..." }
  };

  // handle real payment via Razorpay
  const handleOnlinePayment = async () => {
    setLoading(true);
    toast.loading("Preparing payment...");
    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        toast.dismiss();
        toast.error("Unable to load payment SDK. Try again.");
        setLoading(false);
        return;
      }

      // create order on server
      const serverResp = await createOrderOnServer(amount);
      const orderId = serverResp?.order_id;
      if (!orderId) throw new Error("No order id from server");

      // build options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "YOUR_RAZORPAY_KEY_ID", // set in .env
        amount: Math.round(amount * 100), // paise
        currency: "INR",
        name: "CustomWear", // your store name
        description: "Order Payment",
        order_id: orderId,
        handler: function (response) {
          // success
          toast.dismiss();
          toast.success("Payment successful!");
          // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
          onNext({
            method: selectedMethod,
            provider: "razorpay",
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount,
          });
        },
        prefill: {
          name: prefill.name || "",
          email: prefill.email || "",
          contact: prefill.contact || "",
        },
        notes: {
          // optional extra metadata
          checkout_method: selectedMethod,
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        // payment failure
        toast.dismiss();
        toast.error("Payment failed. Please try another method.");
        console.error("Payment failed:", response.error);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.dismiss();
      toast.error("Payment initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  // called when user clicks Continue / Pay Now
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (selectedMethod === "COD") {
      // Cash on Delivery: skip gateway
      onNext({ method: "COD", amount });
      return;
    }

    // For Wallets you might redirect to wallet provider; we handle via Razorpay popup
    // For Card/UPI/NetBanking use Razorpay
    handleOnlinePayment();
  };

  const paymentOptions = [
    { value: "UPI", label: "UPI (GooglePay, PhonePe, Paytm)", icon: <Smartphone className="w-5 h-5" /> },
    { value: "Card", label: "Debit / Credit Card", icon: <CreditCard className="w-5 h-5" /> },
    { value: "NetBanking", label: "Net Banking", icon: <Globe className="w-5 h-5" /> },
    { value: "Wallet", label: "Wallets (Paytm, Amazon Pay)", icon: <Pocket className="w-5 h-5" /> },
    { value: "COD", label: "Cash on Delivery (COD)", icon: <Banknote className="w-5 h-5" /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-100">
      <h2 className="text-lg font-semibold text-gray-100">Choose payment method</h2>

      <div className="grid gap-3">
        {paymentOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelectedMethod(opt.value)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition
              ${selectedMethod === opt.value ? "border-indigo-500 bg-gray-800" : "border-gray-700 bg-gray-900 hover:bg-gray-800"}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-gray-300">{opt.icon}</div>
              <div>
                <div className="text-sm font-medium text-gray-100">{opt.label}</div>
                <div className="text-xs text-gray-400">{opt.value === "COD" ? "Pay when delivered" : "Secure payment"}</div>
              </div>
            </div>
            {selectedMethod === opt.value && <div className="w-3 h-3 rounded-full bg-indigo-500" />}
          </button>
        ))}
      </div>

      {/* method-specific UI */}
      <AnimatePresence mode="wait">
        {selectedMethod === "UPI" && (
          <motion.div
            key="upi"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 space-y-3"
          >
            <label className="block text-sm text-gray-300">Enter UPI ID</label>
            <input
              name="upiId"
              value={form.upiId}
              onChange={handleChange}
              placeholder="example@upi"
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500"
              required
            />
            <div className="text-xs text-gray-400">After clicking Pay, you'll get UPI options in the Razorpay popup.</div>
          </motion.div>
        )}

        {selectedMethod === "Card" && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 space-y-3"
          >
            <label className="block text-sm text-gray-300">Name on card</label>
            <input
              name="cardName"
              value={form.cardName}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2 rounded-xl"
              required
            />
            <label className="block text-sm text-gray-300">Card number</label>
            <input
              name="cardNumber"
              value={form.cardNumber}
              onChange={handleChange}
              placeholder="xxxx xxxx xxxx xxxx"
              maxLength={16}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2 rounded-xl"
              required
            />
            <div className="flex gap-3">
              <input
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                className="flex-1 bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2 rounded-xl"
                required
              />
              <input
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                placeholder="CVV"
                maxLength={4}
                className="w-28 bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2 rounded-xl"
                required
              />
            </div>
            <div className="text-xs text-gray-400">Card details are collected securely in the Razorpay checkout.</div>
          </motion.div>
        )}

        {selectedMethod === "NetBanking" && (
          <motion.div
            key="netbanking"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 space-y-3"
          >
            <label className="block text-sm text-gray-300">Choose bank</label>
            <select
              name="bank"
              value={form.bank}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2 rounded-xl"
              required
            >
              <option value="">-- Select Bank --</option>
              <option value="SBI">State Bank of India</option>
              <option value="HDFC">HDFC Bank</option>
              <option value="ICICI">ICICI Bank</option>
              <option value="AXIS">Axis Bank</option>
              <option value="KOTAK">Kotak Mahindra</option>
            </select>
            <div className="text-xs text-gray-400">You'll be redirected to your bank's page in the Razorpay popup.</div>
          </motion.div>
        )}

        {selectedMethod === "Wallet" && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 space-y-3"
          >
            <label className="block text-sm text-gray-300">Select wallet</label>
            <select
              name="wallet"
              value={form.wallet}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2 rounded-xl"
            >
              <option value="">-- Select Wallet --</option>
              <option value="paytm">Paytm</option>
              <option value="amazonpay">Amazon Pay</option>
              <option value="phonepe">PhonePe</option>
            </select>
            <div className="text-xs text-gray-400">You will be redirected to the selected wallet via Razorpay.</div>
          </motion.div>
        )}

        {selectedMethod === "COD" && (
          <motion.div
            key="cod"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 text-sm text-gray-400"
          >
            <p>Pay with cash or UPI at the time of delivery. COD orders may have extra handling fees.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* actions */}
      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 py-3 rounded-xl hover:bg-gray-700 transition"
          disabled={loading}
        >
          Back
        </button>

        <button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Processing…" : selectedMethod === "COD" ? "Confirm COD" : `Pay ₹${amount}`}
        </button>
      </div>
    </form>
  );
}
