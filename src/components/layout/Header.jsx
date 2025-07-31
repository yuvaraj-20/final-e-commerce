// src/components/Header.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, MessageCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollFade } from '../hooks/useScrollFade';

const Header = () => {
  const location = useLocation();
  const {
    cart,
    wishlist,
    user,
    isMobileMenuOpen,
    setMobileMenuOpen,
    searchQuery,
    setSearchQuery
  } = useStore();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'MonoFit', href: '/monofit' },
    { name: 'Thrift', href: '/thrift' },
    { name: 'Design', href: '/design' },
  ];

  const isActive = (path) => location.pathname === path;
  const isScrolled = useScrollFade();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={isScrolled ? { opacity: 1, y: 0 } : { opacity: 0.95, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/10 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-white/10 p-2 rounded-full backdrop-blur-md border border-white/20"
            >
              <MessageCircle className="h-5 w-5 text-black" />
            </motion.div>
            <span className="text-lg font-semibold tracking-wider text-black uppercase">
              AI Fashion
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-6 text-sm font-light uppercase tracking-wide">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`transition-all px-2 py-1 ${
                  isActive(item.href)
                    ? 'text-black border-b border-black'
                    : 'text-black/70 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden md:flex w-full max-w-md mx-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/90 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-white/10 text-black placeholder-white/40 border border-white/20 focus:ring-2 focus:ring-white outline-none transition backdrop-blur-md"
            />
          </div>

          {/* User actions + Lang/Currency */}
          <div className="hidden md:flex items-center gap-4 text-black80">
            <Link to="/chat" className="hover:text-white">
              <MessageCircle className="h-5 w-5" />
            </Link>
            <Link to="/wishlist" className="relative hover:text-white">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white h-4 w-4 flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative hover:text-white">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 text-xs bg-white text-black h-4 w-4 flex items-center justify-center rounded-full">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
            <Link to="/dashboard" className="hover:text-white">
              <User className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <select className="bg-transparent text-white/70 border-none outline-none cursor-pointer hover:text-white">
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="de">DE</option>
              </select>
              <span>|</span>
              <select className="bg-transparent text-white/70 border-none outline-none cursor-pointer hover:text-white">
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="inr">INR</option>
              </select>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white/10 backdrop-blur-lg border-t border-white/10"
          >
            <div className="p-4 space-y-2 text-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 backdrop-blur-sm"
                />
              </div>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md ${
                    isActive(item.href)
                      ? 'text-white border-b border-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex justify-around pt-4 border-t border-white/10 mt-2">
                <Link to="/chat" className="text-white/80 hover:text-white flex flex-col items-center text-sm">
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat</span>
                </Link>
                <Link to="/wishlist" className="text-white/80 hover:text-white flex flex-col items-center text-sm relative">
                  <Heart className="h-5 w-5" />
                  <span>Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs bg-red-500 text-white h-4 w-4 flex items-center justify-center rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="text-white/80 hover:text-white flex flex-col items-center text-sm relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs bg-white text-black h-4 w-4 flex items-center justify-center rounded-full">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </Link>
                <Link to="/dashboard" className="text-white/80 hover:text-white flex flex-col items-center text-sm">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;