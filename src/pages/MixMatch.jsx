// src/pages/MixAndMatchPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, ChevronRight, Search } from 'lucide-react';

// ✅ Safe loader for items (prevents JSON parse crash)
const loadSavedItems = () => {
  try {
    const saved = localStorage.getItem("mixMatchItems");
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error("Corrupt mixMatchItems in localStorage, resetting:", err);
  }
  return {
    top: [{ id: 'placeholder-top', name: 'Select a Top', color: 'bg-gray-200', image: null, price: null }],
    bottom: [{ id: 'placeholder-bottom', name: 'Select a Bottom', color: 'bg-gray-200', image: null, price: null }],
    shoes: [{ id: 'placeholder-shoes', name: 'Select Shoes', color: 'bg-gray-200', image: null, price: null }]
  };
};

const MixAndMatchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [savedLook, setSavedLook] = useState(false);

  const [currentItems, setCurrentItems] = useState({ top: 0, bottom: 0, shoes: 0 });

  // ✅ Load saved or fallback to placeholders
  const [items, setItems] = useState(loadSavedItems);

  // ✅ Keep items saved across navigations
  useEffect(() => {
    localStorage.setItem("mixMatchItems", JSON.stringify(items));
  }, [items]);

  // ✅ Handle product coming from /products
  useEffect(() => {
    if (location.state?.selectedProduct && location.state?.targetCategory) {
      const { selectedProduct, targetCategory } = location.state;

      setItems(prev => {
        const newItems = { ...prev };
        const existingIndex = newItems[targetCategory].findIndex(
          item => item.id === selectedProduct.id
        );

        if (existingIndex === -1) {
          newItems[targetCategory] = [
            ...newItems[targetCategory],
            { ...selectedProduct, isSelected: true }
          ];
          setCurrentItems(prev => ({
            ...prev,
            [targetCategory]: newItems[targetCategory].length - 1
          }));
        } else {
          setCurrentItems(prev => ({
            ...prev,
            [targetCategory]: existingIndex
          }));
        }

        return newItems;
      });
    }
  }, [location.state]);

  const handleItemChange = (category, direction) => {
    setCurrentItems(prev => ({
      ...prev,
      [category]:
        direction === 'next'
          ? (prev[category] + 1) % items[category].length
          : (prev[category] - 1 + items[category].length) % items[category].length
    }));
  };

  const handleChangeRedirect = (category) => {
    const categoryMapping = { top: 'tops', bottom: 'bottoms', shoes: 'footwear' };
    navigate('/products', {
      state: {
        category: categoryMapping[category],
        targetCategory: category,
        fromMixMatch: true,
        currentSelection: items[category][currentItems[category]],
        returnTo: '/mix-match'
      }
    });
  };

  const handleSaveLook = () => {
    setSavedLook(!savedLook);
    const currentLook = {
      top: items.top[currentItems.top],
      bottom: items.bottom[currentItems.bottom],
      shoes: items.shoes[currentItems.shoes],
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('savedMixMatchLook', JSON.stringify(currentLook));
  };

  const handleResetLook = () => {
    const resetState = {
      top: [{ id: 'placeholder-top', name: 'Select a Top', color: 'bg-gray-200', image: null, price: null }],
      bottom: [{ id: 'placeholder-bottom', name: 'Select a Bottom', color: 'bg-gray-200', image: null, price: null }],
      shoes: [{ id: 'placeholder-shoes', name: 'Select Shoes', color: 'bg-gray-200', image: null, price: null }]
    };
    setItems(resetState);
    setCurrentItems({ top: 0, bottom: 0, shoes: 0 });
    localStorage.removeItem("mixMatchItems");
  };

  const handleAddToCart = () => {
    const currentOutfit = [
      items.top[currentItems.top],
      items.bottom[currentItems.bottom],
      items.shoes[currentItems.shoes]
    ].filter(item => item.price);

    if (currentOutfit.length === 0) {
      alert('⚠️ Please select some products from our catalog to add to cart');
      return;
    }

    const isUserLoggedIn = !!localStorage.getItem("authToken");

    if (isUserLoggedIn) {
      fetch("/api/cart/add-outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(currentOutfit),
      })
        .then(() => navigate("/cart", { state: { fromMixMatch: true } }))
        .catch((err) => console.error("Cart error:", err));
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
      const updatedCart = [...guestCart, ...currentOutfit.map(item => ({ ...item, quantity: 1 }))];
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("guestCartUpdated"));
      navigate("/cart", { state: { fromMixMatch: true } });
    }
  };

  // ✅ Safe accessor
  const getCurrentItem = (category) => {
    const list = items[category] || [];
    const index = currentItems[category] ?? 0;
    return list[index] || list[0];
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-white rounded-3xl shadow-2xl h-full max-h-[900px] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mix and Match</h1>
          <p className="text-sm text-gray-600 mt-1">Click "Change" to explore more options</p>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 flex flex-col justify-between">
          {['top', 'bottom', 'shoes'].map((category) => (
            <div key={category} className="flex-1 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-gray-800 capitalize">{category}</h2>
                <div className="flex gap-2">
                  <button onClick={() => handleItemChange(category, 'next')} className="text-xs text-gray-600">Next →</button>
                  <button onClick={() => handleChangeRedirect(category)} className="bg-blue-600 text-white px-3 py-1 rounded-md">Change</button>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl p-4 h-full max-h-40">
                <div className="w-full h-full flex items-center justify-center rounded-xl shadow-md bg-white">
                  {getCurrentItem(category).image ? (
                    <img src={getCurrentItem(category).image} alt={getCurrentItem(category).name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-gray-500 text-sm">{getCurrentItem(category).name}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handleSaveLook} className="flex-1 border rounded-2xl py-3">Save Look</button>
          <button onClick={handleAddToCart} className="flex-1 bg-blue-600 text-white rounded-2xl py-3 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
          </button>
          <button onClick={handleResetLook} className="flex-1 bg-red-500 text-white rounded-2xl py-3">Reset Look</button>
        </div>
      </div>
    </div>
  );
};

export default MixAndMatchPage;
