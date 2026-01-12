import { lazy } from "react";
import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Protected from "../Protected";

const ThriftStore = lazy(() => import("../pages/ThriftStore"));
const ThriftItemDetail = lazy(() => import("../pages/ThriftItemDetail"));
const ThriftSell = lazy(() => import("../pages/ThriftSell"));
const UploadForm = lazy(() => import("../components/thrift/UploadForm"));

export default (
  <Route element={<MainLayout />}>
    <Route path="/thrift" element={<ThriftStore />} />
    <Route path="/thrift/:id" element={<ThriftItemDetail />} />

    <Route
      path="/thrift/upload"
      element={
        <Protected allow={["user", "seller", "admin"]}>
          <UploadForm />
        </Protected>
      }
    />

    <Route
      path="/thrift/sell"
      element={
        <Protected allow={["seller", "admin"]}>
          <ThriftSell />
        </Protected>
      }
    />
  </Route>
);
