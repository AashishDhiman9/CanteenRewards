import React, { useState, useEffect } from 'react';
import { dataService, type Reward } from '../../services/dataService';
import { formatCoins } from '../../lib/utils';
import { Gift, Plus, Edit2, Trash2, X, Image as ImageIcon, Sparkles } from 'lucide-react';

export const AdminRewards: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [editingReward, setEditingReward] = useState<Partial<Reward> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadRewards = async () => {
    const data = await dataService.getRewards();
    setRewards(data);
  };

  useEffect(() => {
    loadRewards();
  }, []);

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;
    setIsSaving(true);
    try {
      await dataService.saveReward(editingReward);
      setEditingReward(null);
      await loadRewards();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Are you sure you want to remove this reward?')) return;
    await dataService.deleteReward(id);
    await loadRewards();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>Cafe Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
            Rewards Catalog & Stock
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Create and edit redeemable cafe menu items, set coin redemption costs, and manage live inventory.
          </p>
        </div>

        <button
          onClick={() =>
            setEditingReward({
              title: '',
              description: '',
              coin_cost: 200,
              image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
              stock: 50,
              active: true,
              sort_order: rewards.length + 1,
            })
          }
          className="px-4 py-2.5 bg-[#3D2B1F] hover:bg-[#523B2B] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Reward</span>
        </button>
      </div>

      {/* Grid of Rewards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white rounded-3xl border border-[#E8E1D9] overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full bg-stone-100">
                <img
                  src={reward.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'}
                  alt={reward.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-[#3D2B1F] text-amber-400 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 shadow-md">
                  <span>🪙</span>
                  <span>{formatCoins(reward.coin_cost)}</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-stone-700">
                  Stock: {reward.stock !== null ? reward.stock : 'Unlimited'}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-base text-[#3D2B1F]">{reward.title}</h3>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      reward.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {reward.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 line-clamp-2">{reward.description}</p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-[#E8E1D9]/60 flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => setEditingReward(reward)}
                className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDeleteReward(reward.id)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingReward(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#3D2B1F] font-serif mb-4">
              {editingReward.id ? 'Edit Reward' : 'Add New Cafe Reward'}
            </h3>

            <form onSubmit={handleSaveReward} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Reward Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hazelnut Iced Cold Brew"
                  value={editingReward.title || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                  className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Item details, ingredients, preparation..."
                  value={editingReward.description || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Coin Cost (🪙)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingReward.coin_cost ?? 100}
                    onChange={(e) => setEditingReward({ ...editingReward, coin_cost: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono font-bold text-amber-800 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    placeholder="Empty = Unlimited"
                    value={editingReward.stock === null || editingReward.stock === undefined ? '' : editingReward.stock}
                    onChange={(e) =>
                      setEditingReward({
                        ...editingReward,
                        stock: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editingReward.image_url || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, image_url: e.target.value })}
                  className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono text-[11px] focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReward.active ?? true}
                    onChange={(e) => setEditingReward({ ...editingReward, active: e.target.checked })}
                    className="rounded border-[#E8E1D9] text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-stone-700">Display in Student Rewards Catalog</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReward(null)}
                  className="w-1/2 py-2.5 border border-[#E8E1D9] hover:bg-stone-50 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 py-2.5 bg-[#3D2B1F] hover:bg-[#523B2B] text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
