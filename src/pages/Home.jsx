// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Heart,
  Palette,
  MessageSquare,
  TrendingUp,
  ShoppingCart,
  User,
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ProductCard from '../components/common/ProductCard';
import HeroCarousel from '../components/home/HeroCarousel';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext'; // Add authentication
import { api } from '../services/api';
import NewArrivalsCarousel from '../components/home/NewArrivalsCarousel';
import About from '../components/home/About';

const Home = () => {
  const { products, setProducts } = useStore();
  const { requireAuth, isLoggedIn, user } = useAuth(); // Add authentication hook
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate(); // <-- added to navigate programmatically

  useEffect(() => {
    api.getProducts().then(setProducts);
  }, [setProducts]);

  // -------------------------
  // NEW: global helper for header icon
  // Usage: call `window.openDashboardOrLogin()` from your header icon onClick.
  // Behavior: if logged in -> go to /dashboard, else -> go to /login
  // This is intentionally minimal and non-invasive so it doesn't change app nature.
  useEffect(() => {
    const openDashboardOrLogin = () => {
      // If user is already logged in, go directly to dashboard
      if (isLoggedIn) {
        navigate('/dashboard');
        return;
      }

      // If not logged in, navigate to login.
      // We use requireAuth where appropriate in other places; here we simply send to login page.
      navigate('/login');
    };

    // Attach to window so header (or any other non-React code) can call it:
    window.openDashboardOrLogin = openDashboardOrLogin;

    // cleanup on unmount
    return () => {
      try {
        delete window.openDashboardOrLogin;
      } catch (e) {
        // ignore
      }
    };
  }, [isLoggedIn, navigate]);
  // -------------------------

  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.slice(-6);

  // Authentication gate functions for featured products
  const handleAddToCart = (product, event) => {
    event?.stopPropagation(); // Prevent navigation
    requireAuth(() => {
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          const updated = prev.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          toast.success(`${product.name} quantity updated!`);
          return updated;
        } else {
          toast.success(`${product.name} added to cart!`);
          return [...prev, { ...product, quantity: 1 }];
        }
      });
    });
  };

  const handleAddToWishlist = (product, event) => {
    event?.stopPropagation(); // Prevent navigation
    requireAuth(() => {
      setWishlist(prev => {
        const isInWishlist = prev.some(item => item.id === product.id);
        if (isInWishlist) {
          toast.success(`${product.name} removed from wishlist!`);
          return prev.filter(item => item.id !== product.id);
        } else {
          toast.success(`${product.name} added to wishlist!`);
          return [...prev, product];
        }
      });
    });
  };

  const isInWishlist = (productId) => {
    return isLoggedIn && wishlist.some(item => item.id === productId);
  };

  // Handle feature navigation with auth gate where needed
  const handleFeatureClick = (feature) => {
    // Features that might require authentication in the future
    const authRequiredFeatures = ['AI Style Assistant'];
    
    if (authRequiredFeatures.includes(feature.title)) {
      requireAuth(() => {
        // Navigate to feature after authentication
        if (feature.title === 'AI Style Assistant') {
          window.location.href = '/chat';
        }
      });
    } else {
      // Navigate directly for public features
      const routes = {
        '3D Custom Design': '/design',
        'MonoFit Sets': '/monofit',
        'Thrift Store': '/thrift',
        'AI Style Assistant': '/chat'
      };
      const route = routes[feature.title];
      if (route) {
        window.location.href = route;
      }
    }
  };

  const features = [
    {
      icon: Palette,
      title: '3D Custom Design',
      description: 'Create unique designs with our AI-powered 3D mockup tool',
      color: 'from-purple-500 to-pink-500',
      route: '/design'
    },
    {
      icon: Zap,
      title: 'MonoFit Sets',
      description: 'Perfectly matched outfit combinations curated by AI',
      color: 'from-blue-500 to-cyan-500',
      route: '/monofit'
    },
    {
      icon: Heart,
      title: 'Thrift Store',
      description: 'Sustainable fashion marketplace for pre-loved items',
      color: 'from-green-500 to-emerald-500',
      route: '/thrift'
    },
    {
      icon: MessageSquare,
      title: 'AI Style Assistant',
      description: '24/7 AI-powered fashion advice and recommendations',
      color: 'from-orange-500 to-red-500',
      route: '/chat',
      requiresAuth: true // This feature requires authentication
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <HeroCarousel />

      {/* Welcome back message for logged-in users */}
      {isLoggedIn && user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Crown className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-purple-900 font-medium">
                    Welcome back, {user.name}! ✨
                  </p>
                  <p className="text-purple-600 text-sm">
                    Discover new arrivals and personalized recommendations
                  </p>
                </div>
              </div>
              
              {/* Quick stats for logged-in users */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-purple-600">
                {cart.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <ShoppingCart className="h-4 w-4" />
                    <span>{cart.reduce((total, item) => total + item.quantity, 0)} in cart</span>
                  </div>
                )}
                {wishlist.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{wishlist.length} in wishlist</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                onClick={() => handleFeatureClick(feature)}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-between">
                  {feature.title}
                  {feature.requiresAuth && !isLoggedIn && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      Login Required
                    </span>
                  )}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
                
                {/* Call to action */}
                <div className="mt-4 flex items-center text-purple-600 group-hover:text-purple-700 font-medium text-sm">
                  <span>
                    {feature.requiresAuth && !isLoggedIn ? 'Sign in to access' : 'Explore now'}
                  </span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
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
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              New Arrivals
            </h2>
            {!isLoggedIn && (
              <p className="text-gray-600">
                <Link to="#" onClick={(e) => { e.preventDefault(); requireAuth(() => {}); }} className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign in
                </Link> to add items to your cart and wishlist
              </p>
            )}
          </div>
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
              <div key={product.id} className="relative group">
                <ProductCard product={product} index={index} />
                
                {/* Authentication Gate - Cart and Wishlist Actions */}
                <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => handleAddToWishlist(product, e)}
                    className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                      isInWishlist(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-600 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart 
                      className="h-4 w-4" 
                      fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                  
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transition-all duration-200"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>

                {/* Quick Add to Cart button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>{isLoggedIn ? 'Add to Cart' : 'Sign in to Add'}</span>
                  </button>
                </motion.div>
              </div>
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
            <button
              onClick={() => requireAuth(() => { window.location.href = '/chat'; })}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
            >
              <MessageSquare className="h-5 w-5" />
              <span>
                {isLoggedIn ? 'Chat with AI Stylist' : 'Sign in for AI Stylist'}
              </span>
            </button>

            <Link
              to="/thrift"
              className="border-2 border-gray-600 hover:border-white text-gray-300 hover:text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Explore Thrift Store</span>
            </Link>
          </div>

          {/* Authentication encouragement */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-4 bg-gray-800 rounded-lg"
            >
              <p className="text-gray-300 text-sm">
                💡 Sign up to unlock personalized recommendations, save favorites, and get exclusive access to AI styling features
              </p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Floating cart/wishlist summary for logged-in users */}
      {isLoggedIn && (cart.length > 0 || wishlist.length > 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-xl p-4 shadow-lg max-w-xs z-40"
        >
          <div className="text-sm font-medium text-gray-900 mb-2">Your Items</div>
          <div className="space-y-1 text-sm text-gray-600">
            {cart.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <ShoppingCart className="h-3 w-3" />
                  <span>Cart:</span>
                </span>
                <span className="font-medium">{cart.reduce((total, item) => total + item.quantity, 0)} items</span>
              </div>
            )}
            {wishlist.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>Wishlist:</span>
                </span>
                <span className="font-medium">{wishlist.length} items</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex space-x-2">
            <Link
              to="/cart"
              className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              View Cart
            </Link>
            <Link
              to="/wishlist"
              className="flex-1 bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Wishlist
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
