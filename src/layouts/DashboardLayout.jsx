import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout() {
  return (
    <>
      <Header />

      <main className="pt-[var(--header-height,64px)] min-h-screen bg-gray-50">
        <Outlet />
      </main>

      <Toaster position="top-right" />
    </>
  );
}
