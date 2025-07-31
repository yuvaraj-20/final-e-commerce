import React, { useState, useRef } from 'react';
import { Upload, X, Plus, Tag, DollarSign, Zap, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import { useStore } from '../../../store/useStore';
import toast from 'react-hot-toast';

const UploadComboForm = ({ onSuccess, onCancel }) => {
  const { user } = useStore();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    occasion: '',
    season: '',
    gender: '',
    fabricType: '',
    tags: [],
    images: [],
    topItem: { name: '', price: 0, sizes: [], colors: [] },
    bottomItem: { name: '', price: 0, sizes: [], colors: [] },
    discountPercentage: 0
  });
  
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = ['Casual', 'Formal', 'Streetwear', 'Vintage', 'Minimalist', 'Sporty', 'Bohemian', 'Preppy'];
  const occasions = ['Work', 'Date Night', 'Weekend', 'Party', 'Travel', 'Gym', 'Beach', 'Formal Event'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];
  const genders = ['Men', 'Women', 'Unisex'];
  const fabricTypes = ['DTG', 'DTF', 'Embroidery', 'Screen Print'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const colors = ['Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'Pink', 'Purple', 'Green', 'Yellow', 'Orange', 'Brown', 'Beige', 'Multicolor'];

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = [...formData.images, ...files];
    const newPreviews = [...imagePreviews];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSizeToggle = (item, size) => {
    setFormData(prev => ({
      ...prev,
      [item]: {
        ...prev[item],
        sizes: prev[item].sizes.includes(size)
          ? prev[item].sizes.filter(s => s !== size)
          : [...prev[item].sizes, size]
      }
    }));
  };

  const handleColorToggle = (item, color) => {
    setFormData(prev => ({
      ...prev,
      [item]: {
        ...prev[item],
        colors: prev[item].colors.includes(color)
          ? prev[item].colors.filter(c => c !== color)
          : [...prev[item].colors, color]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to create combos');
      return;
    }
    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }
    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!formData.topItem.name || !formData.bottomItem.name) {
      toast.error('Please provide names for both top and bottom items');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await api.submitMonofitCombo(formData, user.id);
      toast.success("Combo submitted for review! You'll be notified once it's approved.");
      setFormData({
        name: '',
        description: '',
        category: '',
        occasion: '',
        season: '',
        gender: '',
        fabricType: '',
        tags: [],
        images: [],
        topItem: { name: '', price: 0, sizes: [], colors: [] },
        bottomItem: { name: '', price: 0, sizes: [], colors: [] },
        discountPercentage: 0
      });
      setImagePreviews([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to submit combo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg">
            <Zap className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create MonoFit Combo</h2>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Combo Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="e.g., Summer Casual Combo" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                <option value="">Select category</option>
                {categories.map(category => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" placeholder="Describe the style, occasion, and what makes this combo special..." required />
          </div>
        </div>

        {/* Images */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Images * (Max 5)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {formData.images.length < 5 && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors">
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-sm">Add Image</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Combo Details */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Combo Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
              <select value={formData.occasion} onChange={e => setFormData(prev => ({ ...prev, occasion: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Select occasion</option>
                {occasions.map(occasion => <option key={occasion} value={occasion}>{occasion}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
              <select value={formData.season} onChange={e => setFormData(prev => ({ ...prev, season: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Select season</option>
                {seasons.map(season => <option key={season} value={season}>{season}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
              <select value={formData.gender} onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                <option value="">Select gender</option>
                {genders.map(gender => <option key={gender} value={gender}>{gender}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Top Item */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Item Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Top Item Name *</label>
              <input type="text" value={formData.topItem.name} onChange={e => setFormData(prev => ({ ...prev, topItem: { ...prev.topItem, name: e.target.value } }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="e.g., Cotton T-Shirt" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Top Item Price *</label>
              <input type="number" min="0" step="0.01" value={formData.topItem.price} onChange={e => setFormData(prev => ({ ...prev, topItem: { ...prev.topItem, price: parseFloat(e.target.value) || 0 } }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="0.00" required />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button key={size} type="button" onClick={() => handleSizeToggle('topItem', size)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.topItem.sizes.includes(size) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button key={color} type="button" onClick={() => handleColorToggle('topItem', color)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.topItem.colors.includes(color) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Item */}
        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bottom Item Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bottom Item Name *</label>
              <input type="text" value={formData.bottomItem.name} onChange={e => setFormData(prev => ({ ...prev, bottomItem: { ...prev.bottomItem, name: e.target.value } }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="e.g., Denim Jeans" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bottom Item Price *</label>
              <input type="number" min="0" step="0.01" value={formData.bottomItem.price} onChange={e => setFormData(prev => ({ ...prev, bottomItem: { ...prev.bottomItem, price: parseFloat(e.target.value) || 0 } }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="0.00" required />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button key={size} type="button" onClick={() => handleSizeToggle('bottomItem', size)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.bottomItem.sizes.includes(size) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button key={color} type="button" onClick={() => handleColorToggle('bottomItem', color)} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.bottomItem.colors.includes(color) ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Type</label>
              <select value={formData.fabricType} onChange={e => setFormData(prev => ({ ...prev, fabricType: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Select fabric type</option>
                {fabricTypes.map(fab => <option key={fab} value={fab}>{fab}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <input type="number" min="0" max="100" value={formData.discountPercentage} onChange={e => setFormData(prev => ({ ...prev, discountPercentage: Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="0" />
                <span className="text-gray-700">%</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Tag key={tag} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`} className="hover:text-purple-900">
                    <X className="h-4 w-4" />
                  </button>
                </Tag>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="h-5 w-5 border-4 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Submit Combo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadComboForm;
