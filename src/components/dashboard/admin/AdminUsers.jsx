import React, { useState, useEffect } from 'react';
import { Search, Filter, UserCheck, UserX, Crown, Shield, Eye, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    if (!confirm('Are you sure you want to ban this user?')) return;

    try {
      await api.banUser(userId);
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'banned' }
          : user
      ));
      toast.success('User banned successfully!');
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handlePromoteUser = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      toast.success('User role updated!');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const roles = ['all', 'customer', 'seller', 'admin'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
              </div>
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
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
          <span className="font-medium">{users.length} total users</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {roles.slice(1).map(role => {
          const count = users.filter(user => user.role === role).length;
          return (
            <div key={role} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${
                  role === 'admin' ? 'bg-purple-100' :
                  role === 'seller' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {role === 'admin' ? (
                    <Crown className="h-6 w-6 text-purple-600" />
                  ) : role === 'seller' ? (
                    <Shield className="h-6 w-6 text-blue-600" />
                  ) : (
                    <UserCheck className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{role}s</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredUsers.length} users found
            </span>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={user.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  {user.isVerified && (
                    <UserCheck className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{user.email}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {user.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{user.bio}</p>
            )}

            {user.badges && user.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {user.badges.slice(0, 3).map((badge, badgeIndex) => (
                  <span
                    key={badgeIndex}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {badge}
                  </span>
                ))}
                {user.badges.length > 3 && (
                  <span className="text-xs text-gray-500">+{user.badges.length - 3}</span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-600">Joined</p>
                <p className="font-medium text-gray-900">
                  {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Rating</p>
                <p className="font-medium text-gray-900">
                  {user.rating ? `${user.rating}/5` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
              
              <select
                value={user.role}
                onChange={(e) => handlePromoteUser(user.id, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
              
              <button
                onClick={() => handleBanUser(user.id)}
                className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                <UserX className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;