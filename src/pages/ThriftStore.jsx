import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Plus, SlidersHorizontal, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import ThriftCard from '../components/thrift/ThriftCard';
import UploadForm from '../components/thrift/UploadForm';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const ThriftStore = () => {
  const { 
    thriftItems, 
    setThriftItems, 
    thriftFilters, 
    setThriftFilters, 
    resetThriftFilters,
    user 
  } = useStore();
  
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'All', 'T-Shirts', 'Hoodies', 'Jackets', 'Pants', 'Shorts', 
    'Dresses', 'Skirts', 'Shoes', 'Accessories', 'Bags', 'Coats'
  ];

  const conditions = [
    { value: 'all', label: 'All Conditions' },
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];

  const sizes = [
    'All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
    '5', '6', '7', '8', '9', '10', '11', '12', 'One Size'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  useEffect(() => {
    loadThriftItems();
  }, [thriftFilters]);

  const loadThriftItems = async () => {
    setIsLoading(true);
    try {
      const items = await api.getThriftItems(thriftFilters);
      setThriftItems(items);
    } catch (error) {
      toast.error('Failed to load thrift items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setThriftFilters({ [key]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the filter effect
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    toast.success('Item uploaded successfully! It will be reviewed and published soon.');
    loadThriftItems();
  };

  if (showUploadForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <UploadForm
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Thrift Store</h1>
              <p className="text-gray-600">Discover unique pre-loved fashion items</p>
            </div>
            
            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUploadForm(true)}
                className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold flex items-center space-x-2 hover:from-purple-700 hover:to-blue-700 transition-colors shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Sell Item</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search thrift items..."
                value={thriftFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'women', 'men', 'unisex'].map(gender => (
              <button
                key={gender}
                onClick={() => handleFilterChange('gender', gender)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  thriftFilters.gender === gender
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>

              <select
                value={thriftFilters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {thriftItems.length} items found
              </span>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Category</h3>
                  <select
                    value={thriftFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category.toLowerCase() === 'all' ? 'all' : category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Condition</h3>
                  <select
                    value={thriftFilters.condition}
                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {conditions.map(condition => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Size</h3>
                  <select
                    value={thriftFilters.size}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {sizes.map(size => (
                      <option key={size} value={size.toLowerCase() === 'all' ? 'all' : size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={thriftFilters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600">
                      $0 - ${thriftFilters.priceRange[1]}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={resetThriftFilters}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Items Grid */}
        {!isLoading && thriftItems.length > 0 && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {thriftItems.map((item, index) => (
              <ThriftCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && thriftItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={resetThriftFilters}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Trending Section */}
        {!isLoading && thriftItems.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {thriftItems
                .filter(item => item.isBoosted)
                .slice(0, 4)
                .map((item, index) => (
                  <ThriftCard key={item.id} item={item} index={index} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThriftStore;
