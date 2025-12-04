// src/components/dashboard/user/UserDashboard.jsx
import React, { useState } from "react";
import {
  ShoppingCart,
  Heart,
  Package,
  Palette,
  Settings,
  MessageSquare,
  Zap,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

import UserSidebar from "./UserSidebar"; // adjust path if needed
import UserMyOrders from "./UserMyOrders";
import UserMyThrift from "./UserMyThrift";
import UserMyCombos from "./UserMyCombos";
import UserMyDesigns from "./UserMyDesigns";
import UserWishlist from "./UserWishlist";
import UserCommunity from "./UserCommunity";
import UserAISuggestions from "./UserAISuggestions";
import UserSettings from "./UserSettings";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: "orders", name: "My Orders", icon: ShoppingCart, component: UserMyOrders },
    { id: "thrift", name: "My Thrift", icon: Package, component: UserMyThrift },
    { id: "combos", name: "My Combos", icon: Zap, component: UserMyCombos },
    { id: "designs", name: "My Designs", icon: Palette, component: UserMyDesigns },
    { id: "wishlist", name: "Wishlist", icon: Heart, component: UserWishlist },
    { id: "community", name: "Community", icon: MessageSquare, component: UserCommunity },
    { id: "ai", name: "AI Suggestions", icon: TrendingUp, component: UserAISuggestions },
    { id: "settings", name: "Settings", icon: Settings, component: UserSettings },
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || UserMyOrders;

  return (
    <div className="w-full min-h-screen bg-gray-50 lg:flex">
      {/* Sidebar (desktop always, mobile/tablet via drawer) */}
      <UserSidebar
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Right section */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Header under main site nav */}
        <header className="sticky top-16 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              {/* 👇 CHANGED HERE: lg:hidden (visible on all <1024px) */}
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                {tabs.find((tab) => tab.id === activeTab)?.name || "Dashboard"}
              </h1>
            </div>

            <button className="hidden md:inline-flex p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ActiveComponent />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
