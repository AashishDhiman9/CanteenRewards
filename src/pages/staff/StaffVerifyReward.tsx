import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { Ticket, CheckCircle2, AlertCircle, Sparkles, QrCode, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

export const StaffVerifyReward: React.FC = () => {
  const { user } = useAuth();
  const [code, setCode] = useState('CAF-8X29K');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim() || !user) return;
    setIsVerifying(true);
    setErrorMessage(null);
    setVerifiedResult(null);

    try {
      const res = await dataService.verifyRedemption(code, user.id);
      if (res.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10B981', '#3D2B1F', '#D97706'],
        });
        setVerifiedResult(res);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify redemption.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Ticket className="w-3.5 h-3.5 text-amber-600" />
          <span>Cafe Redemption Scanner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
          Verify & Redeem Cafe Pass
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Scan the student's voucher QR or enter their 8-digit voucher pass code to validate and fulfill cafe orders.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
            Enter Voucher Code (e.g. CAF-8X29K)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CAF-XXXXX"
                className="w-full pl-10 pr-4 py-3 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl text-base font-mono font-bold text-[#3D2B1F] focus:outline-none focus:border-amber-600 tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying || !code.trim()}
              className="px-6 py-3 bg-[#3D2B1F] hover:bg-[#523B2B] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying...' : 'Verify Code'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-stone-400 font-semibold">Test codes:</span>
            <button
              type="button"
              onClick={() => setCode('CAF-8X29K')}
              className="text-xs font-mono px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-stone-700"
            >
              CAF-8X29K (Hazelnut Brew)
            </button>
            <button
              type="button"
              onClick={() => setCode('CAF-3M71P')}
              className="text-xs font-mono px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-stone-700"
            >
              CAF-3M71P (Used sample)
            </button>
          </div>
        </form>

        {/* Success Result Box */}
        {verifiedResult && (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-widest block">
                  Voucher Successfully Redeemed
                </span>
                <h3 className="text-xl font-bold text-[#3D2B1F] font-serif">
                  {verifiedResult.rewardTitle}
                </h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block">Student:</span>
                <span className="font-bold text-[#3D2B1F]">{verifiedResult.studentName}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Roll Number:</span>
                <span className="font-mono font-bold text-[#3D2B1F]">{verifiedResult.rollNo}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Voucher Pass:</span>
                <span className="font-mono font-bold text-amber-700">{code}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Status:</span>
                <span className="font-bold text-emerald-700">Fulfilled & Logged</span>
              </div>
            </div>

            <p className="text-xs text-emerald-900 font-medium">
              ✅ Hand over the <strong>{verifiedResult.rewardTitle}</strong> to the student now.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-rose-900 mb-0.5">Verification Failed</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
