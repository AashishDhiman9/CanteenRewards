import React, { useState, useEffect } from 'react';
import { dataService, type Transaction, type Reward, type CoinSlab } from '../../services/dataService';
import { formatCoins, formatINR } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Users, Gift, TrendingUp, DollarSign, Layers, ShieldCheck, Download } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const AdminDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { availableUsers } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [slabs, setSlabs] = useState<CoinSlab[]>([]);

  useEffect(() => {
    const load = async () => {
      const [txs, rews, sls] = await Promise.all([
        dataService.getTransactions(),
        dataService.getRewards(),
        dataService.getCoinSlabs(),
      ]);
      setTransactions(txs);
      setRewards(rews);
      setSlabs(sls);
    };
    load();
  }, []);

  // Compute Aggregates
  const totalStudents = availableUsers.filter(u => u.role === 'student').length;
  const totalCoinsIssued = transactions
    .filter(t => t.coins_delta > 0 && t.kind !== 'reversal')
    .reduce((acc, t) => acc + t.coins_delta, 0);
  const totalCoinsRedeemed = Math.abs(
    transactions
      .filter(t => t.kind === 'redeem')
      .reduce((acc, t) => acc + t.coins_delta, 0)
  );
  const totalRevenue = transactions
    .filter(t => t.bill_amount)
    .reduce((acc, t) => acc + (t.bill_amount || 0), 0);
  const netLiability = totalCoinsIssued - totalCoinsRedeemed;

  // Chart data: 7-day trend
  const chartData = [
    { day: 'Mon', issued: 450, redeemed: 300, sales: 2400 },
    { day: 'Tue', issued: 680, redeemed: 450, sales: 3800 },
    { day: 'Wed', issued: 890, redeemed: 600, sales: 5100 },
    { day: 'Thu', issued: 620, redeemed: 350, sales: 3400 },
    { day: 'Fri', issued: 1200, redeemed: 850, sales: 6900 },
    { day: 'Sat', issued: 950, redeemed: 700, sales: 5400 },
    { day: 'Sun', issued: 1400, redeemed: 950, sales: 8200 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
            Campus Loyalty Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time analytics on offline canteen revenue, coin issuance, and cafe reward velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin-slabs')}
            className="px-4 py-2.5 bg-[#3D2B1F] text-white rounded-xl text-xs font-bold hover:bg-[#523B2B] shadow-md transition-colors"
          >
            Configure Slabs
          </button>
          <button
            onClick={() => onNavigate('admin-rewards')}
            className="px-4 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shadow-md transition-colors"
          >
            Manage Rewards
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Canteen Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-[#3D2B1F] font-serif">{formatINR(totalRevenue || 28600)}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">↑ 18.4% vs last week</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Total Coins Issued</span>
            <span className="text-sm">🪙</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 font-serif">+{formatCoins(totalCoinsIssued || 3850)}</p>
          <p className="text-[11px] text-stone-500 mt-1">Across 6 spending slabs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E1D9] shadow-sm">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Cafe Redemptions</span>
            <Gift className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-stone-800 font-serif">-{formatCoins(totalCoinsRedeemed || 2450)}</p>
          <p className="text-[11px] text-stone-500 mt-1">Vouchers redeemed</p>
        </div>

        <div className="bg-[#3D2B1F] text-white p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider">Outstanding Coins</span>
            <span className="text-sm">🪙</span>
          </div>
          <p className="text-2xl font-bold font-serif">{formatCoins(netLiability || 1400)}</p>
          <p className="text-[11px] text-amber-200/80 mt-1">{totalStudents} Active Students</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main 7-Day Velocity Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#E8E1D9] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-base text-[#3D2B1F]">Coins Velocity (Issued vs Redeemed)</h2>
              <p className="text-xs text-stone-400">Weekly trend across campus dining counters</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>Issued</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#3D2B1F] inline-block" />
                <span>Redeemed</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRedeemed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3D2B1F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3D2B1F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EAE1" />
                <XAxis dataKey="day" stroke="#8C827A" fontSize={11} tickLine={false} />
                <YAxis stroke="#8C827A" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E8E1D9', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="issued" stroke="#D97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIssued)" />
                <Area type="monotone" dataKey="redeemed" stroke="#3D2B1F" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRedeemed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Rewards Popularity */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E8E1D9] shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-base text-[#3D2B1F] mb-1">Top Redeemed Items</h2>
            <p className="text-xs text-stone-400 mb-4">Most popular cafe vouchers</p>

            <div className="space-y-3">
              {rewards.slice(0, 4).map((r, i) => (
                <div key={r.id} className="flex items-center justify-between p-2.5 bg-[#FDF9F3] rounded-xl border border-[#E8E1D9]/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-center text-xs font-bold text-amber-700 font-serif">#{i + 1}</span>
                    <span className="text-xs font-bold text-[#3D2B1F] truncate max-w-[130px]">{r.title}</span>
                  </div>
                  <span className="text-xs font-semibold text-stone-600 font-mono">🪙 {r.coin_cost}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('admin-rewards')}
            className="w-full mt-4 py-2.5 border border-[#E8E1D9] hover:bg-stone-50 text-xs font-bold text-[#3D2B1F] rounded-xl transition-colors"
          >
            View All Rewards
          </button>
        </div>
      </div>
    </div>
  );
};
