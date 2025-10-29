import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Package,
  Heart,
  Zap,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Calendar,
  BarChart3,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingApprovals: 0,
    activeThriftItems: 0,
    monofitCombos: 0,
    communityPosts: 0,
    revenueGrowth: 0,
    userGrowth: 0,
    orderGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardStats();
    loadRecentActivity();
  }, [timeRange]);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminDashboardStats(timeRange);
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activity = await api.getRecentActivity();
      setRecentActivity(activity);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: stats.userGrowth,
      changeType: stats.userGrowth >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      change: stats.revenueGrowth,
      changeType: stats.revenueGrowth >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      change: stats.orderGrowth,
      changeType: stats.orderGrowth >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'from-orange-500 to-orange-600',
      change: 5,
      changeType: 'positive'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toLocaleString(),
      icon: Heart,
      color: 'from-red-500 to-red-600',
      change: -3,
      changeType: 'negative',
      urgent: stats.pendingApprovals > 20
    },
    {
      title: 'Thrift Items',
      value: stats.activeThriftItems.toLocaleString(),
      icon: TrendingUp,
      color: 'from-teal-500 to-teal-600',
      change: 22,
      changeType: 'positive'
    },
    {
      title: 'MonoFit Combos',
      value: stats.monofitCombos.toLocaleString(),
      icon: Zap,
      color: 'from-indigo-500 to-indigo-600',
      change: 18,
      changeType: 'positive'
    },
    {
      title: 'Community Posts',
      value: stats.communityPosts.toLocaleString(),
      icon: MessageSquare,
      color: 'from-pink-500 to-pink-600',
      change: 25,
      changeType: 'positive'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
            <p className="text-purple-100">
              Monitor your AI-powered fashion platform's performance and manage all operations from here.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/20 border border-white/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow ${
                stat.urgent ? 'ring-2 ring-red-200' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-full ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
              {stat.urgent && (
                <div className="mt-2 text-xs text-red-600 font-medium">
                  Requires attention
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Last 30 days</span>
            </div>
          </div>
          <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-purple-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue Chart</p>
              <p className="text-sm text-gray-400">Interactive chart would be here</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">$45.2K</div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">$38.1K</div>
              <div className="text-sm text-gray-600">Last Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+18.6%</div>
              <div className="text-sm text-gray-600">Growth</div>
            </div>
          </div>
        </div>

        {/* Top Performing Items */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Items</h3>
          <div className="space-y-4">
            {[
              { name: 'Summer Casual Vibes Combo', type: 'MonoFit', sales: 245, revenue: '$4,900', trend: 'up' },
              { name: 'Urban Streetwear Set', type: 'MonoFit', sales: 189, revenue: '$3,780', trend: 'up' },
              { name: 'Vintage Band T-Shirt', type: 'Thrift', sales: 156, revenue: '$2,340', trend: 'down' },
              { name: 'Designer Hoodie', type: 'Product', sales: 134, revenue: '$2,680', trend: 'up' },
              { name: 'Custom Abstract Tee', type: 'Custom', sales: 98, revenue: '$1,960', trend: 'up' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.type === 'MonoFit' ? 'bg-purple-100 text-purple-800' :
                        item.type === 'Thrift' ? 'bg-green-100 text-green-800' :
                        item.type === 'Custom' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-sm text-gray-600">{item.sales} sales</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{item.revenue}</div>
                  <div className={`flex items-center space-x-1 text-sm ${
                    item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.trend === 'up' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    <span>{item.trend === 'up' ? '+12%' : '-5%'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New thrift item uploaded', user: 'Sarah Johnson', time: '2 minutes ago', type: 'upload', status: 'pending' },
              { action: 'MonoFit combo approved', user: 'Admin', time: '15 minutes ago', type: 'approval', status: 'completed' },
              { action: 'Order #1234 completed', user: 'Mike Davis', time: '1 hour ago', type: 'order', status: 'completed' },
              { action: 'Community post flagged', user: 'Emma Wilson', time: '2 hours ago', type: 'flag', status: 'pending' },
              { action: 'New user registered', user: 'Alex Chen', time: '3 hours ago', type: 'user', status: 'completed' },
              { action: 'Custom design submitted', user: 'Lisa Park', time: '4 hours ago', type: 'design', status: 'pending' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'upload' ? 'bg-blue-500' :
                  activity.type === 'approval' ? 'bg-green-500' :
                  activity.type === 'order' ? 'bg-purple-500' :
                  activity.type === 'flag' ? 'bg-red-500' :
                  activity.type === 'user' ? 'bg-indigo-500' :
                  'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">by {activity.user}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {activity.status}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </button>
            
            <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Review Approvals ({stats.pendingApprovals})</span>
            </button>
            
            <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Update Trending</span>
            </button>
            
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Moderate Community</span>
            </button>
          </div>

          {/* System Status */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Operational</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Services</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-600">Slow</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;