import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Flag, TrendingUp, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const AdminThriftApprovals = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPendingThriftItems();
      setPendingItems(data);
    } catch (error) {
      console.error('Failed to load pending items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      await api.approveThriftItem(itemId);
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item approved successfully!');
    } catch (error) {
      toast.error('Failed to approve item');
    }
  };

  const handleReject = async (itemId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await api.rejectThriftItem(itemId, reason);
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item rejected');
    } catch (error) {
      toast.error('Failed to reject item');
    }
  };

  const handleBoost = async (itemId) => {
    try {
      await api.boostThriftItem(itemId);
      toast.success('Item boosted to homepage!');
    } catch (error) {
      toast.error('Failed to boost item');
    }
  };

  const filteredItems = pendingItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'T-Shirts', 'Hoodies', 'Jackets', 'Dresses', 'Accessories'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded mb-4"></div>
              <div className="flex space-x-2">
                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thrift Store Approvals</h2>
          <p className="text-gray-600">Review and approve user-uploaded thrift items</p>
        </div>
        <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg">
          <span className="font-medium">{pendingItems.length} items pending</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredItems.length} items to review
            </span>
          </div>
        </div>
      </div>

      {/* Pending Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.condition === 'new' ? 'bg-green-100 text-green-800' :
                  item.condition === 'like-new' ? 'bg-blue-100 text-blue-800' :
                  item.condition === 'good' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {item.condition.replace('-', ' ')}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-900">${item.price}</span>
                <span className="text-sm text-gray-600">{item.size}</span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <img
                    src={item.sellerAvatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={item.sellerName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-900">{item.sellerName}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Uploaded {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Check className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <X className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleBoost(item.id)}
                  className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors"
                  title="Boost to Homepage"
                >
                  <TrendingUp className="h-4 w-4" />
                </button>
                <button className="bg-orange-600 text-white py-2 px-3 rounded-lg hover:bg-orange-700 transition-colors">
                  <Flag className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No pending thrift items to review at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default AdminThriftApprovals;