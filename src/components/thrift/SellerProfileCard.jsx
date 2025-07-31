import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageCircle, Calendar, Award, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const SellerProfileCard = ({ seller, onMessageClick, compact = false }) => {
  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <img
          src={seller.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'}
          alt={seller.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">{seller.name}</h3>
            {seller.isVerified && (
              <Award className="h-4 w-4 text-blue-500" />
            )}
          </div>
          {seller.rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{seller.rating}</span>
              <span className="text-sm text-gray-500">
                ({seller.totalSales} sales)
              </span>
            </div>
          )}
        </div>
        {onMessageClick && (
          <button
            onClick={onMessageClick}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={seller.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'}
          alt={seller.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900">{seller.name}</h2>
            {seller.isVerified && (
              <Award className="h-5 w-5 text-blue-500" />
            )}
          </div>

          {seller.rating && (
            <div className="flex items-center space-x-1 mb-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium text-gray-900">{seller.rating}</span>
              <span className="text-gray-600">({seller.totalSales} sales)</span>
            </div>
          )}

          <div className="flex items-center space-x-1 text-gray-600 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Joined {formatJoinDate(seller.joinedAt || '')}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {seller.bio && (
        <p className="text-gray-700 mb-4">{seller.bio}</p>
      )}

      {/* Badges */}
      {seller.badges && seller.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {seller.badges.map((badge, index) => (
            <span
              key={index}
              className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <ShoppingBag className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{seller.totalSales || 0}</div>
          <div className="text-sm text-gray-600">Items Sold</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{seller.rating || 'N/A'}</div>
          <div className="text-sm text-gray-600">Rating</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <Link
          to={`/seller/${seller.id}`}
          className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
        >
          View Profile
        </Link>

        {onMessageClick && (
          <button
            onClick={onMessageClick}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Message</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default SellerProfileCard;
