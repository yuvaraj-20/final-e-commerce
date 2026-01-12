import { Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import PageLoader from "../components/common/PageLoader";
import MainLayout from "../layouts/MainLayout";

import { authRoutes } from "./auth.routes";
import { publicRoutes } from "./public.routes";
import { thriftRoutes } from "./thrift.routes";
import { checkoutRoutes } from "./checkout.routes";
import { userRoutes } from "./user.routes";
import { sellerRoutes } from "./seller.routes";
import { adminRoutes } from "./admin.routes";

const routesConfig = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      ...authRoutes,
      ...publicRoutes,
      ...thriftRoutes,
      ...checkoutRoutes,
      ...userRoutes,
      ...sellerRoutes,
      ...adminRoutes,
      { path: "*", element: <Navigate to="/home" replace /> }
    ],
  },
];

export default function AppRoutes() {
  const element = useRoutes(routesConfig);
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}
