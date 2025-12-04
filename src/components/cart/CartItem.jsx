import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Minus, Heart, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";

const CartItem = ({
  item,
  onQuantityChange,
  onRemove,
  onMoveToWishlist
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    id,
    name,
    price,
    quantity,
    image,
    type = 'product',
    condition,
    seller
  } = item;

  const unit = parseFloat(price) || 0;
  const total = unit * (quantity || 1);

  // Check if item is in wishlist
  useEffect(() => {
    // You can implement wishlist check here
    // For now, we'll set it to false
    setIsWishlisted(false);
  }, [id]);

  const handleIncrement = () => {
    onQuantityChange?.(id, (quantity || 1) + 1);
  };

  const handleDecrement = () => {
    onQuantityChange?.(id, Math.max(1, (quantity || 1) - 1));
  };

  const handleRemoveItem = () => {
    onRemove?.(id);
  };

  const handleWishlist = (e) => {
    e?.stopPropagation();
    onMoveToWishlist?.(item);
    setIsWishlisted(true);
    toast.success('Item moved to wishlist');
  };

  const handleShare = (e) => {
    e?.stopPropagation();
    const shareData = {
      title: name,
      text: `Check out this ${type} on our store: ${name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="relative group p-4 rounded-xl hover:bg-gray-50 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-2">
                {name}
              </h3>
              {type === 'thrift' && condition && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  {condition}
                </span>
              )}
              {seller && (
                <p className="text-sm text-gray-500 mt-1">
                  Sold by: {seller.name}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="font-medium text-gray-900">${total.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                ${unit.toFixed(2)} each
              </p>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDecrement}
                className="p-1 text-gray-500 hover:text-gray-700"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleWishlist}
                className={`text-sm flex items-center space-x-1 ${isWishlisted ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'
                  }`}
                title={isWishlisted ? "In wishlist" : "Save for later"}
              >
                <Heart
                  className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`}
                />
                <span className="hidden sm:inline">
                  {isWishlisted ? "In wishlist" : "Save"}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="text-gray-500 hover:text-gray-700"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>

              <button
                onClick={handleRemoveItem}
                className="text-red-500 hover:text-red-700"
                title="Remove"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;