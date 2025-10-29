// src/components/dashboard/user/UserMyCombos.jsx
import React, { useState, useEffect } from 'react';
import { Heart, Zap, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../lib/apiClient'; // <-- use the lib api client you provided
import { useStore } from '../../../store/useStore';
import ComboCard from '../../monofit/ComboCard';

const UserMyCombos = () => {
  const { user, wishlist = [] } = useStore();
  const [savedCombos, setSavedCombos] = useState([]);
  const [recommendedCombos, setRecommendedCombos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('saved');
  const [mutatingIds, setMutatingIds] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadCombos();
    } else {
      // clear when no user
      setSavedCombos([]);
      setRecommendedCombos([]);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadCombos() {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      // Saved combos for the user
      // Backend should return either array or paginated payload (we handle array or payload.data)
      const savedResp = await api.get('/api/combos');
      const saved = savedResp?.data || savedResp || [];
      // AI recommended combos
      // Create/adjust endpoint name if your backend uses different path
      const recResp = await api.get('/api/combos/recommendations');
      const recs = recResp?.data || recResp || [];

      setSavedCombos(Array.isArray(saved) ? saved : saved.data ?? []);
      setRecommendedCombos(Array.isArray(recs) ? recs : recs.data ?? []);
    } catch (err) {
      console.error('Failed to load combos:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load combos');
    } finally {
      setIsLoading(false);
    }
  }

  // Demo create — replace with your actual combo creation UI
  async function createDemoCombo() {
    if (!user) return alert('Login required');
    const title = prompt('Combo title (demo):', 'My combo');
    if (!title) return;
    setIsLoading(true);
    try {
      // Adjust payload to match your backend schema (items array should be real product ids/meta)
      const payload = { title, items: [{ id: 1, name: 'Demo Item' }] };
      await api.post('/api/combos', payload);
      await loadCombos();
    } catch (err) {
      console.error('Create failed', err);
      alert(err.response?.data?.message || 'Could not create combo');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCombo(id) {
    if (!confirm('Delete this combo?')) return;
    // optimistic UI: mark mutating and remove locally for snappy UX
    setMutatingIds(prev => new Set(prev).add(id));
    const prevSaved = savedCombos;
    setSavedCombos(prev => prev.filter(c => c.id !== id));

    try {
      await api.delete(`/api/combos/${id}`);
      // refresh recommended in case it depends on saved combos
      await loadCombos();
    } catch (err) {
      // rollback on error
      setSavedCombos(prevSaved);
      console.error('Delete failed', err);
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setMutatingIds(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  }

  const currentCombos = activeTab === 'saved' ? savedCombos : recommendedCombos;

  // Loading skeleton (keeps your previous UI)
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error view
  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <div className="flex gap-2">
          <button onClick={loadCombos} className="px-3 py-2 rounded border">Retry</button>
          <button onClick={createDemoCombo} className="px-3 py-2 rounded bg-gradient-to-r from-purple-600 to-blue-600 text-white">Create demo combo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My MonoFit Combos</h2>
          <p className="text-gray-600">Your saved and recommended outfit combinations</p>
        </div>

        {/* action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={createDemoCombo}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white"
          >
            Create demo combo
          </button>
          <button onClick={loadCombos} className="px-4 py-2 rounded-lg border">Refresh</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{savedCombos.length}</div>
              <div className="text-sm text-gray-600">Saved Combos</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{recommendedCombos.length}</div>
              <div className="text-sm text-gray-600">AI Recommendations</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {savedCombos.filter(combo => wishlist?.includes(combo.id)).length}
              </div>
              <div className="text-sm text-gray-600">In Wishlist</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Saved Combos ({savedCombos.length})
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'recommended'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            AI Recommended ({recommendedCombos.length})
          </button>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCombos.map((combo, index) => (
          <div key={combo.id} className="relative">
            <ComboCard combo={combo} index={index} />
            {/* delete button overlay (example) */}
            {activeTab === 'saved' && (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => deleteCombo(combo.id)}
                  disabled={mutatingIds.has(combo.id)}
                  className="bg-white p-2 rounded-full shadow hover:bg-red-50"
                  title="Delete combo"
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentCombos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'saved' ? (
              <Heart className="h-12 w-12 text-gray-400" />
            ) : (
              <Zap className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'saved' ? 'No saved combos yet' : 'No recommendations available'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'saved'
              ? 'Start exploring MonoFit combos and save your favorites'
              : 'Browse more products to get personalized recommendations'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={createDemoCombo}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              {activeTab === 'saved' ? 'Explore Combos' : 'Browse Products'}
            </button>
            <button onClick={loadCombos} className="px-4 py-2 rounded-lg border">
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMyCombos;
