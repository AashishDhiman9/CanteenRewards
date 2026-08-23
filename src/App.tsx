import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { StudentQRModal } from './components/StudentQRModal';
import { AuthModal } from './components/AuthModal';

// Student Pages
import { StudentHome } from './pages/student/StudentHome';
import { StudentWallet } from './pages/student/StudentWallet';
import { StudentRewards } from './pages/student/StudentRewards';
import { StudentRedemptions } from './pages/student/StudentRedemptions';
import { StudentProfile } from './pages/student/StudentProfile';

// Staff Pages
import { StaffIssueCoins } from './pages/staff/StaffIssueCoins';
import { StaffVerifyReward } from './pages/staff/StaffVerifyReward';
import { StaffHistory } from './pages/staff/StaffHistory';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSlabs } from './pages/admin/AdminSlabs';
import { AdminRewards } from './pages/admin/AdminRewards';
import { AdminMilestones } from './pages/admin/AdminMilestones';
import { AdminTransactions } from './pages/admin/AdminTransactions';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';

const MainLayout: React.FC = () => {
  const { role, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'student' | 'staff' | 'admin'>('student');

  const handleOpenAuth = (initialTab?: 'student' | 'staff' | 'admin') => {
    if (initialTab) {
      setAuthModalTab(initialTab);
    }
    setIsAuthModalOpen(true);
  };

  // Sync tab on role change
  useEffect(() => {
    if (role === 'admin') {
      if (!currentTab.startsWith('admin-')) {
        setCurrentTab('admin-dashboard');
      }
    } else if (role === 'staff') {
      if (!currentTab.startsWith('staff-')) {
        setCurrentTab('staff-issue');
      }
    } else {
      if (currentTab.startsWith('admin-') || currentTab.startsWith('staff-')) {
        setCurrentTab('home');
      }
    }
  }, [role]);

  const renderContent = () => {
    switch (currentTab) {
      // Student views
      case 'home':
        return <StudentHome onNavigate={setCurrentTab} onOpenQR={() => setIsQRModalOpen(true)} />;
      case 'wallet':
        return <StudentWallet />;
      case 'rewards':
        return <StudentRewards />;
      case 'redemptions':
        return <StudentRedemptions />;
      case 'profile':
        return <StudentProfile onOpenQR={() => setIsQRModalOpen(true)} />;

      // Staff views
      case 'staff-issue':
        return <StaffIssueCoins />;
      case 'staff-verify':
        return <StaffVerifyReward />;
      case 'staff-history':
        return <StaffHistory />;

      // Admin views
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={setCurrentTab} />;
      case 'admin-slabs':
        return <AdminSlabs />;
      case 'admin-rewards':
        return <AdminRewards />;
      case 'admin-milestones':
        return <AdminMilestones />;
      case 'admin-transactions':
        return <AdminTransactions />;
      case 'admin-users':
        return <AdminUsers />;
      case 'admin-settings':
        return <AdminSettings />;

      default:
        return <StudentHome onNavigate={setCurrentTab} onOpenQR={() => setIsQRModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenQR={() => setIsQRModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 pb-24 md:pb-12">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      {/* Rotating Student QR Modal */}
      <StudentQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
