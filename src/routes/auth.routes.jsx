import { lazy } from "react";
import { Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));

export default (
  <Route element={<AuthLayout />}>
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
  </Route>
);
