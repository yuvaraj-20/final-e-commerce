import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Share2, Download, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import { useStore } from '../../../store/useStore';
import toast from 'react-hot-toast';

const UserMyDesigns = () => {
  const { user, customDesigns, setCustomDesigns } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDesigns();
    }
  }, [user]);

  const loadDesigns = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await api.getCustomDesigns(user.id);
      setCustomDesigns(data);
    } catch (error) {
      console.error('Failed to load designs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDesign = async (designId) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    try {
      await api.deleteCustomDesign(designId);
      setCustomDesigns(customDesigns.filter(design => design.id !== designId));
      toast.success('Design deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete design');
    }
  };

  const handleShareDesign = async (designId, method) => {
    try {
      await api.shareDesign(designId, method, 'recipient@example.com');
      toast.success(`Design shared via ${method}!`);
    } catch (error) {
      toast.error('Failed to share design');
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">My Custom Designs</h2>
          <p className="text-gray-600">Manage your custom t-shirt and apparel designs</p>
        </div>
        
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Create New Design</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{customDesigns.length}</div>
              <div className="text-sm text-gray-600">Total Designs</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Share2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {customDesigns.filter(design => design.shared).length}
              </div>
              <div className="text-sm text-gray-600">Shared</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Orders</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Download className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customDesigns.map((design, index) => (
          <motion.div
            key={design.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={design.mockupUrl}
                alt={design.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  design.shared 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {design.shared ? 'Shared' : 'Private'}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium capitalize">
                  {design.garmentType}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{design.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{design.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 capitalize">
                  {design.fabricType} Print
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(design.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex space-x-2 mb-3">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleShareDesign(design.id, 'whatsapp')}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShareDesign(design.id, 'email')}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Email
                </button>
                <button
                  onClick={() => handleDeleteDesign(design.id)}
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
      {customDesigns.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No custom designs yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first custom design using our 3D design tool
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
            Start Designing
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMyDesigns;