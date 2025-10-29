// src/components/dashboard/user/UserDashboard.jsx
import React, { useState } from 'react';
import { 
  ShoppingCart,
  Heart,
  Package,
  Palette,
  Settings,
  MessageSquare,
  Zap,
  TrendingUp,
  User,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import UserSidebar from './UserSidebar';
import UserMyOrders from './UserMyOrders';
import UserMyThrift from './UserMyThrift';
import UserMyCombos from './UserMyCombos';
import UserMyDesigns from './UserMyDesigns';
import UserWishlist from './UserWishlist';
import UserCommunity from './UserCommunity';
import UserAISuggestions from './UserAISuggestions';
import UserSettings from './UserSettings';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'orders', name: 'My Orders', icon: ShoppingCart, component: UserMyOrders },
    { id: 'thrift', name: 'My Thrift', icon: Package, component: UserMyThrift },
    { id: 'combos', name: 'My Combos', icon: Zap, component: UserMyCombos },
    { id: 'designs', name: 'My Designs', icon: Palette, component: UserMyDesigns },
    { id: 'wishlist', name: 'Wishlist', icon: Heart, component: UserWishlist },
    { id: 'community', name: 'Community', icon: MessageSquare, component: UserCommunity },
    { id: 'ai', name: 'AI Suggestions', icon: TrendingUp, component: UserAISuggestions },
    { id: 'settings', name: 'Settings', icon: Settings, component: UserSettings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || UserMyOrders;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <UserSidebar 
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Hamburger — ALWAYS visible (desktop + mobile) */}
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={sidebarOpen}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-60"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <h1 className="text-2xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            <ActiveComponent />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
