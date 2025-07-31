import React, { useState, useEffect } from 'react';
import { Plus, Heart, MessageCircle, Share2, Edit, Trash2, Image, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import { useStore } from '../../../store/useStore';
import toast from 'react-hot-toast';

const UserCommunity = () => {
  const { user, communityPosts, setCommunityPosts } = useStore();
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    images: [],
    type: 'general',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (user) {
      loadMyPosts();
    }
  }, [user]);

  const loadMyPosts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await api.getUserCommunityPosts(user.id);
      setMyPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
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
      setMyPosts([post, ...myPosts]);
      setCommunityPosts([post, ...communityPosts]);
      setNewPost({ content: '', images: [], type: 'general', tags: [] });
      setShowCreateModal(false);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.deletePost(postId);
      setMyPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newPost.tags.includes(newTag.trim())) {
      setNewPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
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
          <h2 className="text-2xl font-bold text-gray-900">My Community Posts</h2>
          <p className="text-gray-600">Share your style and connect with the fashion community</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{myPosts.length}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {myPosts.reduce((sum, post) => sum + post.likes, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {myPosts.reduce((sum, post) => sum + post.comments, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Comments</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Share2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {myPosts.reduce((sum, post) => sum + post.shares, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Shares</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Post</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Type
                </label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="style-tip">Style Tip</option>
                  <option value="review">Review</option>
                  <option value="find">Find</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your style inspiration, tips, or outfit details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
              >
                Share Post
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* My Posts */}
      <div className="space-y-4">
        {myPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                    {user?.badges?.map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                      >
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
              
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-800 leading-relaxed mb-4">{post.content}</p>
            
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {post.images.slice(0, 4).map((image, imageIndex) => (
                  <img
                    key={imageIndex}
                    src={image}
                    alt={`Post image ${imageIndex + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
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
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="h-4 w-4" />
                  <span>{post.shares}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                {post.likes + post.comments + post.shares} interactions
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {myPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">
            Share your first style post with the community!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
          >
            Create Your First Post
          </button>
        </div>
      )}
    </div>
  );
};

export default UserCommunity;