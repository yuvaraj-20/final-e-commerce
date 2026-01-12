
import { useEffect, useRef } from "react";
import { api } from "../lib/apiClient";
import { PAYMENT_STATUS } from "../constants/orderStatus";

export function usePaymentStatusPoll(order, onResolved) {
  const timerRef = useRef(null);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!order) return;

    if (order.payment_status !== PAYMENT_STATUS.PENDING) return;

    timerRef.current = setInterval(async () => {
      try {
        // ⏱ stop after 3 minutes
        if (Date.now() - startedAtRef.current > 3 * 60 * 1000) {
          clearInterval(timerRef.current);
          return;
        }

        const res = await api.get(`/api/orders/${order.id}`);
        const updated = res?.data?.data;

        if (!updated) return;

        if (updated.payment_status !== PAYMENT_STATUS.PENDING) {
          clearInterval(timerRef.current);
          onResolved(updated);
        }
      } catch {
        // silent fail – polling must never break UI
      }
    }, 5000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [order, onResolved]);
}
