import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AuthModal } from './components/AuthModal';

const StudentHome = lazy(() => import('./pages/student/StudentHome').then(module => ({ default: module.StudentHome })));
const StudentWallet = lazy(() => import('./pages/student/StudentWallet').then(module => ({ default: module.StudentWallet })));
const StudentRewards = lazy(() => import('./pages/student/StudentRewards').then(module => ({ default: module.StudentRewards })));
const StudentRedemptions = lazy(() => import('./pages/student/StudentRedemptions').then(module => ({ default: module.StudentRedemptions })));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile').then(module => ({ default: module.StudentProfile })));

const StaffIssueCoins = lazy(() => import('./pages/staff/StaffIssueCoins').then(module => ({ default: module.StaffIssueCoins })));
const StaffVerifyReward = lazy(() => import('./pages/staff/StaffVerifyReward').then(module => ({ default: module.StaffVerifyReward })));
const StaffHistory = lazy(() => import('./pages/staff/StaffHistory').then(module => ({ default: module.StaffHistory })));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminSlabs = lazy(() => import('./pages/admin/AdminSlabs').then(module => ({ default: module.AdminSlabs })));
const AdminRewards = lazy(() => import('./pages/admin/AdminRewards').then(module => ({ default: module.AdminRewards })));
const AdminMilestones = lazy(() => import('./pages/admin/AdminMilestones').then(module => ({ default: module.AdminMilestones })));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions').then(module => ({ default: module.AdminTransactions })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(module => ({ default: module.AdminUsers })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(module => ({ default: module.AdminSettings })));

const MainLayout: React.FC = () => {
  const { role, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
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

  const loadingFallback = (
    <div className="flex min-h-[260px] items-center justify-center">
      <div className="rounded-xl border border-[#E8E1D9] bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 shadow-sm">
        Loading...
      </div>
    </div>
  );

  const renderContent = () => {
    const content = (() => {
      switch (currentTab) {
        // Student views
        case 'home':
          return <StudentHome onNavigate={setCurrentTab} />;
        case 'wallet':
          return <StudentWallet />;
        case 'rewards':
          return <StudentRewards />;
        case 'redemptions':
          return <StudentRedemptions />;
        case 'profile':
          return <StudentProfile />;

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
          return <StudentHome onNavigate={setCurrentTab} />;
      }
    })();

    return <Suspense fallback={loadingFallback}>{content}</Suspense>;
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navbar */}
      <Navbar onOpenAuth={handleOpenAuth} />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 pb-24 md:pb-12">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

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
