import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages

import Home from './pages/Home';

import Products from './pages/Products';
import CustomDesign from './pages/CustomDesign';
import ThriftStore from './pages/ThriftStore';
import ThriftItemDetail from './pages/ThriftItemDetail';
import MonoFit from './pages/MonoFit';
import About from './components/home/About';
import Dashboard from './pages/DashBoard';
// Mock data
import { useStore } from './store/useStore';
import {
  mockUser,
  mockProducts,
  mockThriftItems,
  mockMonofitCombos
} from './components/data/mockData';

function App() {
  const { setUser, setProducts, setThriftItems, setMonofitCombos } = useStore();

  useEffect(() => {
    setUser(mockUser);
    setProducts(mockProducts);
    setThriftItems(mockThriftItems);
    setMonofitCombos(mockMonofitCombos);
  }, [setUser, setProducts, setThriftItems, setMonofitCombos]);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/products" element={<Products />} />
            <Route path="/design" element={<CustomDesign />} />
            <Route path="/dashboard" element={<Dashboard />} />
           

            <Route path="/thrift" element={<ThriftStore />} />
            <Route path="/thrift/:id" element={<ThriftItemDetail />} />
            <Route path="/monofit" element={<MonoFit />} />
            <Route
              path="/chat"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-2xl font-bold">AI Chat Coming Soon!</h1>
                </div>
              }
            />
            <Route
              path="/cart"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-2xl font-bold">Shopping Cart Coming Soon!</h1>
                </div>
              }
            />
            <Route
              path="/wishlist"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-2xl font-bold">Wishlist Coming Soon!</h1>
                </div>
              }
            />
            <Route
              path="/product/:id"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-2xl font-bold">Product Details Coming Soon!</h1>
                </div>
              }
            />
            <Route
              path="/monofit/:id"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-2xl font-bold">MonoFit Combo Details Coming Soon!</h1>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
