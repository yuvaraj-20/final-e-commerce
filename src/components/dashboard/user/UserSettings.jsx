import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, Share2, Filter, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import { useStore } from '../../../store/useStore';
import ProductCard from '../../common/ProductCard';
import ThriftCard from '../../thrift/ThriftCard';
import ComboCard from '../../monofit/ComboCard';
import toast from 'react-hot-toast';

const UserWishlist = () => {
  const { user, wishlist, toggleWishlist, addToCart } = useStore();
  const [wishlistItems, setWishlistItems] = useState({
    products: [],
    thriftItems: [],
    combos: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (user && wishlist.length > 0) {
      loadWishlistItems();
    } else {
      setIsLoading(false);
    }
  }, [user, wishlist]);

  const loadWishlistItems = async () => {
    if (!user || wishlist.length === 0) return;
    
    setIsLoading(true);
    try {
      const data = await api.getWishlistItems(wishlist);
      setWishlistItems(data);
    } catch (error) {
      console.error('Failed to load wishlist items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWishlist = (itemId) => {
    toggleWishlist(itemId);
    toast.success('Removed from wishlist');
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    
    wishlistItems.products.forEach(product => {
      addToCart({
        product,
        quantity: 1,
        size: product.sizes[0],
        color: product.colors[0]
      });
      addedCount++;
    });

    wishlistItems.combos.forEach(combo => {
      combo.items.forEach(item => {
        addToCart({
          product: item,
          quantity: 1,
          size: item.sizes[0],
          color: item.colors[0]
        });
        addedCount++;
      });
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} items to cart!`);
    }
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'products':
        return { products: wishlistItems.products, thriftItems: [], combos: [] };
      case 'thrift':
        return { products: [], thriftItems: wishlistItems.thriftItems, combos: [] };
      case 'combos':
        return { products: [], thriftItems: [], combos: wishlistItems.combos };
      default:
        return wishlistItems;
    }
  };

  const currentItems = getCurrentItems();
  const totalItems = currentItems.products.length + currentItems.thriftItems.length + currentItems.combos.length;

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
          <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
          <p className="text-gray-600">Items you've saved for later</p>
        </div>
        
        {totalItems > 0 && (
          <button
            onClick={handleAddAllToCart}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Add All to Cart</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{wishlistItems.products.length}</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{wishlistItems.thriftItems.length}</div>
              <div className="text-sm text-gray-600">Thrift Items</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{wishlistItems.combos.length}</div>
              <div className="text-sm text-gray-600">Combos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items ({totalItems})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Products ({wishlistItems.products.length})
            </button>
            <button
              onClick={() => setActiveTab('thrift')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'thrift'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Thrift ({wishlistItems.thriftItems.length})
            </button>
            <button
              onClick={() => setActiveTab('combos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'combos'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Combos ({wishlistItems.combos.length})
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {totalItems} items in wishlist
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
      </div>

      {/* Items Grid */}
      {totalItems > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {/* Products */}
          {currentItems.products.map((product, index) => (
            <div key={`product-${product.id}`} className="relative">
              <ProductCard product={product} index={index} />
              <button
                onClick={() => handleRemoveFromWishlist(product.id)}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Thrift Items */}
          {currentItems.thriftItems.map((item, index) => (
            <div key={`thrift-${item.id}`} className="relative">
              <ThriftCard item={item} index={index} />
              <button
                onClick={() => handleRemoveFromWishlist(item.id)}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Combos */}
          {currentItems.combos.map((combo, index) => (
            <div key={`combo-${combo.id}`} className="relative">
              <ComboCard combo={combo} index={index} viewMode={viewMode} />
              <button
                onClick={() => handleRemoveFromWishlist(combo.id)}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'all' ? 'Your wishlist is empty' : `No ${activeTab} in wishlist`}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'all' 
              ? 'Start adding items you love to your wishlist'
              : `Browse ${activeTab} and add items to your wishlist`}
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default UserWishlist;