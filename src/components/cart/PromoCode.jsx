import React, { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PromoCode = ({ appliedPromo, onApplyPromo, onRemovePromo }) => {
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const validCodes = {
    'WELCOME10': { discount: 10, description: '10% off your first order' },
    'SAVE20': { discount: 20, description: '20% off orders over $100' },
    'FIRST15': { discount: 15, description: '15% off for new customers' },
    'FASHION25': { discount: 25, description: '25% off fashion items' },
    'THRIFT30': { discount: 30, description: '30% off thrift items' }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsApplying(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const upperCode = promoCode.toUpperCase();
    if (validCodes[upperCode]) {
      const promoData = validCodes[upperCode];
      onApplyPromo({
        code: upperCode,
        discount: promoData.discount
      });
      toast.success(`Promo code applied! ${promoData.discount}% off`);
      setPromoCode('');
    } else {
      toast.error('Invalid promo code');
    }
    
    setIsApplying(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Tag className="h-5 w-5" />
        <span>Promo Code</span>
      </h3>
      
      {appliedPromo ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-green-800 font-medium">{appliedPromo.code}</span>
              <p className="text-green-600 text-sm">-{appliedPromo.discount}% off applied</p>
            </div>
          </div>
          <button
            onClick={onRemovePromo}
            className="text-green-600 hover:text-green-700 p-1 rounded-full hover:bg-green-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter promo code"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
            />
            <button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || isApplying}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isApplying ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <span>Apply</span>
              )}
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Available Codes:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {Object.entries(validCodes).map(([code, data]) => (
                <button
                  key={code}
                  onClick={() => setPromoCode(code)}
                  className="text-left p-2 rounded hover:bg-white transition-colors"
                >
                  <span className="font-medium text-purple-600">{code}</span>
                  <p className="text-gray-600">{data.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCode;