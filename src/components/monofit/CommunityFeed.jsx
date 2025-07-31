import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, Plus, Filter, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import { useStore } from '../../../store/useStore';
import toast from 'react-hot-toast';

const CommunityFeed = () => {
  const { user, communityPosts, setCommunityPosts } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [feedFilter, setFeedFilter] = useState('all');
  const [newPost, setNewPost] = useState({
    content: '',
    images: [],
    linkedComboId: '',
    type: 'general'
  });

  useEffect(() => {
    loadCommunityPosts();
  }, [feedFilter]);

  const loadCommunityPosts = async () => {
    setIsLoading(true);
    try {
      const posts = await api.getCommunityPosts({
        type: feedFilter === 'all' ? undefined : feedFilter,
        sortBy: feedFilter === 'trending' ? 'trending' : 'newest'
      });
      setCommunityPosts(posts);
    } catch (error) {
      toast.error('Failed to load community posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast.error('Please login to create posts');
      return;
    }
    if (!newPost.content.trim()) {
      toast.error('Please enter post content');
      return;
    }
    try {
      const post = await api.createCommunityPost(newPost, user.id);
      setCommunityPosts([post, ...communityPosts]);
      setNewPost({ content: '', images: [], linkedComboId: '', type: 'general' });
      setShowCreatePost(false);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleLikePost = async (postId) => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }
    try {
      await api.likePost(postId, user.id);
      setCommunityPosts(
        communityPosts.map(post =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Community Looks</h1>
            <p className="text-green-100">Share your style, get inspired, and connect with fashion enthusiasts</p>
          </div>
          {user && (
            <button onClick={() => setShowCreatePost(true)} className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transition-colors">
              <Plus className="h-5 w-5" />
              <span>Share Look</span>
            </button>
          )}
        </div>
      </div>

      {/* Feed Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {['all', 'trending', 'following'].map(filter => (
              <button
                key={filter}
                onClick={() => setFeedFilter(filter)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  feedFilter === filter
                    ? filter === 'trending'
                      ? 'bg-orange-500 text-white'
                      : filter === 'following'
                      ? 'bg-blue-600 text-white'
                      : 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'trending' && <TrendingUp className="h-4 w-4 inline-block mr-1" />}
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{communityPosts.length} posts</span>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Share Your Look</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="style-tip">Style Tip</option>
                  <option value="review">Review</option>
                  <option value="find">Find</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What's on your mind?</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your style inspiration, tips, or outfit details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowCreatePost(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleCreatePost} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors">Share</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : communityPosts.length > 0 ? (
        <div className="space-y-6">
          {communityPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6 pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <img src={post.userAvatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'} alt={post.userName} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{post.userName}</h3>
                      {post.userBadges?.map((badge, i) => (
                        <span key={i} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Award className="h-3 w-3" />
                          <span>{badge}</span>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{formatTimeAgo(post.createdAt)}</span>
                      <span>•</span>
                      <span className="capitalize">{post.type.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed">{post.content}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              {post.images && post.images.length > 0 && (
                <div className="px-6 pb-4">
                  <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {post.images.slice(0, 4).map((image, i) => (
                      <div key={i} className={`relative overflow-hidden rounded-lg ${post.images.length === 3 && i === 0 ? 'col-span-2' : ''}`}>
                        <img src={image} alt={`Post image ${i + 1}`} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" />
                        {post.images.length > 4 && i === 3 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">+{post.images.length - 4} more</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button onClick={() => handleLikePost(post.id)} className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                      <Heart className="h-5 w-5" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                      <Share2 className="h-5 w-5" />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">{post.likes + post.comments + post.shares} interactions</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share your style with the community!</p>
          {user && (
            <button onClick={() => setShowCreatePost(true)} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors">Create First Post</button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
