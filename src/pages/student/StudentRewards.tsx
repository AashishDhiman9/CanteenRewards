import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService, type Reward, type Redemption } from '../../services/dataService';
import { formatCoins } from '../../lib/utils';
import { Gift, Sparkles, Check, Clock, AlertCircle, ShoppingBag, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export const StudentRewards: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [activeRedemption, setActiveRedemption] = useState<{ code: string; reward: Reward; redemption: Redemption } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await dataService.getRewards();
      setRewards(data.filter(r => r.active));
    };
    load();
  }, []);

  const currentBalance = user?.wallet?.balance || 0;

  const handleInitiateRedeem = (reward: Reward) => {
    setError(null);
    setSelectedReward(reward);
    setIsConfirmOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!user || !selectedReward) return;
    setIsRedeeming(true);
    setError(null);

    try {
      const res = await dataService.redeemReward(user.id, selectedReward.id);
      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D97706', '#3D2B1F', '#F59E0B', '#10B981'],
        });

        setActiveRedemption({
          code: res.code,
          reward: selectedReward,
          redemption: res.redemption,
        });
        setIsConfirmOpen(false);
        await refreshProfile();
        // Refresh local reward stock
        const updated = await dataService.getRewards();
        setRewards(updated.filter(r => r.active));
      }
    } catch (err: any) {
      setError(err.message || 'Redemption failed.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>Cafe Rewards Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
            Redeem Cafe Vouchers
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Exchange your canteen loyalty coins for freshly prepared cafe beverages, snacks, and combo platters.
          </p>
        </div>

        <div className="bg-[#3D2B1F] text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-md shrink-0">
          <span className="text-2xl">🪙</span>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">Your Balance</p>
            <p className="text-xl font-bold font-serif">{formatCoins(currentBalance)} Coins</p>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const isAffordable = currentBalance >= reward.coin_cost;
          const isOutOfStock = reward.stock !== null && reward.stock <= 0;
          const coinsNeeded = reward.coin_cost - currentBalance;

          return (
            <div
              key={reward.id}
              className="bg-white rounded-3xl border border-[#E8E1D9] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* Reward Image Container */}
              <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                <img
                  src={reward.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'}
                  alt={reward.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-[#3D2B1F]/90 backdrop-blur-md text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md">
                  <span>🪙</span>
                  <span>{formatCoins(reward.coin_cost)}</span>
                </div>

                {reward.stock !== null && reward.stock <= 15 && reward.stock > 0 && (
                  <div className="absolute bottom-3 left-3 bg-amber-600/90 backdrop-blur-md text-white font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider">
                    Only {reward.stock} Left
                  </div>
                )}
              </div>

              {/* Reward Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#3D2B1F] mb-1.5 group-hover:text-amber-700 transition-colors">
                    {reward.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-4">
                    {reward.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E1D9] flex items-center justify-between gap-2">
                  {isOutOfStock ? (
                    <span className="w-full py-2.5 text-center text-xs font-bold text-stone-400 bg-stone-100 rounded-xl">
                      Out of Stock
                    </span>
                  ) : isAffordable ? (
                    <button
                      onClick={() => handleInitiateRedeem(reward)}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Redeem for {reward.coin_cost} Coins</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 px-3 bg-[#FDF9F3] border border-amber-200/80 rounded-xl text-center">
                      <p className="text-[11px] font-bold text-amber-800">
                        {coinsNeeded} more coins needed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9] animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
                🎁
              </div>
              <h3 className="text-xl font-bold text-[#3D2B1F] font-serif">
                Confirm Cafe Reward
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Are you sure you want to redeem this item?
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Breakdown card */}
            <div className="bg-[#FDF9F3] p-4 rounded-2xl border border-[#E8E1D9] mb-6 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Reward:</span>
                <span className="font-bold text-[#3D2B1F]">{selectedReward.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Coin Cost:</span>
                <span className="font-bold text-amber-700">-{selectedReward.coin_cost} Coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Current Balance:</span>
                <span className="font-medium text-stone-700">{currentBalance} Coins</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E8E1D9] font-bold">
                <span className="text-[#3D2B1F]">Balance After:</span>
                <span className="text-emerald-700">{currentBalance - selectedReward.coin_cost} Coins</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="w-1/2 py-3 border border-[#E8E1D9] hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedeem}
                disabled={isRedeeming}
                className="w-1/2 py-3 bg-[#3D2B1F] hover:bg-[#523B2B] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{isRedeeming ? 'Unlocking...' : 'Confirm & Redeem'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Voucher Modal */}
      {activeRedemption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E8E1D9] text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveRedemption(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Check className="w-3.5 h-3.5" />
              <span>Reward Unlocked!</span>
            </div>

            <h3 className="text-xl font-bold text-[#3D2B1F] font-serif mb-1">
              {activeRedemption.reward.title}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Show this code to the cafe counter barista to claim your item.
            </p>

            {/* Voucher Code Display Box */}
            <div className="p-4 bg-[#FDF9F3] border-2 border-dashed border-amber-300 rounded-2xl mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                Redemption Code
              </p>
              <p className="text-2xl font-bold font-mono tracking-wider text-[#3D2B1F]">
                {activeRedemption.code}
              </p>

              <div className="mt-3 flex justify-center">
                <QRCodeSVG
                  value={activeRedemption.code}
                  size={120}
                  fgColor="#3D2B1F"
                  bgColor="#FDF9F3"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs bg-amber-50 text-amber-900 px-3 py-2 rounded-xl mb-4">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Valid for:</span>
              </span>
              <span className="font-bold">24 Hours</span>
            </div>

            <button
              onClick={() => setActiveRedemption(null)}
              className="w-full py-3 bg-[#3D2B1F] text-white rounded-xl text-xs font-bold hover:bg-[#523B2B] shadow-md transition-colors"
            >
              Done & Save in Vouchers
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
