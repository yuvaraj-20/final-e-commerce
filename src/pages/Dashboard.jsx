import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Navigate } from 'react-router-dom';
import UserDashboard from '../components/dashboard/user/UserDashboard';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useStore();
  console.log('Dashboard user:', user);
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