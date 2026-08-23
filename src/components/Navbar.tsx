import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Coffee, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  Sparkles, 
  ChevronDown, 
  Check, 
  UserPlus,
  LogIn,
  KeyRound
} from 'lucide-react';
import type { UserRole } from '../types';

interface NavbarProps {
  onOpenAuth: (initialTab?: 'student' | 'staff' | 'admin') => void;
  onOpenQR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenQR }) => {
  const { 
    user, 
    role, 
    switchUserRole, 
    availableUsers, 
    switchActiveUser, 
    logout, 
    claimFirstAdmin 
  } = useAuth();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleClaimAdmin = async () => {
    const res = await claimFirstAdmin();
    setClaimStatus(res.message);
    setTimeout(() => setClaimStatus(null), 3000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E1D9] px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3D2B1F] rounded-xl flex items-center justify-center text-white shadow-md">
            <Coffee className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#3D2B1F] block leading-tight">
              Campus Rewards
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-amber-700 tracking-wide block">
              Canteen & Cafe Loyalty
            </span>
          </div>
        </div>

        {/* Center: Dedicated Portal Switchers */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#FDF9F3] p-1 rounded-2xl border border-[#E8E1D9]">
          <button
            onClick={() => onOpenAuth('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'student'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Portal</span>
          </button>

          <button
            onClick={() => onOpenAuth('staff')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'staff'
                ? 'bg-[#3D2B1F] text-amber-400 shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Staff Counter</span>
          </button>

          <button
            onClick={() => onOpenAuth('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              role === 'admin'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </button>
        </div>

        {/* Right Actions: QR trigger, User Profile, Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {role === 'student' && (
            <button
              onClick={onOpenQR}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Show QR</span>
            </button>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-50 border border-[#E8E1D9] transition-all bg-white"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  user.role === 'admin'
                    ? 'bg-stone-900 text-white'
                    : user.role === 'staff'
                    ? 'bg-[#3D2B1F] text-amber-400'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {getInitials(user.full_name)}
                </div>
                <div className="text-left hidden sm:block pr-1">
                  <p className="text-xs font-bold text-[#3D2B1F] leading-tight truncate max-w-[110px]">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-stone-500 font-mono">
                    <span className="capitalize font-bold text-amber-700">{user.role}</span> • {user.roll_no}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#E8E1D9] p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div className="pb-3 mb-2.5 border-b border-[#E8E1D9]">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-[#3D2B1F] truncate">{user.full_name}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-stone-900 text-white'
                          : user.role === 'staff'
                          ? 'bg-[#3D2B1F] text-amber-400'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">ID: {user.roll_no}</p>
                    {user.role === 'student' && (
                      <p className="text-xs text-amber-800 font-bold mt-1">
                        🪙 Balance: {user.wallet?.balance ?? 0} Coins
                      </p>
                    )}
                  </div>

                  {/* Switch to Different Role Portals */}
                  <div className="space-y-1 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1 mb-1">
                      Switch Active Portal
                    </p>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserDropdown(false);
                        onOpenAuth('student');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Student Portal (Easy Roll No.)</span>
                      </div>
                      {user.role === 'student' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserDropdown(false);
                        onOpenAuth('staff');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-[#3D2B1F]" />
                        <span>Staff Counter Terminal</span>
                      </div>
                      {user.role === 'staff' && <Check className="w-3.5 h-3.5 text-stone-900" />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserDropdown(false);
                        onOpenAuth('admin');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-stone-800" />
                        <span>Admin Command Portal</span>
                      </div>
                      {user.role === 'admin' && <Check className="w-3.5 h-3.5 text-stone-900" />}
                    </button>
                  </div>

                  {/* 1-Click Persona Switcher */}
                  <div className="space-y-1 mb-2 pt-2 border-t border-[#E8E1D9]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                      Quick Profile Switcher
                    </p>
                    {availableUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          switchActiveUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] flex items-center justify-between transition-colors ${
                          u.id === user.id ? 'bg-[#FDF9F3] text-amber-900 font-bold' : 'hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        <span className="truncate">{u.full_name} ({u.role})</span>
                        {u.id === user.id && <Check className="w-3 h-3 text-amber-600 shrink-0" />}
                      </button>
                    ))}
                  </div>

                  {/* Sign Out & Claim Admin */}
                  <div className="pt-2 border-t border-[#E8E1D9] space-y-1">
                    {user.role !== 'admin' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaimAdmin();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Claim First Admin</span>
                      </button>
                    )}
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuth('student')}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </button>

              <button
                onClick={() => onOpenAuth('staff')}
                className="px-2.5 py-1.5 border border-[#E8E1D9] text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-bold transition-colors hidden sm:flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Staff/Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Claim Banner notification */}
      {claimStatus && (
        <div className="mt-2 text-center text-xs font-bold py-1.5 px-3 bg-amber-100 text-amber-900 rounded-lg max-w-xl mx-auto border border-amber-200">
          {claimStatus}
        </div>
      )}
    </header>
  );
};
