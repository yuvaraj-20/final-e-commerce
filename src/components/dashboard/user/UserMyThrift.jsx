import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, TrendingUp, Clock, CheckCircle, X, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import { useStore } from '../../../store/useStore';
import UploadForm from '../../thrift/UploadForm';
import toast from 'react-hot-toast';

const UserMyThrift = () => {
  const { user } = useStore();
  const [myItems, setMyItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    if (user) {
      loadMyItems();
    }
  }, [user]);

  const loadMyItems = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await api.getUserThriftItems(user.id);
      setMyItems(data);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.deleteThriftItem(itemId, user.id);
      setMyItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    loadMyItems();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = myItems.filter(item => 
    selectedStatus === 'all' || item.status === selectedStatus
  );

  if (showUploadForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <UploadForm
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowUploadForm(false)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">My Thrift Items</h2>
          <p className="text-gray-600">Manage your uploaded thrift items</p>
        </div>
        
        <button
          onClick={() => setShowUploadForm(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Upload Item</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{myItems.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {myItems.filter(item => item.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {myItems.filter(item => item.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {myItems.reduce((sum, item) => sum + item.views, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Items</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <span className="text-sm text-gray-600">
            {filteredItems.length} items found
          </span>
        </div>
      </div>

      {/* Items Grid */}
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="capitalize">{item.status}</span>
                </span>
              </div>
              {item.isBoosted && (
                <div className="absolute top-3 right-3">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Boosted
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">${item.price}</span>
                <span className="text-sm text-gray-600">{item.size}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Views</p>
                  <p className="font-medium text-gray-900">{item.views}</p>
                </div>
                <div>
                  <p className="text-gray-600">Likes</p>
                  <p className="font-medium text-gray-900">{item.likes}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
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
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedStatus === 'all' ? 'No items uploaded yet' : `No ${selectedStatus} items`}
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedStatus === 'all' 
              ? 'Start by uploading your first thrift item' 
              : `You don't have any ${selectedStatus} items`}
          </p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
          >
            Upload Your First Item
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMyThrift;