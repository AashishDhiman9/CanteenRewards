import React, { useState, useEffect } from 'react';
import { dataService, type CoinSlab } from '../../services/dataService';
import { formatCoins, formatINR } from '../../lib/utils';
import { Layers, Plus, Edit2, Trash2, Check, X, Calculator, Sparkles } from 'lucide-react';

export const AdminSlabs: React.FC = () => {
  const [slabs, setSlabs] = useState<CoinSlab[]>([]);
  const [editingSlab, setEditingSlab] = useState<Partial<CoinSlab> | null>(null);
  const [simAmount, setSimAmount] = useState<number>(240);
  const [isSaving, setIsSaving] = useState(false);

  const loadSlabs = async () => {
    const data = await dataService.getCoinSlabs();
    setSlabs(data);
  };

  useEffect(() => {
    loadSlabs();
  }, []);

  const handleSaveSlab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlab) return;
    setIsSaving(true);
    try {
      await dataService.saveCoinSlab(editingSlab);
      setEditingSlab(null);
      await loadSlabs();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlab = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coin slab?')) return;
    await dataService.deleteCoinSlab(id);
    await loadSlabs();
  };

  const simCalc = dataService.calculateCoinsForAmount(simAmount, slabs);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Reward Rule Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
            Coin Spending Slabs
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Configure threshold spending brackets to dynamically reward students with flat or percentage-based coins.
          </p>
        </div>

        <button
          onClick={() =>
            setEditingSlab({
              name: '',
              min_amount: 0,
              max_amount: null,
              coins_flat: 10,
              coins_percent: 0,
              priority: 10,
              active: true,
            })
          }
          className="px-4 py-2.5 bg-[#3D2B1F] hover:bg-[#523B2B] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slab</span>
        </button>
      </div>

      {/* Simulator Banner */}
      <div className="bg-[#FDF9F3] border border-amber-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#3D2B1F] text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#3D2B1F]">Live Slab Simulator</h3>
            <p className="text-xs text-stone-500">Test how canteen bill amounts resolve across active slabs</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#E8E1D9]">
            <span className="text-xs font-bold text-stone-400">Bill ₹</span>
            <input
              type="number"
              min="0"
              value={simAmount}
              onChange={(e) => setSimAmount(Number(e.target.value))}
              className="w-24 font-bold text-sm text-[#3D2B1F] focus:outline-none font-mono"
            />
          </div>

          <div className="bg-[#3D2B1F] text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 font-bold shadow-sm">
            <span>Result:</span>
            <span className="text-amber-400">+{simCalc.totalCoins} Coins</span>
            <span className="text-[10px] text-stone-300 font-normal">({simCalc.slab?.name || 'Default'})</span>
          </div>
        </div>
      </div>

      {/* Slabs Table / Grid */}
      <div className="bg-white rounded-3xl border border-[#E8E1D9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FDF9F3] border-b border-[#E8E1D9] text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Slab Name</th>
                <th className="px-6 py-4">Bill Range (₹)</th>
                <th className="px-6 py-4">Flat Coins</th>
                <th className="px-6 py-4">Percentage</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9]">
              {slabs.map((slab) => (
                <tr key={slab.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#3D2B1F]">{slab.name}</td>
                  <td className="px-6 py-4 font-mono">
                    ₹{slab.min_amount} — {slab.max_amount !== null ? `₹${slab.max_amount}` : 'Unlimited'}
                  </td>
                  <td className="px-6 py-4 font-bold text-amber-700">+{slab.coins_flat}</td>
                  <td className="px-6 py-4 font-mono">{slab.coins_percent}%</td>
                  <td className="px-6 py-4 font-mono">{slab.priority}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        slab.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {slab.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingSlab(slab)}
                      className="p-1.5 text-stone-500 hover:text-[#3D2B1F] hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlab(slab.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editingSlab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9]">
            <button
              onClick={() => setEditingSlab(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#3D2B1F] font-serif mb-4">
              {editingSlab.id ? 'Edit Coin Slab' : 'Create New Coin Slab'}
            </h3>

            <form onSubmit={handleSaveSlab} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Slab Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deluxe Combo (₹300–₹499)"
                  value={editingSlab.name || ''}
                  onChange={(e) => setEditingSlab({ ...editingSlab, name: e.target.value })}
                  className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Min Bill (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingSlab.min_amount ?? 0}
                    onChange={(e) => setEditingSlab({ ...editingSlab, min_amount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Max Bill (₹)</label>
                  <input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={editingSlab.max_amount === null || editingSlab.max_amount === undefined ? '' : editingSlab.max_amount}
                    onChange={(e) =>
                      setEditingSlab({
                        ...editingSlab,
                        max_amount: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Flat Coins Awarded</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingSlab.coins_flat ?? 0}
                    onChange={(e) => setEditingSlab({ ...editingSlab, coins_flat: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Percentage Bonus (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingSlab.coins_percent ?? 0}
                    onChange={(e) => setEditingSlab({ ...editingSlab, coins_percent: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSlab.active ?? true}
                    onChange={(e) => setEditingSlab({ ...editingSlab, active: e.target.checked })}
                    className="rounded border-[#E8E1D9] text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-bold text-stone-700">Active Rule</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSlab(null)}
                  className="w-1/2 py-2.5 border border-[#E8E1D9] hover:bg-stone-50 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 py-2.5 bg-[#3D2B1F] hover:bg-[#523B2B] text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Slab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
