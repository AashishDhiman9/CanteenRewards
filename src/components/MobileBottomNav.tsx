import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Wallet, Gift, Ticket, User, QrCode, BarChart3, Layers, Award, ArrowRightLeft } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { role } = useAuth();

  const studentItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'redemptions', label: 'Vouchers', icon: Ticket },
  ];

  const staffItems: NavItem[] = [
    { id: 'staff-issue', label: 'Issue', icon: QrCode },
    { id: 'staff-verify', label: 'Verify', icon: Ticket },
    { id: 'staff-history', label: 'History', icon: Wallet },
  ];

  const adminItems: NavItem[] = [
    { id: 'admin-dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'admin-slabs', label: 'Slabs', icon: Layers },
    { id: 'admin-rewards', label: 'Rewards', icon: Gift },
    { id: 'admin-transactions', label: 'Ledger', icon: ArrowRightLeft },
    { id: 'admin-settings', label: 'Settings', icon: Award },
  ];

  const items = role === 'admin' ? adminItems : role === 'staff' ? staffItems : studentItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E1D9] px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-w-[50px] ${
                isActive ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
