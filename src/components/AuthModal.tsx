import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  Coffee, 
  KeyRound, 
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'student' | 'staff' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'student' }) => {
  const { 
    loginWithGoogle,
    loginStaff, 
    loginAdmin, 
    availableUsers, 
    switchActiveUser,
    isLoading 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'admin'>(initialTab);

  // Staff Form State
  const [staffIdOrEmail, setStaffIdOrEmail] = useState('STAFF-101');
  const [staffPassword, setStaffPassword] = useState('staff123');

  // Admin Form State
  const [adminIdOrEmail, setAdminIdOrEmail] = useState('ADMIN-001');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Common Alerts
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // --- GOOGLE SIGN-IN HANDLER (SUPABASE GOOGLE OAUTH) ---
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);

    const res = await loginWithGoogle();

    if (res.success) {
      setSuccessMsg('Connecting with Google... Entering Canteen Portal');
      setTimeout(() => onClose(), 500);
    } else {
      setError(res.error || 'Google authentication failed. Please check your Supabase OAuth configuration.');
    }
  };

  // --- STAFF SUBMIT HANDLER ---
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!staffIdOrEmail.trim()) {
      setError('Please enter your Staff ID or Staff Email.');
      return;
    }

    const res = await loginStaff(staffIdOrEmail.trim(), staffPassword);
    if (res.success) {
      setSuccessMsg('Staff credentials verified. Loading POS terminal...');
      setTimeout(() => onClose(), 400);
    } else {
      setError(res.error || 'Staff authentication failed.');
    }
  };

  // --- ADMIN SUBMIT HANDLER ---
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!adminIdOrEmail.trim()) {
      setError('Please enter your Admin ID or Institutional Email.');
      return;
    }

    const res = await loginAdmin(adminIdOrEmail.trim(), adminPassword);
    if (res.success) {
      setSuccessMsg('Administrator access granted. Opening Command Center...');
      setTimeout(() => onClose(), 400);
    } else {
      setError(res.error || 'Admin authentication failed.');
    }
  };

  const demoStudents = availableUsers.filter(u => u.role === 'student');
  const demoStaff = availableUsers.filter(u => u.role === 'staff');
  const demoAdmins = availableUsers.filter(u => u.role === 'admin');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D9] animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#3D2B1F] text-amber-400 flex items-center justify-center font-bold">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-[#3D2B1F] tracking-wide uppercase font-serif">Campus Loyalty & Rewards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
            Welcome to Canteen Portal
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Select your account type to proceed with fast sign-in.
          </p>
        </div>

        {/* Main Role Portal Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#FDF9F3] p-1.5 rounded-2xl border border-[#E8E1D9] mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('student');
              setError(null);
            }}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
              activeTab === 'student'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('staff');
              setError(null);
            }}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-[#3D2B1F] text-amber-400 shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Canteen Staff</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError(null);
            }}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 1: STUDENT AUTH (CONTINUE WITH GOOGLE ONLY)           */}
        {/* ========================================================== */}
        {activeTab === 'student' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Primary Google Login Box */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <strong className="block font-bold text-amber-950 text-sm">Student Instant Sign-In</strong>
                <p className="text-stone-600 leading-relaxed">
                  Sign in with any Google account (personal or university email) to access your campus wallet, earn coins on food bills, and redeem free cafe rewards.
                </p>
              </div>
            </div>

            {/* Single Large Continue with Google Button */}
            <div className="py-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-white hover:bg-stone-50 active:bg-stone-100 border-2 border-stone-200 hover:border-amber-500 rounded-2xl shadow-sm hover:shadow-md text-stone-900 font-bold text-sm sm:text-base flex items-center justify-center gap-3.5 transition-all active:scale-[0.99] group cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            </div>

            {/* Loyalty bonus perks note */}
            <div className="bg-[#FDF9F3] border border-[#E8E1D9] rounded-2xl p-3.5 flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <span className="text-base">🪙</span>
                <span><strong>50 Welcome Coins</strong> credited on first Google login</span>
              </div>
              <span className="font-semibold text-amber-800 text-[11px] bg-amber-100/80 px-2 py-0.5 rounded-md">Instant</span>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: DEDICATED CANTEEN STAFF LOGIN       */}
        {/* ========================================== */}
        {activeTab === 'staff' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-stone-100 border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-700 flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-[#3D2B1F] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-[#3D2B1F]">Canteen POS Terminal Access</strong>
                <span>Authorizes counter staff to scan student QR codes, calculate coin earnings from physical bills, and verify cafe redemption vouchers.</span>
              </div>
            </div>

            <form onSubmit={handleStaffSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Staff ID or Staff Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. STAFF-101 or rajesh.canteen@campus.edu"
                    value={staffIdOrEmail}
                    onChange={(e) => setStaffIdOrEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Staff Security PIN / Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#3D2B1F] hover:bg-[#523B2B] text-amber-400 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>{isLoading ? 'Authenticating Staff...' : 'Launch Staff POS Counter'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </form>

            {/* Quick Demo Staff Login */}
            <div className="pt-3 border-t border-[#E8E1D9]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                1-Click Quick Demo Staff Counter
              </p>
              {demoStaff.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    switchActiveUser(st.id);
                    onClose();
                  }}
                  className="w-full p-2.5 bg-[#FDF9F3] hover:bg-stone-100 border border-[#E8E1D9] rounded-xl text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-[#3D2B1F] group-hover:text-amber-800">{st.full_name}</p>
                    <p className="text-[10px] text-stone-500 font-mono">ID: {st.roll_no} • {st.email}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-[#3D2B1F] text-amber-400 px-2 py-0.5 rounded-lg">
                    Log In
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: DEDICATED CAMPUS ADMIN LOGIN        */}
        {/* ========================================== */}
        {activeTab === 'admin' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-3.5 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-white">Administrator Command Center</strong>
                <span className="text-stone-300">Provides full control over coin formula slabs, cafe menu catalog, transaction audit ledger, and user roles.</span>
              </div>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Administrator ID or Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADMIN-001 or admin.canteen@campus.edu"
                    value={adminIdOrEmail}
                    onChange={(e) => setAdminIdOrEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Master Admin Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FDF9F3] border border-[#E8E1D9] rounded-xl focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>{isLoading ? 'Verifying Admin Privileges...' : 'Enter Admin Command Center'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </form>

            {/* Quick Demo Admin */}
            <div className="pt-3 border-t border-[#E8E1D9] space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                1-Click Quick Demo Administrator
              </p>
              {demoAdmins.map((ad) => (
                <button
                  key={ad.id}
                  type="button"
                  onClick={() => {
                    switchActiveUser(ad.id);
                    onClose();
                  }}
                  className="w-full p-2.5 bg-[#FDF9F3] hover:bg-stone-100 border border-[#E8E1D9] rounded-xl text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-bold text-[#3D2B1F] group-hover:text-amber-800">{ad.full_name}</p>
                    <p className="text-[10px] text-stone-500 font-mono">ID: {ad.roll_no} • {ad.email}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-stone-900 text-white px-2 py-0.5 rounded-lg">
                    Log In
                  </span>
                </button>
              ))}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
