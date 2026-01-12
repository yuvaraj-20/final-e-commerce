import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const Home = lazy(() => import("../pages/Home"));
const Store = lazy(() => import("../pages/Store"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const CustomDesign = lazy(() => import("../pages/CustomDesign"));
const MixMatch = lazy(() => import("../pages/MixMatch"));
const Wishlist = lazy(() => import("../pages/Wishlist"));
const Cart = lazy(() => import("../pages/Cart"));
const MonoFit = lazy(() => import("../pages/MonoFit"));
const SearchResults = lazy(() => import("../pages/SearchResults"));
const TrustSafety = lazy(() => import("../pages/TrustSafety"));

export default (
  <Route element={<MainLayout />}>
    <Route path="/home" element={<Home />} />
    <Route path="/products" element={<Store />} />
    <Route path="/product/:id" element={<ProductDetail />} />
    <Route path="/design" element={<CustomDesign />} />
    <Route path="/mix-match" element={<MixMatch />} />
    <Route path="/wishlist" element={<Wishlist />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/monofit" element={<MonoFit />} />
    <Route path="/monofit/:id" element={<MonoFit />} />
    <Route path="/search" element={<SearchResults />} />
    <Route path="/trust-safety" element={<TrustSafety />} />

    <Route path="*" element={<Navigate to="/home" replace />} />
  </Route>
);
