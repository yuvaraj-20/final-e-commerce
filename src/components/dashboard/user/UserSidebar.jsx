// src/components/dashboard/UserSidebar.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut } from "lucide-react";
import { useStore } from "../../../store/useStore";
import { useNavigate } from "react-router-dom";

const UserSidebar = ({
  tabs = [],
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const ok = window.confirm("Are you sure you want to log out?");
      if (!ok) return;

      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      try {
        localStorage.removeItem("access_token");
      } catch (e) {}
      try {
        sessionStorage.removeItem("access_token");
      } catch (e) {}

      if (typeof setUser === "function") setUser(null);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
      if (typeof setUser === "function") setUser(null);
      navigate("/login", { replace: true });
    }
  };

  const renderNav = (isMobile = false) => (
    <nav className="px-4 py-3 overflow-auto flex-1" aria-label="Main navigation">
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
              <span className="font-medium truncate">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  const renderHeader = (showClose = false) => (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <img
            src={
              user?.avatar ||
              "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
            }
            alt={user?.name || "User avatar"}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {user?.name || "Guest User"}
          </p>
          <p className="text-sm text-gray-600 truncate">
            {user?.email || "—"}
          </p>
        </div>
        {showClose && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="p-6 border-t border-gray-200 bg-white">
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
        aria-label="Logout"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile / tablet drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:hidden flex flex-col"
              role="navigation"
              aria-label="User sidebar mobile"
            >
              {renderHeader(true)}
              {renderNav(true)}
              {renderFooter()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar (always visible) */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-80 bg-white border-r border-gray-200 min-h-screen"
        role="navigation"
        aria-label="User sidebar desktop"
      >
        {renderHeader(false)}
        {renderNav(false)}
        {renderFooter()}
      </aside>
    </>
  );
};

export default UserSidebar;
