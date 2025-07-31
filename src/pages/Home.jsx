// src/pages/Home.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Heart,
  Palette,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/common/ProductCard';
import HeroCarousel from '../components/home/HeroCarousel';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import NewArrivalsCarousel from '../components/home/NewArrivalsCarousel';
import About from '../components/home/About';

const Home = () => {
  const { products, setProducts } = useStore();

  useEffect(() => {
    api.getProducts().then(setProducts);
  }, [setProducts]);

  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(-6);

  const features = [
    {
      icon: Palette,
      title: '3D Custom Design',
      description: 'Create unique designs with our AI-powered 3D mockup tool',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'MonoFit Sets',
      description: 'Perfectly matched outfit combinations curated by AI',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Heart,
      title: 'Thrift Store',
      description: 'Sustainable fashion marketplace for pre-loved items',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: MessageSquare,
      title: 'AI Style Assistant',
      description: '24/7 AI-powered fashion advice and recommendations',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <HeroCarousel />

      <motion.section
        className="py-20 bg-gray-50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Revolutionary Fashion Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how AI transforms the way you shop, design, and express your style
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* New Arrivals Carousel */}
      <motion.section
        className="py-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            New Arrivals
          </h2>
          <NewArrivalsCarousel items={newArrivals} />
        </div>
      </motion.section>

      <motion.section
        className="py-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">Handpicked items just for you</p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold"
            >
              <span>View All Products</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              ['10K+', 'Happy Customers'],
              ['50K+', 'Custom Designs'],
              ['25K+', 'Thrift Items'],
              ['99%', 'Satisfaction Rate'],
            ].map(([value, label], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold mb-2">{value}</div>
                <div className="text-purple-200">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-20 bg-gray-900 text-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Style?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of fashion enthusiasts who've discovered the future of personal style
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chat"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Chat with AI Stylist</span>
            </Link>

            <Link
              to="/thrift"
              className="border-2 border-gray-600 hover:border-white text-gray-300 hover:text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Explore Thrift Store</span>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
