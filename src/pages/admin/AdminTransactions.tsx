import React, { useState, useEffect } from 'react';
import { dataService, type Transaction } from '../../services/dataService';
import { formatCoins, formatINR, formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { ArrowRightLeft, Search, RotateCcw, AlertTriangle, X, Check, Filter } from 'lucide-react';

export const AdminTransactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [isReversing, setIsReversing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadTransactions = async () => {
    const data = await dataService.getTransactions();
    setTransactions(data);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleConfirmReversal = async () => {
    if (!selectedTx || !user || !reversalReason.trim()) return;
    setIsReversing(true);
    setActionMessage(null);

    try {
      const res = await dataService.reverseTransaction(selectedTx.id, user.id, reversalReason);
      if (res.success) {
        setActionMessage(res.message);
        setSelectedTx(null);
        setReversalReason('');
        await loadTransactions();
      }
    } catch (err: any) {
      alert(err.message || 'Reversal failed');
    } finally {
      setIsReversing(false);
    }
  };

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.note?.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.user_id.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
            <span>Audit & Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
            Financial & Coin Audit Ledger
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Complete immutable ledger of all coin issuances, redemptions, bonus triggers, and administrative reversals.
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit note or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl text-xs focus:outline-none focus:border-amber-600"
          />
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-[#E8E1D9] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FDF9F3] border-b border-[#E8E1D9] text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID / Time</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Coins Delta</th>
                <th className="px-6 py-4">Bill Amount</th>
                <th className="px-6 py-4">Audit Note</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E1D9]">
              {filtered.map((tx) => {
                const isPositive = tx.coins_delta > 0;
                const isReversal = tx.kind === 'reversal';
                const hasReversal = transactions.some(t => t.reversal_of === tx.id);

                return (
                  <tr key={tx.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono font-bold text-[#3D2B1F]">{tx.id.substring(0, 10)}</p>
                      <p className="text-[10px] text-stone-400">{formatDate(tx.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
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
                    </td>
                    <td className="px-6 py-4 font-mono text-stone-600">{tx.user_id}</td>
                    <td className="px-6 py-4 font-bold">
                      <span className={isPositive ? 'text-emerald-700' : 'text-stone-800'}>
                        {isPositive ? `+${tx.coins_delta}` : tx.coins_delta}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {tx.bill_amount ? formatINR(tx.bill_amount) : '—'}
                    </td>
                    <td className="px-6 py-4 text-stone-600 max-w-[200px] truncate">
                      {tx.note || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isReversal && !hasReversal ? (
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reverse</span>
                        </button>
                      ) : hasReversal ? (
                        <span className="text-[10px] text-stone-400 font-bold uppercase">Reversed</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reversal Confirmation Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9]">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-xl font-bold text-[#3D2B1F] font-serif">
                Reverse Transaction
              </h3>
            </div>

            <p className="text-xs text-stone-500 mb-4">
              This will create a negative reversal transaction for <strong>{selectedTx.coins_delta} coins</strong> and update the student's wallet balance.
            </p>

            <div className="bg-[#FDF9F3] p-3.5 rounded-xl border border-[#E8E1D9] mb-4 text-xs space-y-1">
              <div><strong>Tx ID:</strong> <span className="font-mono">{selectedTx.id}</span></div>
              <div><strong>Delta:</strong> {selectedTx.coins_delta} coins</div>
              <div><strong>Target User:</strong> <span className="font-mono">{selectedTx.user_id}</span></div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="block text-xs font-bold text-stone-700">Audit Reason (Required)</label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Canteen bill was incorrectly entered as ₹500 instead of ₹50"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="w-full p-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-1/2 py-2.5 border border-[#E8E1D9] hover:bg-stone-50 rounded-xl font-bold text-xs text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReversal}
                disabled={isReversing || !reversalReason.trim()}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                {isReversing ? 'Reversing...' : 'Execute Reversal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
