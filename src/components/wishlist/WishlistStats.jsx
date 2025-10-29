import React from 'react';
import { Heart, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const WishlistStats = ({
  totalItems,
  productsCount,
  thriftCount,
  combosCount,
  totalValue = 0
}) => {
  const stats = [
    {
      title: 'Total Items',
      value: totalItems,
      icon: Heart,
      color: 'from-red-500 to-pink-500'
    },
    {
      title: 'Products',
      value: productsCount,
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Thrift Items',
      value: thriftCount,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Combos',
      value: combosCount,
      icon: Heart,
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WishlistStats;