import React, { useState, useEffect } from 'react';
import { dataService, type Transaction, type Redemption } from '../../services/dataService';
import { formatCoins, formatINR, formatDate } from '../../lib/utils';
import { Wallet, RefreshCw, ArrowUpRight, Ticket, ArrowDownLeft } from 'lucide-react';

export const StaffHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const txs = await dataService.getTransactions();
      setTransactions(txs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm flex justify-between items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5 text-amber-600" />
            <span>Counter Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
            Recent Counter Activity
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time feed of purchases rewarded and vouchers fulfilled at the canteen counter.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl border border-[#E8E1D9] hover:bg-stone-50 text-stone-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-sm">
        <div className="divide-y divide-[#E8E1D9]">
          {transactions.map((tx) => {
            const isEarn = tx.coins_delta > 0;
            return (
              <div key={tx.id} className="py-4 flex items-center justify-between hover:bg-stone-50/50 px-2 rounded-xl">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isEarn
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isEarn ? <ArrowUpRight className="w-5 h-5" /> : <Ticket className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-[#3D2B1F]">
                      {tx.note || (isEarn ? 'Canteen Purchase' : 'Reward Redemption')}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {formatDate(tx.created_at)}
                      {tx.bill_amount && ` • Bill ${formatINR(tx.bill_amount)}`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-bold ${isEarn ? 'text-emerald-700' : 'text-stone-800'}`}>
                    {isEarn ? `+${tx.coins_delta}` : tx.coins_delta} Coins
                  </p>
                  <span className="text-[10px] uppercase font-bold text-stone-400">
                    {tx.kind}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
