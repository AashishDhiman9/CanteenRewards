import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService, type CoinSlab } from '../../services/dataService';
import { formatCoins, formatINR } from '../../lib/utils';
import { Search, Sparkles, Check, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const StaffIssueCoins: React.FC = () => {
  const { user, availableUsers, refreshProfile } = useAuth();
  const [slabs, setSlabs] = useState<CoinSlab[]>([]);
  const [searchQuery, setSearchQuery] = useState('2024-812');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [billAmount, setBillAmount] = useState<number | ''>(240);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await dataService.getCoinSlabs();
      setSlabs(data.filter(s => s.active));
    };
    load();
  }, []);

  const selectStudent = (student: any) => {
    setSelectedStudent(student);
    setSearchQuery(student.roll_no);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Auto-select when querying
  const handleSearchStudent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const query = searchQuery.trim().toLowerCase();
    const student = availableUsers.find(
      u => u.roll_no.toLowerCase() === query || u.full_name.toLowerCase().includes(query)
    );

    if (student) {
      selectStudent(student);
    } else {
      setSelectedStudent(null);
      setErrorMessage(`No registered student found matching "${searchQuery}".`);
    }
  };

  useEffect(() => {
    handleSearchStudent();
  }, [availableUsers]);

  const numAmount = typeof billAmount === 'number' ? billAmount : 0;
  const calc = dataService.calculateCoinsForAmount(numAmount, slabs);

  const handleIssueCoins = async () => {
    if (!selectedStudent || !user || numAmount <= 0) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await dataService.issueCoins(
        selectedStudent.id,
        numAmount,
        user.id,
        note || `Canteen Meal: ${formatINR(numAmount)}`
      );

      if (res.success) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10B981', '#D97706', '#3D2B1F'],
        });
        setSuccessMessage(res.message);
        setBillAmount('');
        setNote('');
        await refreshProfile();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to issue coins.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <UserCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Canteen Counter Terminal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
          Issue Coins for Offline Purchases
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Search or select the student manually, enter the canteen bill amount, and award loyalty coins instantly.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Step 1: Student Lookup */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
            1. Select Student
          </label>

          <div className="mb-3">
            <form onSubmit={handleSearchStudent} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by roll number or name"
                  className="w-full pl-10 pr-4 py-3 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl text-sm focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#3D2B1F] text-white rounded-xl text-xs font-bold hover:bg-[#523B2B] transition-colors"
              >
                Lookup
              </button>
            </form>
          </div>

          {/* Quick Select demo pills */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[11px] text-stone-400 font-semibold">Quick select:</span>
            {availableUsers.filter(u => u.role === 'student').map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  selectStudent(s);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  selectedStudent?.id === s.id
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {s.roll_no} ({s.full_name.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Student Card */}
        {selectedStudent && (
          <div className="p-4 bg-[#FDF9F3] rounded-2xl border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#3D2B1F] text-amber-400 flex items-center justify-center font-bold font-serif text-base">
                {selectedStudent.full_name[0]}
              </div>
              <div>
                <p className="font-bold text-sm text-[#3D2B1F]">{selectedStudent.full_name}</p>
                <p className="text-xs text-stone-500 font-mono">
                  Roll No: <span className="font-bold text-stone-800">{selectedStudent.roll_no}</span>
                </p>
              </div>
            </div>

            <div className="bg-white px-4 py-2 rounded-xl border border-[#E8E1D9] text-right">
              <p className="text-[10px] uppercase font-bold text-stone-400">Current Balance</p>
              <p className="text-sm font-bold text-amber-700">
                🪙 {formatCoins(selectedStudent.wallet?.balance || 0)} Coins
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Bill Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E8E1D9]">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              2. Total Bill Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-stone-400 text-base">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 240"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl text-lg font-bold text-[#3D2B1F] focus:outline-none focus:border-amber-600 font-mono"
              />
            </div>

            {/* Quick Bill presets */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[50, 120, 240, 350, 550, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBillAmount(amt)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono font-semibold rounded-lg transition-colors"
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Note / Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 2x Meals + Cold Drink"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl text-xs focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Dynamic Coin Calculation Box */}
          <div className="bg-[#3D2B1F] text-white p-6 rounded-2xl flex flex-col justify-between shadow-md">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-300">
                  Calculated Coin Award
                </span>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-amber-200 font-mono">
                  {calc.slab?.name || 'Standard Tier'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold font-serif text-amber-400">
                  +{calc.totalCoins}
                </span>
                <span className="text-lg text-white/80 font-medium">Coins</span>
              </div>

              <div className="space-y-1.5 text-xs text-stone-300 border-t border-white/15 pt-3">
                <div className="flex justify-between">
                  <span>Spend Tier:</span>
                  <span className="font-semibold text-white">{calc.slab?.name || 'Default (5%)'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Student New Balance:</span>
                  <span className="font-bold text-amber-300">
                    {(selectedStudent?.wallet?.balance || 0) + calc.totalCoins} Coins
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleIssueCoins}
              disabled={isSubmitting || !selectedStudent || numAmount <= 0}
              className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording Transaction...' : `Award +${calc.totalCoins} Coins`}</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
