import React, { useState, useEffect } from 'react';
import { Filter, Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/common/ProductCard';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';

const Products = () => {
  const { products, setProducts, searchQuery, filters, setFilters } = useStore();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const categories = ['All', 'T-Shirts', 'Hoodies', 'Jackets', 'Shorts', 'Sets'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue'];

  useEffect(() => {
    api.getProducts(filters).then(setProducts);
  }, [filters, setProducts]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filters.category || filters.category === 'All' || product.category === filters.category;
    const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
    const matchesSizes = filters.sizes.length === 0 || filters.sizes.some(size => product.sizes.includes(size));
    const matchesColors = filters.colors.length === 0 || filters.colors.some(color => product.colors.includes(color));
    const matchesRating = product.rating >= filters.rating;

    return matchesSearch && matchesCategory && matchesPrice && matchesSizes && matchesColors && matchesRating;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare(a.id);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleCategoryFilter = (category) => {
    setFilters({ category: category === 'All' ? '' : category });
  };

  const handleSizeFilter = (size, checked) => {
    const newSizes = checked
      ? [...filters.sizes, size]
      : filters.sizes.filter(s => s !== size);
    setFilters({ sizes: newSizes });
  };

  const handleColorFilter = (color, checked) => {
    const newColors = checked
      ? [...filters.colors, color]
      : filters.colors.filter(c => c !== color);
    setFilters({ colors: newColors });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 1000],
      sizes: [],
      colors: [],
      rating: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          <p className="text-gray-600">Discover our collection of premium fashion items</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    (filters.category === category || (category === 'All' && !filters.category))
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>

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

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters({ priceRange: [0, parseInt(e.target.value)] })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600">$0 - ${filters.priceRange[1]}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Sizes</h3>
                  {sizes.map(size => (
                    <label key={size} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.sizes.includes(size)}
                        onChange={(e) => handleSizeFilter(size, e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{size}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Colors</h3>
                  {colors.map(color => (
                    <label key={color} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color)}
                        onChange={(e) => handleColorFilter(color, e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{color}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Minimum Rating</h3>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ rating: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Showing {sortedProducts.length} of {products.length} products
          </p>
        </div>

        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {sortedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;