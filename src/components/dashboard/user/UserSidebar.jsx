import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { useStore } from '../../../store/useStore';

const UserSidebar = ({
  tabs,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen
}) => {
  const { user } = useStore();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white shadow-xl lg:shadow-none border-r border-gray-200 lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">My Dashboard</h2>
                <p className="text-sm text-gray-600">AI Fashion Platform</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'}
                alt={user?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
                {user?.badges && user.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.badges.slice(0, 2).map((badge, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1">AI Style Assistant</h3>
              <p className="text-sm text-gray-600">
                Get personalized recommendations and style tips
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default UserSidebar;