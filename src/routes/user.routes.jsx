import { lazy } from "react";
import { Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Protected from "../Protected";

const UserDashboard = lazy(() =>
  import("../components/dashboard/user/UserDashboard")
);

export default (
  <Route element={<DashboardLayout />}>
    <Route
      path="/my-orders"
      element={
        <Protected allow={["user", "seller", "admin"]}>
          <UserDashboard />
        </Protected>
      }
    />
  </Route>
);
