import { Database, UserRole, TransactionKind, RedemptionStatus } from './database';

export * from './database';

export interface UserProfile {
  id: string;
  full_name: string;
  roll_no: string;
  email: string | null;
  phone?: string | null;
  auth_provider?: 'google' | 'phone' | 'roll_no' | 'email';
  avatar: string | null;
  role: UserRole;
  wallet?: {
    balance: number;
    lifetime_earned: number;
    lifetime_spent: number;
  };
}

export interface SlabCalculation {
  slab: Database['public']['Tables']['coin_slabs']['Row'] | null;
  baseCoins: number;
  bonusCoins: number;
  totalCoins: number;
}

export interface StudentQRTokenPayload {
  userId: string;
  rollNo: string;
  fullName: string;
  token: string;
  expiresAt: string;
}

export interface AdminAnalyticsSummary {
  todaySales: number;
  totalSales: number;
  coinsIssued: number;
  coinsRedeemed: number;
  activeStudents: number;
  rewardsRedeemedCount: number;
  recentSalesTrend: Array<{ date: string; sales: number; coins: number }>;
  topRewards: Array<{ name: string; count: number }>;
}
