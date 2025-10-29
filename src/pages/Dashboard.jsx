// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import UserDashboard from '../components/dashboard/user/UserDashboard';
import AdminDashboard from '../components/dashboard/admin/AdminDashboard';
import { motion } from 'framer-motion';

const Dashboard = () => {
  // Use both auth sources for flexibility - prioritize useStore for consistency
  const { user: storeUser } = useStore();
  const { user: authUser } = useAuth();
  
  // Use store user first, fallback to auth user
  const user = storeUser || authUser;
  
  console.log('Dashboard user (from useStore):', storeUser);
  console.log('Dashboard user (from useAuth):', authUser);
  console.log('Final user:', user);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
};

export default Dashboard;