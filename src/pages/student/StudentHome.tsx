import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService, type Transaction, type Reward, type Milestone } from '../../services/dataService';
import { formatCoins, formatINR, formatRelativeTime } from '../../lib/utils';
import { Sparkles, ArrowUpRight, ArrowDownLeft, Clock, Award, ChevronRight, Gift } from 'lucide-react';

interface StudentHomeProps {
  onNavigate: (tab: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const load = async () => {
      if (user) {
        const txs = await dataService.getTransactions(user.id);
        setTransactions(txs.slice(0, 5));
      }
      const rews = await dataService.getRewards();
      setRewards(rews.filter(r => r.active));
      const mss = await dataService.getMilestones();
      setMilestones(mss.filter(m => m.active));
    };
    load();
  }, [user]);

  const currentBalance = user?.wallet?.balance || 0;
  const lifetimeEarned = user?.wallet?.lifetime_earned || 0;
  const lifetimeSpent = user?.wallet?.lifetime_spent || 0;

  // Next milestone calculation
  const nextMilestone = milestones.find(m => m.threshold_lifetime_earned > lifetimeEarned) || milestones[milestones.length - 1];
  const milestoneProgress = nextMilestone
    ? Math.min(100, Math.round((lifetimeEarned / nextMilestone.threshold_lifetime_earned) * 100))
    : 100;
  const coinsNeeded = nextMilestone ? Math.max(0, nextMilestone.threshold_lifetime_earned - lifetimeEarned) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] mb-1 font-serif">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Here's what you've earned so far at the Campus Canteen.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-0.5">
              Lifetime Earned
            </p>
            <p className="text-sm sm:text-base font-bold text-[#3D2B1F]">
              🪙 {formatCoins(lifetimeEarned)}
            </p>
          </div>
          <div className="w-[1px] h-8 bg-[#E8E1D9]" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-0.5">
              Lifetime Spent
            </p>
            <p className="text-sm sm:text-base font-bold text-stone-600">
              🪙 {formatCoins(lifetimeSpent)}
            </p>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          {/* Espresso Hero Wallet Card */}
          <div className="bg-[#3D2B1F] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-stone-400/20">
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-widest font-bold text-amber-300/80 mb-2">
                Current Wallet Balance
              </p>
              <div className="flex items-end gap-3 mb-6">
                <span className="text-5xl sm:text-6xl font-bold font-serif tracking-tight text-white">
                  {formatCoins(currentBalance)}
                </span>
                <span className="text-xl sm:text-2xl font-medium text-amber-200/90 mb-1.5">
                  Coins
                </span>
              </div>

              <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[11px] text-stone-300 mb-0.5">Next Milestone</p>
                    <p className="text-xs sm:text-sm font-semibold text-amber-300">
                      {nextMilestone?.name || 'Top Tier Achieved'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-stone-300 mb-0.5">Redeemable Cafe Items</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {rewards.filter(r => r.coin_cost <= currentBalance).length} Available
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('rewards')}
                  className="w-full sm:w-auto bg-white hover:bg-stone-100 text-[#3D2B1F] px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                  <span>Redeem Rewards</span>
                </button>
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-4 -bottom-4 text-white/5 font-serif text-9xl select-none pointer-events-none">
              🪙
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl border border-[#E8E1D9] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base sm:text-lg text-[#3D2B1F] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Recent Activity</span>
              </h2>
              <button
                onClick={() => onNavigate('wallet')}
                className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
              >
                <span>View Full Wallet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs">
                No recent transactions found. Show your QR at the canteen counter to earn your first coins!
              </div>
            ) : (
              <div className="divide-y divide-[#E8E1D9]">
                {transactions.map((tx) => {
                  const isEarn = tx.coins_delta > 0;
                  return (
                    <div
                      key={tx.id}
                      className="py-3.5 flex items-center justify-between hover:bg-stone-50/60 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            isEarn
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {isEarn ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-[#3D2B1F] leading-tight">
                            {tx.note || (isEarn ? 'Canteen Purchase' : 'Cafe Redemption')}
                          </p>
                          <p className="text-[11px] text-stone-400 mt-0.5">
                            {formatRelativeTime(tx.created_at)}
                            {tx.bill_amount && ` • Spent ${formatINR(tx.bill_amount)}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xs sm:text-sm font-bold ${
                            isEarn ? 'text-emerald-700' : 'text-stone-800'
                          }`}
                        >
                          {isEarn ? `+${tx.coins_delta}` : tx.coins_delta} Coins
                        </p>
                        <p className="text-[10px] text-stone-400 uppercase font-semibold">
                          {tx.kind}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Next Milestone Card */}
          <div className="bg-[#FDF9F3] rounded-2xl p-6 border border-amber-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{nextMilestone?.badge || '🏆'}</span>
              <h3 className="font-bold text-sm text-amber-950">
                {nextMilestone?.name || 'Milestone Tier'}
              </h3>
            </div>

            <p className="text-xs text-amber-900/90 leading-relaxed mb-4">
              {coinsNeeded > 0 ? (
                <>
                  Earn <span className="font-bold text-[#3D2B1F]">{coinsNeeded} more coins</span> from canteen purchases to unlock bonus coins!
                </>
              ) : (
                'You have reached the highest tier! Keep racking up cafe rewards.'
              )}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-amber-200/60 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${milestoneProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              <span>{lifetimeEarned} Earned</span>
              <span>{milestoneProgress}% Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
