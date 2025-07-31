import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, ArrowLeft, Star, Eye, Calendar, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useStore } from '../../store/useStore';
import SellerProfileCard from '../components/thrift/SellerProfileCard';
import ChatWidget from '../components/thrift/ChatWidget';
import ThriftCard from '../components/thrift/ThriftCard';
import toast from 'react-hot-toast';

const ThriftItemDetail = () => {
  const { id } = useParams();
  const { user, likedThriftItems, toggleThriftLike } = useStore();
  
  const [item, setItem] = useState(null);
  const [seller, setSeller] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatConversation, setChatConversation] = useState(null);

  const isLiked = item ? likedThriftItems.includes(item.id) : false;

  useEffect(() => {
    if (id) {
      loadItemDetails();
    }
  }, [id]);

  const loadItemDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const itemData = await api.getThriftItem(id);
      if (itemData) {
        setItem(itemData);
        
        // Load seller profile
        const sellerData = await api.getSellerProfile(itemData.sellerId);
        setSeller(sellerData);
        
        // Load related items
        const related = await api.getThriftRecommendations(user?.id || '', itemData.id);
        setRelatedItems(related);
      }
    } catch (error) {
      toast.error('Failed to load item details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!item || !user) {
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

  const handleStartChat = async () => {
    if (!item || !user) {
      toast.error('Please login to chat with seller');
      return;
    }

    try {
      const conversation = await api.startConversation(item.sellerId, user.id, item.id);
      setChatConversation(conversation);
      setShowChat(true);
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.name,
          text: item?.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
          <Link
            to="/thrift"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Back to Thrift Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/thrift"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Thrift Store</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg"
            >
              <img
                src={item.images[currentImageIndex]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            {item.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? 'border-purple-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{item.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{item.likes} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ${item.price}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(item.condition)}`}>
                    {formatCondition(item.condition)}
                  </span>
                </div>
              </div>

              {/* Item Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-600">Size</span>
                  <div className="font-medium text-gray-900">{item.size}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Category</span>
                  <div className="font-medium text-gray-900">{item.category}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Color</span>
                  <div className="font-medium text-gray-900">{item.color}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Gender</span>
                  <div className="font-medium text-gray-900 capitalize">{item.gender}</div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              </div>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    isLiked
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>

              <button
                onClick={handleStartChat}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Chat with Seller</span>
              </button>
            </div>

            {/* Trust & Safety */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Trust & Safety</h4>
                  <p className="text-sm text-blue-700">
                    All items are reviewed before listing. Meet in public places and inspect items before purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Profile */}
        {seller && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Seller</h2>
            <SellerProfileCard seller={seller} onMessageClick={handleStartChat} />
          </div>
        )}

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((relatedItem, index) => (
                <ThriftCard key={relatedItem.id} item={relatedItem} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Widget */}
      {showChat && chatConversation && (
        <ChatWidget
          conversation={chatConversation}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default ThriftItemDetail;