import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { dataService } from '../../services/dataService';
import { Settings, Database, Download, RotateCcw } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleResetData = () => {
    if (!confirm('Reset local storage to fresh seed data?')) return;
    dataService.resetDemoData();
    setResetStatus('Local demo data has been reset to default state.');
    setTimeout(() => {
      setResetStatus(null);
      window.location.reload();
    }, 1500);
  };

  const handleExportCSV = async () => {
    const txs = await dataService.getTransactions();
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,User ID,Kind,Coins Delta,Bill Amount,Created At,Note\n' +
      txs.map((t) => `"${t.id}","${t.user_id}","${t.kind}",${t.coins_delta},${t.bill_amount || 0},"${t.created_at}","${t.note || ''}"`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_canteen_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5 text-amber-600" />
          <span>System & Data Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
          System Administration
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Configure backend database connectivity and export financial audit logs.
        </p>
      </div>

      {resetStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold">
          {resetStatus}
        </div>
      )}

      <div className="space-y-4">
        {/* Supabase Status */}
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
              isSupabaseConfigured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3D2B1F]">Supabase Backend Integration</h3>
              <p className="text-xs text-stone-500">
                {isSupabaseConfigured
                  ? 'Connected to live Supabase PostgreSQL backend instance.'
                  : 'Operating in High-Fidelity Local PWA Mock Engine with atomic persistence.'}
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {isSupabaseConfigured ? 'Connected' : 'Local Storage Engine'}
          </span>
        </div>

        {/* Export Data */}
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3D2B1F]">Export Transaction CSV</h3>
              <p className="text-xs text-stone-500">
                Download full financial ledger with coin deltas and notes.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-[#E8E1D9] hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Reset Demo Data */}
        <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#3D2B1F]">Reset Demo Data</h3>
              <p className="text-xs text-stone-500">
                Restores default coin slabs, cafe rewards catalog, and transaction seed data.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
          >
            Reset Seed Data
          </button>
        </div>
      </div>
    </div>
  );
};
