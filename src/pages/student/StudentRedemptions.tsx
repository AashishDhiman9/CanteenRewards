import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService, type Redemption, type Reward } from '../../services/dataService';
import { formatDate } from '../../lib/utils';
import { Ticket, Clock, CheckCircle2, AlertTriangle, QrCode, X, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const StudentRedemptions: React.FC = () => {
  const { user } = useAuth();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [rewardsMap, setRewardsMap] = useState<Record<string, Reward>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedVoucher, setSelectedVoucher] = useState<{ redemption: Redemption; reward?: Reward } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [reds, rews] = await Promise.all([
        dataService.getRedemptions(user.id),
        dataService.getRewards(),
      ]);
      setRedemptions(reds);
      const map: Record<string, Reward> = {};
      rews.forEach(r => { map[r.id] = r; });
      setRewardsMap(map);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const pendingVouchers = redemptions.filter(r => r.status === 'pending');
  const historyVouchers = redemptions.filter(r => r.status !== 'pending');

  const displayedVouchers = activeTab === 'pending' ? pendingVouchers : historyVouchers;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5 text-amber-600" />
            <span>My Cafe Vouchers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
            Redeemed Item Passes
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Display your active QR voucher at the cafe counter to receive your food or beverage.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl border border-[#E8E1D9] hover:bg-stone-50 text-stone-600 transition-colors"
          title="Refresh Vouchers"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#FDF9F3] p-1.5 rounded-2xl border border-[#E8E1D9] w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-[#3D2B1F] text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Active Vouchers</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-600 text-white font-bold">
            {pendingVouchers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#3D2B1F] text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>History & Expired</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-stone-200 text-stone-700 font-bold">
            {historyVouchers.length}
          </span>
        </button>
      </div>

      {/* Vouchers Grid */}
      {displayedVouchers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-12 text-center text-stone-400">
          <Ticket className="w-10 h-10 mx-auto text-stone-300 mb-3" />
          <p className="text-sm font-semibold text-stone-600 mb-1">
            {activeTab === 'pending' ? 'No active vouchers' : 'No past vouchers'}
          </p>
          <p className="text-xs">
            {activeTab === 'pending'
              ? 'Redeem delicious snacks and drinks from the Rewards catalog to generate voucher passes.'
              : 'Your past redeemed and expired cafe vouchers will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedVouchers.map((voucher) => {
            const reward = rewardsMap[voucher.reward_id];
            const isPending = voucher.status === 'pending';
            const isUsed = voucher.status === 'used';
            const isExpired = voucher.status === 'expired' || (!isUsed && new Date(voucher.expires_at).getTime() < Date.now());

            return (
              <div
                key={voucher.id}
                className="bg-white rounded-3xl border border-[#E8E1D9] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-100 overflow-hidden shrink-0 border border-[#E8E1D9]">
                    <img
                      src={reward?.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80'}
                      alt={reward?.title || 'Reward'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-sm text-[#3D2B1F]">
                        {reward?.title || 'Cafe Item'}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isUsed
                            ? 'bg-stone-100 text-stone-600'
                            : isExpired
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {voucher.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 font-mono">
                      Pass: <span className="font-bold text-[#3D2B1F]">{voucher.code}</span>
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Cost: 🪙 {voucher.coin_cost} Coins • Created {formatDate(voucher.created_at)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E1D9] flex items-center justify-between">
                  <div className="text-[11px] text-stone-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {isUsed
                        ? `Used on ${formatDate(voucher.used_at)}`
                        : `Expires ${formatDate(voucher.expires_at)}`}
                    </span>
                  </div>

                  {isPending && !isExpired && (
                    <button
                      onClick={() => setSelectedVoucher({ redemption: voucher, reward })}
                      className="px-3.5 py-1.5 bg-[#3D2B1F] text-amber-400 hover:bg-[#523B2B] rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E8E1D9] text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#3D2B1F] font-serif mb-1">
              {selectedVoucher.reward?.title || 'Cafe Pass'}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Present this pass at the counter to verify your order.
            </p>

            <div className="p-4 bg-[#FDF9F3] border-2 border-dashed border-amber-300 rounded-2xl mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                Voucher Code
              </p>
              <p className="text-2xl font-bold font-mono tracking-wider text-[#3D2B1F] mb-3">
                {selectedVoucher.redemption.code}
              </p>

              <div className="flex justify-center">
                <QRCodeSVG
                  value={selectedVoucher.redemption.code}
                  size={140}
                  fgColor="#3D2B1F"
                  bgColor="#FDF9F3"
                />
              </div>
            </div>

            <div className="text-xs text-stone-500 mb-4">
              Expires on: <span className="font-bold text-stone-800">{formatDate(selectedVoucher.redemption.expires_at)}</span>
            </div>

            <button
              onClick={() => setSelectedVoucher(null)}
              className="w-full py-2.5 bg-[#3D2B1F] text-white rounded-xl text-xs font-bold hover:bg-[#523B2B] shadow-md transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
