import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProductCard = ({ product, index = 0 }) => {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      product,
      quantity: 1,
      size: product.sizes[0],
      color: product.colors[0]
    });

    toast.success('Added to cart!');
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(product.id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      <Link to={`/product/${product.id}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {product.isMonoFit && (
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>MonoFit</span>
              </span>
            )}
            {product.stock < 10 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Low Stock
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full shadow-lg transition-colors ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Quick Add Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-between items-center text-white text-sm">
              <span>Quick Add</span>
              <div className="flex space-x-1">
                {product.sizes.slice(0, 4).map((size) => (
                  <span key={size} className="px-2 py-1 bg-white/20 rounded text-xs">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{product.rating}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">${product.price}</span>
              <span className="text-xs text-gray-500">{product.reviews} reviews</span>
            </div>

            <div className="flex space-x-1">
              {product.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border-2 border-gray-200"
                  style={{
                    backgroundColor:
                      color.toLowerCase() === 'white' ? '#ffffff' :
                      color.toLowerCase() === 'black' ? '#000000' :
                      color.toLowerCase() === 'navy' ? '#1f2937' :
                      color.toLowerCase() === 'gray' ? '#6b7280' :
                      color.toLowerCase() === 'red' ? '#ef4444' :
                      color.toLowerCase() === 'blue' ? '#3b82f6' :
                      '#8b5cf6'
                  }}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
