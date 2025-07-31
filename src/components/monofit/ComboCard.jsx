import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, ShoppingCart, Share2, Zap, Flame,
  TrendingUp, Eye, Star
} from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ComboCard = ({ combo, index = 0, viewMode = 'grid' }) => {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const isWishlisted = wishlist.includes(combo.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    combo.items.forEach(item => {
      addToCart({
        product: item,
        quantity: 1,
        size: item.sizes[0],
        color: item.colors[0]
      });
    });

    toast.success('Combo added to cart!');
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(combo.id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/monofit/${combo.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: combo.name,
          text: combo.description,
          url,
        });
      } catch (error) {
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const totalPrice = combo.items.reduce((sum, item) => sum + item.price, 0);
  const discountedPrice = combo.discountPercentage
    ? totalPrice * (1 - combo.discountPercentage / 100)
    : totalPrice;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
      >
        <Link to={`/monofit/${combo.id}`}>
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-1/3">
              <div className="aspect-square md:aspect-auto md:h-64 overflow-hidden">
                <img
                  src={combo.images[0]}
                  alt={combo.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="absolute top-3 left-3 flex flex-col space-y-2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>MonoFit</span>
                </span>
                {combo.isTrending && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Flame className="h-3 w-3" />
                    <span>Trending</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                    {combo.name}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{combo.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {combo.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right ml-4">
                  {combo.discountPercentage && (
                    <span className="text-sm text-gray-500 line-through">
                      ${totalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-gray-900">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  {combo.discountPercentage && (
                    <span className="text-sm text-green-600 font-medium">
                      {combo.discountPercentage}% off
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{combo.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{combo.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span>{combo.rating}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleToggleWishlist}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    isWishlisted
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add Combo</span>
                </button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      <Link to={`/monofit/${combo.id}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={combo.images[0]}
            alt={combo.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>MonoFit</span>
            </span>
            {combo.isTrending && (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
              >
                <Flame className="h-3 w-3" />
                <span>Trending</span>
              </motion.span>
            )}
            {combo.discountPercentage && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                {combo.discountPercentage}% OFF
              </span>
            )}
          </div>

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
              onClick={handleShare}
              className="p-2 bg-white text-gray-600 rounded-full shadow-lg hover:bg-blue-50 hover:text-blue-500 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-between items-center text-white text-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{combo.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{combo.views}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>{combo.rating}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1 flex-1">
              {combo.name}
            </h3>
            <div className="text-right ml-2">
              {combo.discountPercentage && (
                <span className="text-sm text-gray-500 line-through block">
                  ${totalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-lg font-bold text-gray-900">
                ${discountedPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{combo.description}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            {combo.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {combo.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{combo.tags.length - 3}</span>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{combo.items.length} items</span>
              <div className="flex -space-x-2">
                {combo.items.slice(0, 3).map((item, index) => (
                  <img
                    key={index}
                    src={item.images[0]}
                    alt={item.name}
                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">{combo.occasion}</div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Add Combo to Cart</span>
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

export default ComboCard;
