import React, { useState, useEffect } from 'react';
import { Heart, Share2, ShoppingCart, Zap, TrendingUp, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import { useStore } from '../../../store/useStore';
import ComboCard from '../../monofit/ComboCard';

const UserMyCombos = () => {
  const { user, wishlist } = useStore();
  const [savedCombos, setSavedCombos] = useState([]);
  const [recommendedCombos, setRecommendedCombos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('saved');

  useEffect(() => {
    if (user) {
      loadCombos();
    }
  }, [user]);

  const loadCombos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [saved, recommended] = await Promise.all([
        api.getUserSavedCombos(user.id),
        api.getComboRecommendations(user.id)
      ]);
      setSavedCombos(saved);
      setRecommendedCombos(recommended);
    } catch (error) {
      console.error('Failed to load combos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCombos = activeTab === 'saved' ? savedCombos : recommendedCombos;

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
          <h2 className="text-2xl font-bold text-gray-900">My MonoFit Combos</h2>
          <p className="text-gray-600">Your saved and recommended outfit combinations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{savedCombos.length}</div>
              <div className="text-sm text-gray-600">Saved Combos</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{recommendedCombos.length}</div>
              <div className="text-sm text-gray-600">AI Recommendations</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {savedCombos.filter(combo => wishlist.includes(combo.id)).length}
              </div>
              <div className="text-sm text-gray-600">In Wishlist</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Saved Combos ({savedCombos.length})
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'recommended'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            AI Recommended ({recommendedCombos.length})
          </button>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCombos.map((combo, index) => (
          <ComboCard key={combo.id} combo={combo} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {currentCombos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'saved' ? (
              <Heart className="h-12 w-12 text-gray-400" />
            ) : (
              <Zap className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'saved' ? 'No saved combos yet' : 'No recommendations available'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'saved' 
              ? 'Start exploring MonoFit combos and save your favorites'
              : 'Browse more products to get personalized recommendations'}
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
            {activeTab === 'saved' ? 'Explore Combos' : 'Browse Products'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMyCombos;