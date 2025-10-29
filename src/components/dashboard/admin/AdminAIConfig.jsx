import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Zap, Settings, RefreshCw, Sliders, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const AdminAIConfig = () => {
  const [aiSettings, setAiSettings] = useState({
    trendingWeights: {
      likes: 2,
      shares: 3,
      orders: 4,
      comments: 1
    },
    recommendationSettings: {
      maxRecommendations: 10,
      similarityThreshold: 0.7,
      diversityFactor: 0.3
    },
    autoModeration: {
      enabled: true,
      flagThreshold: 5,
      autoHide: false
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadAISettings();
  }, []);

  const loadAISettings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAISettings();
      setAiSettings(data);
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    try {
      await api.updateAISettings(aiSettings);
      toast.success('AI settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update AI settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecomputeTrending = async () => {
    try {
      await api.recomputeTrendingCombos();
      toast.success('Trending combos recomputed!');
    } catch (error) {
      toast.error('Failed to recompute trending combos');
    }
  };

  const handleUpdateWeight = (type, value) => {
    setAiSettings(prev => ({
      ...prev,
      trendingWeights: {
        ...prev.trendingWeights,
        [type]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="w-48 h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Configuration</h2>
          <p className="text-gray-600">Configure AI algorithms and recommendation systems</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleRecomputeTrending}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recompute Trending</span>
          </button>
          
          <button
            onClick={handleUpdateSettings}
            disabled={isUpdating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {isUpdating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Settings className="h-4 w-4" />
            )}
            <span>{isUpdating ? 'Updating...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Trending Algorithm Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-orange-100 p-3 rounded-lg">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trending Algorithm Weights</h3>
            <p className="text-gray-600">Adjust how different engagement metrics affect trending scores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(aiSettings.trendingWeights).map(([key, value]) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {key} Weight
                </label>
                <span className="text-sm text-gray-600">{value}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={value}
                onChange={(e) => handleUpdateWeight(key, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1x</span>
                <span>10x</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Current Formula:</h4>
          <p className="text-sm text-gray-700">
            Trending Score = (Likes × {aiSettings.trendingWeights.likes}) + 
            (Shares × {aiSettings.trendingWeights.shares}) + 
            (Orders × {aiSettings.trendingWeights.orders}) + 
            (Comments × {aiSettings.trendingWeights.comments})
          </p>
        </div>
      </motion.div>

      {/* Recommendation System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recommendation System</h3>
            <p className="text-gray-600">Configure AI recommendation parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Max Recommendations
            </label>
            <input
              type="number"
              min="5"
              max="20"
              value={aiSettings.recommendationSettings.maxRecommendations}
              onChange={(e) => setAiSettings(prev => ({
                ...prev,
                recommendationSettings: {
                  ...prev.recommendationSettings,
                  maxRecommendations: parseInt(e.target.value)
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Similarity Threshold
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={aiSettings.recommendationSettings.similarityThreshold}
              onChange={(e) => setAiSettings(prev => ({
                ...prev,
                recommendationSettings: {
                  ...prev.recommendationSettings,
                  similarityThreshold: parseFloat(e.target.value)
                }
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-600 text-center">
              {aiSettings.recommendationSettings.similarityThreshold}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Diversity Factor
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={aiSettings.recommendationSettings.diversityFactor}
              onChange={(e) => setAiSettings(prev => ({
                ...prev,
                recommendationSettings: {
                  ...prev.recommendationSettings,
                  diversityFactor: parseFloat(e.target.value)
                }
              }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-gray-600 text-center">
              {aiSettings.recommendationSettings.diversityFactor}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Auto Moderation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Zap className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Auto Moderation</h3>
            <p className="text-gray-600">Configure automatic content moderation</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable Auto Moderation</h4>
              <p className="text-sm text-gray-600">Automatically flag inappropriate content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiSettings.autoModeration.enabled}
                onChange={(e) => setAiSettings(prev => ({
                  ...prev,
                  autoModeration: {
                    ...prev.autoModeration,
                    enabled: e.target.checked
                  }
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Flag Threshold
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={aiSettings.autoModeration.flagThreshold}
                onChange={(e) => setAiSettings(prev => ({
                  ...prev,
                  autoModeration: {
                    ...prev.autoModeration,
                    flagThreshold: parseInt(e.target.value)
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600">Number of reports before auto-flagging</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Auto Hide Flagged Content</h4>
                <p className="text-sm text-gray-600">Automatically hide flagged posts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiSettings.autoModeration.autoHide}
                  onChange={(e) => setAiSettings(prev => ({
                    ...prev,
                    autoModeration: {
                      ...prev.autoModeration,
                      autoHide: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-3 rounded-lg">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Performance Metrics</h3>
            <p className="text-gray-600">Monitor AI system performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">94.2%</div>
            <div className="text-sm text-gray-600">Recommendation Accuracy</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">1.2s</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">99.8%</div>
            <div className="text-sm text-gray-600">System Uptime</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAIConfig;