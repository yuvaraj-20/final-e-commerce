// src/components/cart/CartSummary.jsx
import React from 'react';
import { Truck, Shield, CreditCard, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const CartSummary = ({ 
  onCheckout, 
  isCheckingOut, 
  appliedPromo,
  subtotal = 0,
  itemCount = 0
}) => {
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const promoDiscount = appliedPromo
    ? (subtotal * (appliedPromo.discount ?? 0)) / 100
    : 0;
  const total = subtotal + shipping + tax - promoDiscount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-md p-6 h-fit sticky top-6"
    >
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        {appliedPromo && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Promo Code Applied ({appliedPromo.code})</span>
            <span>-${promoDiscount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Shipping</span>
          <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        
        {subtotal < 100 && itemCount > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>Add ${(100 - subtotal).toFixed(2)} more for free shipping!</span>
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-200 my-3"></div>
        
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
      <button
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        className={`w-full mt-6 py-3 px-4 rounded-md font-medium text-white flex items-center justify-center ${
          isCheckingOut || itemCount === 0
            ? 'bg-indigo-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
        } transition-colors`}
      >
        {isCheckingOut ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Proceed to Checkout
          </>
        )}
      </button>
      
      <div className="mt-6 space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Shield className="h-4 w-4 text-gray-400" />
          <span>Secure checkout with SSL encryption</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Truck className="h-4 w-4 text-gray-400" />
          <span>Free returns within 30 days</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CartSummary;