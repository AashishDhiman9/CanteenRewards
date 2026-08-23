import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Wallet, Gift, Ticket, User, QrCode, ShieldCheck, ArrowRightLeft, Settings, Users, BarChart3, Layers, Award } from 'lucide-react';
import type { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQR: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenQR }) => {
  const { user, role } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const studentNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'redemptions', label: 'Vouchers', icon: Ticket },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const staffNavItems = [
    { id: 'staff-issue', label: 'Issue Coins', icon: QrCode },
    { id: 'staff-verify', label: 'Verify Reward', icon: Ticket },
    { id: 'staff-history', label: 'Recent Activity', icon: Wallet },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'admin-slabs', label: 'Coin Slabs', icon: Layers },
    { id: 'admin-rewards', label: 'Rewards Catalog', icon: Gift },
    { id: 'admin-milestones', label: 'Milestones', icon: Award },
    { id: 'admin-transactions', label: 'Transactions', icon: ArrowRightLeft },
    { id: 'admin-users', label: 'Users & Roles', icon: Users },
    { id: 'admin-settings', label: 'Settings', icon: Settings },
  ];

  const navItems = role === 'admin' ? adminNavItems : role === 'staff' ? staffNavItems : studentNavItems;

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#E8E1D9] flex-col p-6 shrink-0 min-h-[calc(100vh-61px)]">
      {/* Role Badge Indicator */}
      <div className="mb-6 px-3 py-2 bg-[#FDF9F3] rounded-xl border border-[#E8E1D9] flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Active View</span>
        <span className="text-xs font-bold text-amber-800 uppercase bg-amber-100 px-2 py-0.5 rounded-md">
          {role}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-all ${
                isActive
                  ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-200'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {role === 'student' && (
          <div className="mt-4 pt-4 border-t border-[#E8E1D9]">
            <button
              onClick={onOpenQR}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#3D2B1F] text-amber-400 hover:bg-[#523B2B] rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Show My QR</span>
            </button>
          </div>
        )}
      </nav>

      {/* User Footer Profile */}
      {user && (
        <div className="mt-auto pt-6 border-t border-[#E8E1D9]">
          <div className="flex items-center gap-3 p-2 bg-[#FDF9F3] rounded-xl border border-[#E8E1D9]/60">
            <div className="w-9 h-9 rounded-full bg-[#E8E1D9] text-[#3D2B1F] flex items-center justify-center font-bold text-xs shrink-0">
              {getInitials(user.full_name)}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold text-[#3D2B1F] truncate">{user.full_name}</p>
              <p className="text-[10px] text-stone-500 font-mono truncate">{user.roll_no}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
