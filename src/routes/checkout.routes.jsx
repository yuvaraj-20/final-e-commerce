import { lazy } from "react";
import { Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Protected from "../Protected";

const Checkout = lazy(() => import("../components/checkout/Checkout"));
const OrderSuccess = lazy(() => import("../components/checkout/OrderSuccess"));
const PaymentPending = lazy(() =>
  import("../components/checkout/PaymentPending")
);
const PaymentExpired = lazy(() =>
  import("../components/checkout/PaymentExpired")
);

export default (
  <Route element={<DashboardLayout />}>
    <Route
      path="/checkout"
      element={
        <Protected allow={["user", "seller", "admin"]}>
          <Checkout />
        </Protected>
      }
    />
    <Route
      path="/checkout/success"
      element={
        <Protected allow={["user", "seller", "admin"]}>
          <OrderSuccess />
        </Protected>
      }
    />
    <Route path="/checkout/pending/:orderId" element={<PaymentPending />} />
    <Route path="/checkout/expired" element={<PaymentExpired />} />
  </Route>
);
