import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AuthModal from "../components/common/AuthModal";
import { Toaster } from "react-hot-toast";

export default function MainLayout() {
  return (
    <>
      <Header />

      <main className="transition-[padding] duration-200 pt-[var(--header-height,64px)] min-h-screen bg-white">
        <Outlet />
      </main>

      <Footer />
      <AuthModal />
      <Toaster position="top-right" />
    </>
  );
}
