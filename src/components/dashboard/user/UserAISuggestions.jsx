import React, { useState, useEffect } from 'react';
import { Brain, Wand2, Heart, ShoppingCart, Sparkles, TrendingUp, Palette, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import { useStore } from '../../../store/useStore';
import ProductCard from '../../common/ProductCard';
import ComboCard from '../../monofit/ComboCard';
import toast from 'react-hot-toast';

const UserAISuggestions = () => {
  const { user, addToCart, toggleWishlist } = useStore();
  const [recommendations, setRecommendations] = useState({
    products: [],
    combos: [],
    designIdeas: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [products, combos, designs] = await Promise.all([
        api.getAIProductRecommendations(user.id),
        api.getAIComboRecommendations(user.id),
        api.getAIDesignSuggestions(user.id)
      ]);
      
      setRecommendations({
        products,
        combos,
        designIdeas: designs
      });
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromPrompt = async () => {
    if (!promptInput.trim()) {
      toast.error('Please enter a style prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const suggestions = await api.generateStyleSuggestions(promptInput, user.id);
      setRecommendations(prev => ({
        ...prev,
        designIdeas: [...suggestions, ...prev.designIdeas]
      }));
      setPromptInput('');
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToWishlist = (itemId) => {
    toggleWishlist(itemId);
    toast.success('Added to wishlist!');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Brain className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Style Assistant</h1>
            <p className="text-purple-100">
              Personalized recommendations powered by artificial intelligence
            </p>
          </div>
        </div>
        
        {/* AI Prompt Input */}
        <div className="bg-white/10 rounded-xl p-4">
          <h3 className="font-semibold mb-3">Ask AI for Style Suggestions</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g., 'Show me casual outfits for summer' or 'I need formal wear for work'"
              className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerateFromPrompt()}
            />
            <button
              onClick={handleGenerateFromPrompt}
              disabled={isGenerating}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              ) : (
                <Wand2 className="h-5 w-5" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{recommendations.products.length}</div>
              <div className="text-sm text-gray-600">Product Suggestions</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{recommendations.combos.length}</div>
              <div className="text-sm text-gray-600">Combo Recommendations</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Palette className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{recommendations.designIdeas.length}</div>
              <div className="text-sm text-gray-600">Design Ideas</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">94%</div>
              <div className="text-sm text-gray-600">Match Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Product Suggestions ({recommendations.products.length})
          </button>
          <button
            onClick={() => setActiveTab('combos')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'combos'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Outfit Combos ({recommendations.combos.length})
          </button>
          <button
            onClick={() => setActiveTab('designs')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'designs'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Design Ideas ({recommendations.designIdeas.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.products.map((product, index) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} index={index} />
                <div className="absolute top-3 left-3">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Pick</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'combos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.combos.map((combo, index) => (
              <div key={combo.id} className="relative">
                <ComboCard combo={combo} index={index} />
                <div className="absolute top-3 left-3">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Brain className="h-3 w-3" />
                    <span>AI Match</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'designs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.designIdeas.map((idea, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{idea.title}</h3>
                    <p className="text-sm text-gray-600">AI Generated</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{idea.description}</p>
                
                {idea.colors && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Suggested Colors:</p>
                    <div className="flex space-x-2">
                      {idea.colors.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-6 h-6 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveToWishlist(idea.id)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
                    Create Design
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'products' && recommendations.products.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No product suggestions yet</h3>
            <p className="text-gray-600 mb-4">Browse more products to get personalized recommendations</p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
              Browse Products
            </button>
          </div>
        )}

        {activeTab === 'combos' && recommendations.combos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No combo recommendations yet</h3>
            <p className="text-gray-600 mb-4">Explore MonoFit combos to get AI-powered suggestions</p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
              Explore Combos
            </button>
          </div>
        )}

        {activeTab === 'designs' && recommendations.designIdeas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No design ideas yet</h3>
            <p className="text-gray-600 mb-4">Use the AI prompt above to generate custom design suggestions</p>
            <button
              onClick={() => setPromptInput('Create a minimalist design for a t-shirt')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Try Example Prompt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAISuggestions;