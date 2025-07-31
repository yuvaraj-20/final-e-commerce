import React, { useState, useRef } from 'react';
import { Upload, Download, Share2, Save, Palette, Zap, Wand2, RotateCcw, Camera, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import FullBodyMockup from '../components/3d/FullBodyMockup';
import { api } from '../../services/api';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

const CustomDesign = () => {
  const { user, addCustomDesign } = useStore();
  const fileInputRef = useRef(null);
  
  const [currentDesign, setCurrentDesign] = useState({
    garmentType: 'tshirt',
    fabricType: 'cotton',
    color: '#ffffff',
    frontDesign: '',
    backDesign: '',
    leftSleeveDesign: '',
    rightSleeveDesign: '',
    designPlacement: 'front'
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [designName, setDesignName] = useState('');
  const [modelConfig, setModelConfig] = useState(null);

  const garmentTypes = [
    { id: 'tshirt', name: 'T-Shirt', price: 19.99, icon: '👕' },
    { id: 'hoodie', name: 'Hoodie', price: 39.99, icon: '🧥' },
    { id: 'pants', name: 'Pants', price: 29.99, icon: '👖' }
  ];

  const fabricTypes = [
    { id: 'cotton', name: 'Cotton', description: 'Soft and breathable natural fiber', texture: '🌿' },
    { id: 'linen', name: 'Linen', description: 'Lightweight and airy summer fabric', texture: '🌾' },
    { id: 'blend', name: 'Blend', description: 'Perfect mix of comfort and durability', texture: '✨' }
  ];

  const colors = [
    { name: 'White', value: '#ffffff', preview: '#ffffff' },
    { name: 'Black', value: '#000000', preview: '#1f2937' },
    { name: 'Olive', value: '#6b7280', preview: '#6b7280' },
    { name: 'Beige', value: '#f3f4f6', preview: '#f3f4f6' }
  ];

  const designPlacements = [
    { id: 'front', name: 'Front', icon: '👤', description: 'Center chest area' },
    { id: 'back', name: 'Back', icon: '🔄', description: 'Upper back area' },
    { id: 'left-sleeve', name: 'Left Sleeve', icon: '👈', description: 'Left arm sleeve' },
    { id: 'right-sleeve', name: 'Right Sleeve', icon: '👉', description: 'Right arm sleeve' }
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result;
        setCurrentDesign(prev => ({
          ...prev,
          [`${prev.designPlacement.replace('-', '')}Design`]: imageUrl
        }));
        toast.success('Design uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a design prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedUrl = await api.generateDesignFromPrompt(aiPrompt);
      setCurrentDesign(prev => ({
        ...prev,
        [`${prev.designPlacement.replace('-', '')}Design`]: generatedUrl
      }));
      toast.success('AI design generated successfully!');
      setAiPrompt('');
    } catch (error) {
      toast.error('Failed to generate design');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!designName.trim()) {
      toast.error('Please enter a design name');
      return;
    }

    if (!user) {
      toast.error('Please login to save designs');
      return;
    }

    try {
      const savedDesign = await api.saveCustomDesign({
        name: designName,
        description: `Custom ${currentDesign.garmentType} design`,
        garmentType: currentDesign.garmentType,
        fabricType: currentDesign.fabricType,
        design: {
          front: currentDesign.frontDesign,
          back: currentDesign.backDesign,
          sleeve: currentDesign.leftSleeveDesign || currentDesign.rightSleeveDesign
        },
        placement: {
          front: { x: 0, y: 0, scale: 1 },
          back: { x: 0, y: 0, scale: 1 },
          sleeve: { x: 0, y: 0, scale: 1 }
        },
        mockupUrl: 'generated-mockup-url',
        userId: user.id,
        shared: false
      });

      addCustomDesign(savedDesign);
      toast.success('Design saved successfully!');
      setDesignName('');
    } catch (error) {
      toast.error('Failed to save design');
    }
  };

  const handleShareDesign = async (method) => {
    try {
      await api.shareDesign('current-design', method, 'recipient@example.com');
      toast.success(`Design shared via ${method}!`);
    } catch (error) {
      toast.error('Failed to share design');
    }
  };

  const resetDesign = () => {
    setCurrentDesign(prev => ({
      ...prev,
      frontDesign: '',
      backDesign: '',
      leftSleeveDesign: '',
      rightSleeveDesign: ''
    }));
    toast.success('Design reset');
  };

  const selectedGarment = garmentTypes.find(g => g.id === currentDesign.garmentType);
  const selectedFabric = fabricTypes.find(f => f.id === currentDesign.fabricType);
  const selectedColor = colors.find(c => c.value === currentDesign.color);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              3D Fashion Design Studio
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create stunning custom designs with our advanced 3D full-body preview system. 
              See your designs come to life in real-time.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Design Tools */}
          <div className="xl:col-span-1 space-y-6">
            {/* Garment Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <span>Select Garment</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {garmentTypes.map((garment) => (
                  <button
                    key={garment.id}
                    onClick={() => setCurrentDesign(prev => ({ ...prev, garmentType: garment.id }))}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      currentDesign.garmentType === garment.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{garment.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{garment.name}</div>
                        <div className="text-sm text-gray-600">${garment.price}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Fabric Type */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fabric Type</h3>
              <div className="space-y-3">
                {fabricTypes.map((fabric) => (
                  <label key={fabric.id} className="flex items-start space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="fabricType"
                      value={fabric.id}
                      checked={currentDesign.fabricType === fabric.id}
                      onChange={(e) => setCurrentDesign(prev => ({ ...prev, fabricType: e.target.value }))}
                      className="mt-1 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{fabric.texture}</span>
                        <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                          {fabric.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{fabric.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Color Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Garment Color</h3>
              <div className="grid grid-cols-2 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setCurrentDesign(prev => ({ ...prev, color: color.value }))}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      currentDesign.color === color.value 
                        ? 'border-purple-600 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.preview }}
                      />
                      <span className="font-medium text-gray-900">{color.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Design Placement */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Placement</h3>
              <div className="grid grid-cols-2 gap-3">
                {designPlacements.map((placement) => (
                  <button
                    key={placement.id}
                    onClick={() => setCurrentDesign(prev => ({ ...prev, designPlacement: placement.id }))}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      currentDesign.designPlacement === placement.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">{placement.icon}</div>
                      <div className="font-medium text-sm">{placement.name}</div>
                      <div className="text-xs text-gray-600">{placement.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* AI Design Generator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-purple-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Wand2 className="h-5 w-5 text-purple-600" />
                <span>AI Design Generator</span>
              </h3>
              <div className="space-y-4">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe your design... (e.g., 'minimalist geometric pattern in blue and gold')"
                  className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white/70"
                  rows={3}
                />
                <button
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Generate Design</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Upload Design */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Custom Design</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors group"
              >
                <Upload className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mx-auto mb-3 transition-colors" />
                <span className="text-gray-600 group-hover:text-purple-600 transition-colors">
                  Click to upload image
                </span>
                <div className="text-sm text-gray-500 mt-1">
                  PNG, JPG up to 10MB
                </div>
              </button>
            </motion.div>
          </div>

          {/* 3D Preview */}
          <div className="xl:col-span-2 space-y-6">
            {/* Preview Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">3D Preview</h3>
                  <p className="text-gray-600">
                    Interactive full-body model with your custom design
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Live Preview
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 3D Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100">
                <FullBodyMockup
                  garmentType={currentDesign.garmentType}
                  garmentColor={currentDesign.color}
                  fabricType={currentDesign.fabricType}
                  frontDesign={currentDesign.frontDesign}
                  backDesign={currentDesign.backDesign}
                  leftSleeveDesign={currentDesign.leftSleeveDesign}
                  rightSleeveDesign={currentDesign.rightSleeveDesign}
                  designPlacement={currentDesign.designPlacement}
                  onConfigChange={setModelConfig}
                />
              </div>
            </motion.div>

            {/* Action Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="Enter design name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSaveDesign}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Design</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={resetDesign}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset Design</span>
                  </button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleShareDesign('whatsapp')}
                      className="bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShareDesign('email')}
                      className="bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Email
                    </button>
                    <button
                      onClick={() => handleShareDesign('messenger')}
                      className="bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-purple-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-2">
                    <span>{selectedGarment?.icon}</span>
                    <span>{selectedGarment?.name} ({selectedFabric?.name})</span>
                  </span>
                  <span className="font-medium">${selectedGarment?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Design Printing</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Color: {selectedColor?.name}</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-purple-200 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${((selectedGarment?.price || 0) + 5).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-colors font-semibold text-lg shadow-lg">
                Add to Cart
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDesign;