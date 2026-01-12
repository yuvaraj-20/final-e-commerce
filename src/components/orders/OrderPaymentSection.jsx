import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../lib/apiClient";
import { PAYMENT_STATUS } from "../../constants/orderStatus";
import { useState, useEffect } from "react";

/* ---------------- Razorpay Loader ---------------- */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function OrderPaymentSection({ order, user }) {
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const paymentStatus = order.payment_status;
  const paymentMethod = (order.payment_method || "").toLowerCase();

  const attempts = Number(order.payment_attempts || 0);
  const maxAttempts = 3;
  const retryBlocked = attempts >= maxAttempts;

  const lastFailedAt = order.last_payment_failed_at
    ? new Date(order.last_payment_failed_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  /* ---------------- EXPIRED → HARD BLOCK ---------------- */
  useEffect(() => {
    if (paymentStatus === PAYMENT_STATUS.EXPIRED) {
      window.location.replace("/checkout/expired");
    }
  }, [paymentStatus]);

  /* ---------------- REFUNDED (READ ONLY) ---------------- */
  if (paymentStatus === PAYMENT_STATUS.REFUNDED) {
    return (
      <div className="mt-6 rounded-xl border border-green-300 bg-green-50 px-5 py-4">
        <p className="text-sm font-semibold text-green-800">Refund Initiated</p>
        <p className="text-xs text-green-700 mt-1">
          Your payment has been refunded. The amount will be credited back to
          your original payment method shortly.
        </p>
      </div>
    );
  }

  /* ---------------- PAID / COD → NOTHING ---------------- */
  if (
    paymentStatus === PAYMENT_STATUS.PAID ||
    paymentMethod === "cod"
  ) {
    return null;
  }

  /* ---------------- PENDING / FAILED ---------------- */
  const canRetry =
    (paymentStatus === PAYMENT_STATUS.PENDING ||
      paymentStatus === PAYMENT_STATUS.FAILED) &&
    !retryBlocked;

  if (!canRetry && retryBlocked) {
    return (
      <div className="mt-6 rounded-xl border border-red-300 bg-red-50 px-5 py-4">
        <p className="text-sm font-semibold text-red-800">
          Payment attempts exceeded
        </p>
        <p className="text-xs text-red-700 mt-1">
          You’ve reached the maximum number of payment attempts. Please place the
          order again.
        </p>
      </div>
    );
  }

  if (!canRetry) return null;

  const handlePayNow = async () => {
    if (loading) return;
    setLoading(true);

    const toastId = toast.loading("Preparing payment...");

    try {
      const razorRes = await api.post("/api/payments/razorpay/create", {
        order_id: order.id,
      });

      const razorData = razorRes?.data?.data;
      if (!razorData?.razorpay_key || !razorData?.razorpay_order) {
        throw new Error("Unable to start payment");
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay");

      toast.dismiss(toastId);

      const rzp = new window.Razorpay({
        key: razorData.razorpay_key,
        order_id: razorData.razorpay_order.id,
        amount: razorData.razorpay_order.amount,
        currency: "INR",
        name: "MonoFit Commerce",
        description: `Order #${order.id}`,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        notes: {
          order_id: order.id,
          resume: true,
        },
        theme: { color: "#6366f1" },

        handler: async (response) => {
          try {
            await api.post("/api/payments/razorpay/verify", response);
            toast.success("Payment successful");
            window.location.reload();
          } catch {
            toast.error("Payment verification failed");
            setLoading(false);
          }
        },
      });

      rzp.on("payment.failed", () => {
        toast.error("Payment failed. You can retry.");
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.message || "Unable to proceed with payment");
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 px-5 py-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-800">
            {paymentStatus === PAYMENT_STATUS.FAILED
              ? "Payment Failed"
              : "Payment Pending"}
          </h4>

          <p className="text-xs text-yellow-700 mt-1">
            {paymentStatus === PAYMENT_STATUS.FAILED
              ? "Your payment could not be completed. You can retry safely."
              : "We haven’t confirmed your payment yet. If money was deducted earlier, it will be updated shortly or refunded."}
          </p>

          {/* 📊 Attempts info */}
          <div className="mt-2 text-xs text-yellow-700">
            Attempt {attempts} of {maxAttempts}
            {lastFailedAt && (
              <span className="block mt-0.5">
                Last failed at {lastFailedAt}
              </span>
            )}
          </div>

          <button
            disabled={loading}
            onClick={handlePayNow}
            className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Opening Payment..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
