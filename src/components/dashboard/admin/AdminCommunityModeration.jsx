import React, { useState, useEffect } from 'react';
import { Search, Filter, Flag, Check, X, Eye, MessageSquare, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const AdminCommunityModeration = () => {
  const [posts, setPosts] = useState([]);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
    loadFlaggedPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCommunityPosts();
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFlaggedPosts = async () => {
    try {
      const data = await api.getFlaggedPosts();
      setFlaggedPosts(data);
    } catch (error) {
      console.error('Failed to load flagged posts:', error);
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      await api.approvePost(postId);
      setFlaggedPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post approved!');
    } catch (error) {
      toast.error('Failed to approve post');
    }
  };

  const handleRemovePost = async (postId) => {
    if (!confirm('Are you sure you want to remove this post?')) return;

    try {
      await api.removePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      setFlaggedPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post removed!');
    } catch (error) {
      toast.error('Failed to remove post');
    }
  };

  const handleFlagPost = async (postId) => {
    try {
      await api.flagPost(postId);
      toast.success('Post flagged for review!');
    } catch (error) {
      toast.error('Failed to flag post');
    }
  };

  const currentPosts = activeTab === 'all' ? posts : flaggedPosts;
  const filteredPosts = currentPosts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="w-1/4 h-4 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/6 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Moderation</h2>
          <p className="text-gray-600">Monitor and moderate community posts and comments</p>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
            <span className="font-medium">{flaggedPosts.length} flagged posts</span>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
            <span className="font-medium">{posts.length} total posts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'flagged'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Flagged Posts ({flaggedPosts.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow ${
              activeTab === 'flagged' ? 'border-l-4 border-red-500' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              <img
                src={post.userAvatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'}
                alt={post.userName}
                className="w-12 h-12 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{post.userName}</h3>
                  {post.userBadges && post.userBadges.map((badge, badgeIndex) => (
                    <span
                      key={badgeIndex}
                      className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {badge}
                    </span>
                  ))}
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-gray-800 mb-3">{post.content}</p>
                
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {post.images.slice(0, 4).map((image, imageIndex) => (
                      <img
                        key={imageIndex}
                        src={image}
                        alt={`Post image ${imageIndex + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                  <span className="capitalize">{post.type.replace('-', ' ')}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                
                {activeTab === 'flagged' ? (
                  <>
                    <button
                      onClick={() => handleApprovePost(post.id)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemovePost(post.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleFlagPost(post.id)}
                      className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemovePost(post.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'flagged' ? 'No flagged posts' : 'No posts found'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'flagged' 
              ? 'All posts are currently approved' 
              : 'Try adjusting your search terms'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCommunityModeration;