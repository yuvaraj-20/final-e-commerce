import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Star, Zap } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const ThriftCard = ({ item, index = 0 }) => {
  const { likedThriftItems, toggleThriftLike, user } = useStore();
  const isLiked = likedThriftItems.includes(item.id);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to like items');
      return;
    }

    try {
      await api.toggleThriftLike(item.id, user.id);
      toggleThriftLike(item.id);
      toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'like-new': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCondition = (condition) => {
    return condition.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      <Link to={`/thrift/${item.id}`}>
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square">
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
              {formatCondition(item.condition)}
            </span>
            {item.isBoosted && (
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Boosted</span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`p-2 rounded-full shadow-lg transition-colors ${
                isLiked
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Stats Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex justify-between items-center text-white text-sm">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{item.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{item.views}</span>
                </div>
              </div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {item.size}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1 flex-1">
              {item.name}
            </h3>
            <span className="text-lg font-bold text-gray-900 ml-2">
              ${item.price}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>

          {/* Seller Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src={item.sellerAvatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'}
                alt={item.sellerName}
                className="w-6 h-6 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {item.sellerName}
                </span>
                {item.sellerRating && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">{item.sellerRating}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{item.tags.length - 2}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ThriftCard;
