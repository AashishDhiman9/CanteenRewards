import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService, type Transaction } from '../../services/dataService';
import { formatCoins, formatINR, formatDate } from '../../lib/utils';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Sparkles, Filter, RefreshCw, Layers } from 'lucide-react';

export const StudentWallet: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await dataService.getTransactions(user.id);
      setTransactions(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const currentBalance = user?.wallet?.balance || 0;
  const lifetimeEarned = user?.wallet?.lifetime_earned || 0;
  const lifetimeSpent = user?.wallet?.lifetime_spent || 0;

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.kind === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <WalletIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Campus Rewards Wallet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
              Coins & Transaction Ledger
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Your official, verifiable ledger of coins earned from canteen meals and redeemed for cafe treats.
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            className="p-2.5 rounded-xl border border-[#E8E1D9] hover:bg-stone-50 text-stone-600 transition-colors self-end sm:self-auto"
            title="Refresh Transactions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#3D2B1F] text-white p-5 rounded-2xl relative overflow-hidden shadow-md">
            <p className="text-[11px] uppercase tracking-wider font-bold text-amber-300 mb-1">
              Available Balance
            </p>
            <p className="text-3xl font-bold font-serif">
              {formatCoins(currentBalance)} <span className="text-sm font-normal text-amber-200">Coins</span>
            </p>
            <div className="absolute right-3 bottom-2 opacity-10 text-4xl">🪙</div>
          </div>

          <div className="bg-[#FDF9F3] border border-amber-200/80 p-5 rounded-2xl">
            <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 mb-1">
              Lifetime Earned
            </p>
            <p className="text-2xl font-bold text-[#3D2B1F]">
              +{formatCoins(lifetimeEarned)} <span className="text-xs font-normal text-stone-500">Coins</span>
            </p>
          </div>

          <div className="bg-[#FDF9F3] border border-[#E8E1D9] p-5 rounded-2xl">
            <p className="text-[11px] uppercase tracking-wider font-bold text-stone-500 mb-1">
              Lifetime Spent
            </p>
            <p className="text-2xl font-bold text-stone-700">
              -{formatCoins(lifetimeSpent)} <span className="text-xs font-normal text-stone-400">Coins</span>
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-2xl border border-[#E8E1D9] p-6 shadow-sm">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#E8E1D9]">
          <h2 className="font-bold text-base text-[#3D2B1F] flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-600" />
            <span>Transaction History</span>
          </h2>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#FDF9F3] p-1 rounded-xl border border-[#E8E1D9]">
            {[
              { id: 'all', label: 'All' },
              { id: 'earn', label: 'Earned' },
              { id: 'redeem', label: 'Redeemed' },
              { id: 'bonus', label: 'Bonus' },
              { id: 'reversal', label: 'Reversals' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab.id
                    ? 'bg-[#3D2B1F] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-xs">
            No transactions found for the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-[#E8E1D9]">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.coins_delta > 0;
              return (
                <div
                  key={tx.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-stone-50/50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        tx.kind === 'earn'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tx.kind === 'bonus'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : tx.kind === 'reversal'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>

                    <div>
                      <p className="font-bold text-xs sm:text-sm text-[#3D2B1F]">
                        {tx.note || 'Canteen Transaction'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                        <span>{formatDate(tx.created_at)}</span>
                        {tx.bill_amount && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-stone-600">Bill: {formatINR(tx.bill_amount)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-mono text-[10px] text-stone-400">ID: {tx.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right self-end sm:self-auto">
                    <p
                      className={`text-sm sm:text-base font-bold ${
                        tx.kind === 'earn'
                          ? 'text-emerald-700'
                          : tx.kind === 'bonus'
                          ? 'text-amber-600'
                          : tx.kind === 'reversal'
                          ? 'text-rose-600'
                          : 'text-stone-800'
                      }`}
                    >
                      {isPositive ? `+${tx.coins_delta}` : tx.coins_delta} Coins
                    </p>
                    <span
                      className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                        tx.kind === 'earn'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.kind === 'bonus'
                          ? 'bg-amber-100 text-amber-800'
                          : tx.kind === 'reversal'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {tx.kind}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
