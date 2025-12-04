import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { api, ensureCsrf, readXsrfToken } from "../lib/apiClient";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import RecommendedItems from "../components/cart/RecommendedItems";
import toast from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, setCart, user } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load cart from server
  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await api.get('/api/cart');
        const data = response?.data ?? response;
        setCart(data?.items || []);
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [setCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemove(itemId);
      return;
    }

    try {
      await ensureCsrf();
      const token = readXsrfToken();

      await api.put(`/api/cart/item/${itemId}`,
        { quantity: newQuantity },
        { headers: { "X-XSRF-TOKEN": token } }
      );

      // Update local state optimistically
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await ensureCsrf();
      const token = readXsrfToken();

      const response = await api.delete(`/api/cart/item/${itemId}`, {
        headers: { "X-XSRF-TOKEN": token }
      });

      // Update cart with response from server
      const data = response?.data ?? response;
      setCart(data?.items || []);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsCheckingOut(true);
    try {
      navigate('/checkout');
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to proceed to checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>

        <AnimatePresence>
          {cart.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md p-6">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-gray-500 mb-6">Start shopping to add items to your cart</p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 space-y-4">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={{
                      ...item,
                      id: item.id,
                      name: item.name || 'Unknown Item',
                      price: item.price || 0,
                      quantity: item.quantity || 1,
                      image: item.image,
                      type: item.type || 'product',
                      condition: item.condition,
                      seller: item.seller_name ? {
                        id: item.seller_id,
                        name: item.seller_name
                      } : null
                    }}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <CartSummary
                  subtotal={cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0)}
                  itemCount={cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                  onCheckout={handleCheckout}
                  isCheckingOut={isCheckingOut}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        {cart.length > 0 && <RecommendedItems cartItems={cart} />}
      </div>
    </div>
  );
};

export default Cart;