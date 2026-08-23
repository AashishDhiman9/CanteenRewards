import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCoins } from '../../lib/utils';
import { 
  User, 
  Shield, 
  Award, 
  QrCode, 
  LogOut, 
  Coffee, 
  Sparkles, 
  Mail, 
  Hash,
  Phone,
  CheckCircle2,
  Edit2,
  Save,
  X
} from 'lucide-react';

interface StudentProfileProps {
  onOpenQR: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ onOpenQR }) => {
  const { user, logout, updateStudentPhone } = useAuth();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (!user) return null;

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhone.trim()) {
      updateStudentPhone(newPhone.trim());
      setIsEditingPhone(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D9] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.full_name} 
              className="w-24 h-24 rounded-3xl object-cover shadow-xl shadow-stone-400/20 shrink-0 border-2 border-amber-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-[#3D2B1F] text-amber-400 flex items-center justify-center font-bold text-3xl shadow-xl shadow-stone-400/20 shrink-0 font-serif">
              {getInitials(user.full_name)}
            </div>
          )}

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Registered Student</span>
              </div>
              
              {user.auth_provider === 'google' && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                  <svg className="w-3 h-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google Account</span>
                </div>
              )}

              {user.auth_provider === 'phone' && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  <Phone className="w-3 h-3" />
                  <span>Phone Verified</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2B1F] font-serif">
              {user.full_name}
            </h1>
            <p className="text-xs text-stone-500 font-mono mt-1">
              Roll Number: <span className="font-bold text-stone-800">{user.roll_no}</span>
            </p>
          </div>

          <button
            onClick={onOpenQR}
            className="px-5 py-2.5 bg-[#3D2B1F] hover:bg-[#523B2B] text-amber-400 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Show QR</span>
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#E8E1D9] text-center">
          <div className="p-3 bg-[#FDF9F3] rounded-2xl border border-[#E8E1D9]">
            <p className="text-[10px] uppercase font-bold text-stone-400">Available</p>
            <p className="text-lg font-bold text-[#3D2B1F] font-serif">
              {formatCoins(user.wallet?.balance || 0)}
            </p>
          </div>
          <div className="p-3 bg-[#FDF9F3] rounded-2xl border border-[#E8E1D9]">
            <p className="text-[10px] uppercase font-bold text-stone-400">Total Earned</p>
            <p className="text-lg font-bold text-emerald-700 font-serif">
              {formatCoins(user.wallet?.lifetime_earned || 0)}
            </p>
          </div>
          <div className="p-3 bg-[#FDF9F3] rounded-2xl border border-[#E8E1D9]">
            <p className="text-[10px] uppercase font-bold text-stone-400">Total Spent</p>
            <p className="text-lg font-bold text-stone-600 font-serif">
              {formatCoins(user.wallet?.lifetime_spent || 0)}
            </p>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Phone number updated and linked to your campus profile!</span>
        </div>
      )}

      {/* Account Info Details */}
      <div className="bg-white rounded-3xl border border-[#E8E1D9] p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-base text-[#3D2B1F] flex items-center gap-2 pb-3 border-b border-[#E8E1D9]">
          <User className="w-4 h-4 text-amber-600" />
          <span>Account & Authentication Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-[#FDF9F3] rounded-xl border border-[#E8E1D9]">
            <span className="text-stone-400 block mb-1">Email / Google Address</span>
            <span className="font-bold text-[#3D2B1F] truncate block">{user.email || 'None provided'}</span>
          </div>

          <div className="p-3.5 bg-[#FDF9F3] rounded-xl border border-[#E8E1D9]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-stone-400">Registered Phone Number</span>
              {!isEditingPhone && (
                <button
                  onClick={() => {
                    setNewPhone(user.phone || '');
                    setIsEditingPhone(true);
                  }}
                  className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{user.phone ? 'Change' : 'Add Phone'}</span>
                </button>
              )}
            </div>
            {isEditingPhone ? (
              <form onSubmit={handleSavePhone} className="flex items-center gap-1.5 mt-1">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="flex-1 px-2.5 py-1 bg-white border border-[#E8E1D9] rounded-lg text-xs font-semibold"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(false)}
                  className="p-1.5 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <span className="font-bold font-mono text-[#3D2B1F]">
                {user.phone || <span className="text-stone-400 italic">Not linked yet</span>}
              </span>
            )}
          </div>

          <div className="p-3.5 bg-[#FDF9F3] rounded-xl border border-[#E8E1D9]">
            <span className="text-stone-400 block mb-1">College Roll Number</span>
            <span className="font-bold font-mono text-[#3D2B1F]">{user.roll_no}</span>
          </div>

          <div className="p-3.5 bg-[#FDF9F3] rounded-xl border border-[#E8E1D9]">
            <span className="text-stone-400 block mb-1">Sign-In Method</span>
            <span className="font-bold text-amber-700 capitalize">
              {user.auth_provider === 'google' 
                ? 'Google Authentication' 
                : user.auth_provider === 'phone' 
                ? 'Phone Number (SMS OTP)' 
                : 'Instant Roll Number Entry'}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8E1D9]">
          <button
            onClick={() => logout()}
            className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

