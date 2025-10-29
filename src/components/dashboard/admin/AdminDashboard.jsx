// src/components/dashboard/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  Settings,
  MessageSquare,
  Zap,
  TrendingUp,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminThriftApprovals from './AdminThriftApprovals';
import AdminCombosManagement from './AdminCombosManagement';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminAIConfig from './AdminAIConfig';
import AdminCommunityModeration from './AdminCommunityModeration';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3, component: AdminOverview },
    { id: 'products', name: 'Products', icon: Package, component: AdminProducts },
    { id: 'thrift', name: 'Thrift Approvals', icon: Shield, component: AdminThriftApprovals },
    { id: 'combos', name: 'MonoFit Combos', icon: Zap, component: AdminCombosManagement },
    { id: 'orders', name: 'Orders', icon: ShoppingCart, component: AdminOrders },
    { id: 'users', name: 'Users', icon: Users, component: AdminUsers },
    { id: 'ai', name: 'AI Config', icon: TrendingUp, component: AdminAIConfig },
    { id: 'community', name: 'Community', icon: MessageSquare, component: AdminCommunityModeration },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminOverview;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
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
              {/* Hamburger — always visible */}
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={sidebarOpen}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-60"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <h1 className="text-2xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name || 'Admin Dashboard'}
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

export default AdminDashboard;
