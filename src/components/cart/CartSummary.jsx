import React from 'react';
import { Truck, Shield, CreditCard, Tag } from 'lucide-react';
import { useStore } from '../../store/useStore';

const CartSummary = ({ onCheckout, isCheckingOut, appliedPromo }) => {
  const { cart } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount / 100) : 0;
  const total = subtotal + shipping + tax - promoDiscount;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
      <h3 className="font-semibold text-gray-900 mb-6">Order Summary</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({cart.length} items)</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        
        {appliedPromo && (
          <div className="flex justify-between text-green-600">
            <span>Promo ({appliedPromo.code})</span>
            <span>-${promoDiscount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Free Shipping Banner */}
      {subtotal < 100 && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800">
            <Truck className="h-4 w-4" />
            <span className="text-sm">
              Add ${(100 - subtotal).toFixed(2)} more for free shipping!
            </span>
          </div>
        </div>
      )}

      <button
        onClick={onCheckout}
        disabled={isCheckingOut}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isCheckingOut ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>Proceed to Checkout</span>
          </>
        )}
      </button>

      {/* Security Features */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          <span>Secure checkout with SSL encryption</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Truck className="h-4 w-4" />
          <span>Free returns within 30 days</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;