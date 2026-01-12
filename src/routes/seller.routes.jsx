import { lazy } from "react";
import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const Seller = lazy(() => import("../pages/Seller"));
const ContactSeller = lazy(() => import("../pages/ContactSeller"));
const TrustSafety = lazy(() => import("../pages/TrustSafety"));

export default (
  <Route element={<MainLayout />}>
    <Route path="/seller/:sellerId" element={<Seller />} />
    <Route path="/seller/:sellerId/contact" element={<ContactSeller />} />
    <Route path="/seller/:sellerId/policies" element={<TrustSafety />} />
  </Route>
);
