import React, { useState, useEffect } from 'react';
import { dataService, type Milestone } from '../../services/dataService';
import { formatCoins } from '../../lib/utils';
import { Award, Plus, Edit2, X, Sparkles } from 'lucide-react';

export const AdminMilestones: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editingMilestone, setEditingMilestone] = useState<Partial<Milestone> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadMilestones = async () => {
    const data = await dataService.getMilestones();
    setMilestones(data);
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;
    setIsSaving(true);
    try {
      await dataService.saveMilestone(editingMilestone);
      setEditingMilestone(null);
      await loadMilestones();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Gamification & Retention</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
            Student Loyalty Milestones
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Reward dedicated students with bonus coin injections and prestige badges when they reach lifetime milestones.
          </p>
        </div>

        <button
          onClick={() =>
            setEditingMilestone({
              name: '',
              threshold_lifetime_earned: 500,
              bonus_coins: 50,
              badge: '⭐',
              active: true,
            })
          }
          className="px-4 py-2.5 bg-[#3D2B1F] hover:bg-[#523B2B] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Milestone Tier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF9F3] border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                {m.badge}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#3D2B1F]">{m.name}</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Threshold: <span className="font-bold text-[#3D2B1F]">🪙 {formatCoins(m.threshold_lifetime_earned)}</span>
                </p>
                <p className="text-xs text-amber-700 font-semibold mt-0.5">
                  Bonus: +{formatCoins(m.bonus_coins)} Coins
                </p>
              </div>
            </div>

            <button
              onClick={() => setEditingMilestone(m)}
              className="p-2 text-stone-500 hover:text-[#3D2B1F] hover:bg-stone-100 rounded-xl transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {editingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9]">
            <button
              onClick={() => setEditingMilestone(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#3D2B1F] font-serif mb-4">
              {editingMilestone.id ? 'Edit Milestone' : 'New Milestone Tier'}
            </h3>

            <form onSubmit={handleSaveMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Foodie"
                  value={editingMilestone.name || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, name: e.target.value })}
                  className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-medium focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Lifetime Threshold (🪙)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingMilestone.threshold_lifetime_earned ?? 500}
                    onChange={(e) =>
                      setEditingMilestone({
                        ...editingMilestone,
                        threshold_lifetime_earned: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Bonus Coins (🪙)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingMilestone.bonus_coins ?? 50}
                    onChange={(e) =>
                      setEditingMilestone({ ...editingMilestone, bonus_coins: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Badge Emoji</label>
                <input
                  type="text"
                  required
                  value={editingMilestone.badge || '🏅'}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, badge: e.target.value })}
                  className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl text-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingMilestone(null)}
                  className="w-1/2 py-2.5 border border-[#E8E1D9] hover:bg-stone-50 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 py-2.5 bg-[#3D2B1F] hover:bg-[#523B2B] text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
