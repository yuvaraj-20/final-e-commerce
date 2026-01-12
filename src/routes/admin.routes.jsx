import { lazy } from "react";
import { Route } from "react-router-dom";
import Protected from "../Protected";
import DashboardLayout from "../layouts/DashboardLayout";

const AdminDashboard = lazy(() =>
  import("../components/dashboard/admin/AdminDashboard")
);

export default (
  <Route element={<DashboardLayout />}>
    <Route
      path="/admin/dashboard"
      element={
        <Protected allow={["admin"]}>
          <AdminDashboard />
        </Protected>
      }
    />
  </Route>
);
