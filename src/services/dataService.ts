import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database, SlabCalculation } from '../types';

export type CoinSlab = Database['public']['Tables']['coin_slabs']['Row'];
export type Reward = Database['public']['Tables']['rewards']['Row'];
export type Milestone = Database['public']['Tables']['milestones']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Redemption = Database['public']['Tables']['redemptions']['Row'];

// Default Seed Data
const DEFAULT_SLABS: CoinSlab[] = [
  { id: 'cs-1', name: 'Quick Bites (₹0–₹99)', min_amount: 0, max_amount: 99.99, coins_flat: 5, coins_percent: 0, priority: 10, active: true, created_at: new Date().toISOString() },
  { id: 'cs-2', name: 'Daily Lunch (₹100–₹199)', min_amount: 100, max_amount: 199.99, coins_flat: 15, coins_percent: 0, priority: 20, active: true, created_at: new Date().toISOString() },
  { id: 'cs-3', name: 'Combo Meal (₹200–₹299)', min_amount: 200, max_amount: 299.99, coins_flat: 30, coins_percent: 0, priority: 30, active: true, created_at: new Date().toISOString() },
  { id: 'cs-4', name: 'Group Feast (₹300–₹499)', min_amount: 300, max_amount: 499.99, coins_flat: 50, coins_percent: 0, priority: 40, active: true, created_at: new Date().toISOString() },
  { id: 'cs-5', name: 'Party Order (₹500–₹999)', min_amount: 500, max_amount: 999.99, coins_flat: 100, coins_percent: 0, priority: 50, active: true, created_at: new Date().toISOString() },
  { id: 'cs-6', name: 'Grand Cater (₹1000+)', min_amount: 1000, max_amount: null, coins_flat: 250, coins_percent: 0, priority: 60, active: true, created_at: new Date().toISOString() },
];

const DEFAULT_REWARDS: Reward[] = [
  {
    id: 'rew-1',
    title: 'Artisan Single-Origin Espresso',
    description: 'Freshly ground arabica beans extracted under 9 bars of pressure. Rich crema, bold caramel aroma.',
    coin_cost: 150,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    stock: 100,
    active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rew-2',
    title: 'Crispy Grilled Paneer Sandwich',
    description: 'Herb-buttered multi-grain bread with spiced cottage cheese cubes, mint dip, and melted cheddar.',
    coin_cost: 300,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    stock: 45,
    active: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rew-3',
    title: 'Hazelnut Iced Cold Brew',
    description: 'Steeped for 18 hours, served over crystal clear ice cubes with silky hazelnut cream foam.',
    coin_cost: 350,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    stock: 60,
    active: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rew-4',
    title: 'Cafe Supreme Burger Combo',
    description: 'Signature crispy patty burger + seasoned salted crinkle fries + choice of iced lemon tea.',
    coin_cost: 600,
    image_url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    active: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rew-5',
    title: 'Warm Dutch Chocolate Brownie',
    description: 'Decadent melted fudge core topped with crunchy roasted walnuts and vanilla bean drizzle.',
    coin_cost: 250,
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    stock: 40,
    active: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rew-6',
    title: 'VIP Study Group Fiesta Platter',
    description: 'Loaded spicy Mexican nachos, crispy mozzarella fingers, garlic dip, and two signature shakes.',
    coin_cost: 1000,
    image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80',
    stock: 12,
    active: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'ms-1', name: 'Bronze Canteen Explorer', threshold_lifetime_earned: 250, bonus_coins: 25, badge: '🥉', active: true, created_at: new Date().toISOString() },
  { id: 'ms-2', name: 'Silver Campus Foodie', threshold_lifetime_earned: 750, bonus_coins: 75, badge: '🥈', active: true, created_at: new Date().toISOString() },
  { id: 'ms-3', name: 'Gold Cafe VIP', threshold_lifetime_earned: 1500, bonus_coins: 150, badge: '🥇', active: true, created_at: new Date().toISOString() },
  { id: 'ms-4', name: 'Platinum Canteen Legend', threshold_lifetime_earned: 3000, bonus_coins: 300, badge: '👑', active: true, created_at: new Date().toISOString() },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    user_id: 'u-student-1',
    kind: 'earn',
    coins_delta: 30,
    bill_amount: 240,
    slab_id: 'cs-3',
    reward_id: null,
    redemption_id: null,
    reversal_of: null,
    note: 'Canteen Lunch Purchase',
    created_by: 'u-staff-1',
    idempotency_key: 'idemp-1',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'tx-2',
    user_id: 'u-student-1',
    kind: 'redeem',
    coins_delta: -350,
    bill_amount: null,
    slab_id: null,
    reward_id: 'rew-3',
    redemption_id: 'red-1',
    reversal_of: null,
    note: 'Redeemed: Hazelnut Iced Cold Brew',
    created_by: 'u-student-1',
    idempotency_key: 'idemp-2',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'tx-3',
    user_id: 'u-student-1',
    kind: 'earn',
    coins_delta: 15,
    bill_amount: 120,
    slab_id: 'cs-2',
    reward_id: null,
    redemption_id: null,
    reversal_of: null,
    note: 'Snack Break & Tea',
    created_by: 'u-staff-1',
    idempotency_key: 'idemp-3',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'tx-4',
    user_id: 'u-student-1',
    kind: 'bonus',
    coins_delta: 75,
    bill_amount: null,
    slab_id: null,
    reward_id: null,
    redemption_id: null,
    reversal_of: null,
    note: 'Milestone Bonus: Silver Campus Foodie',
    created_by: 'u-staff-1',
    idempotency_key: 'idemp-4',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

const DEFAULT_REDEMPTIONS: Redemption[] = [
  {
    id: 'red-1',
    user_id: 'u-student-1',
    reward_id: 'rew-3',
    coin_cost: 350,
    code: 'CAF-8X29K',
    code_hash: 'hash-8x29k',
    status: 'pending',
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    used_at: null,
    verified_by: null,
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'red-2',
    user_id: 'u-student-1',
    reward_id: 'rew-1',
    coin_cost: 150,
    code: 'CAF-3M71P',
    code_hash: 'hash-3m71p',
    status: 'used',
    expires_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    used_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    verified_by: 'u-staff-1',
    is_demo: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

class DataService {
  private slabs: CoinSlab[] = [];
  private rewards: Reward[] = [];
  private milestones: Milestone[] = [];
  private transactions: Transaction[] = [];
  private redemptions: Redemption[] = [];

  constructor() {
    this.loadLocalData();
  }

  private loadLocalData() {
    this.slabs = JSON.parse(localStorage.getItem('canteen_slabs') || JSON.stringify(DEFAULT_SLABS));
    this.rewards = JSON.parse(localStorage.getItem('canteen_rewards') || JSON.stringify(DEFAULT_REWARDS));
    this.milestones = JSON.parse(localStorage.getItem('canteen_milestones') || JSON.stringify(DEFAULT_MILESTONES));
    this.transactions = JSON.parse(localStorage.getItem('canteen_transactions') || JSON.stringify(DEFAULT_TRANSACTIONS));
    this.redemptions = JSON.parse(localStorage.getItem('canteen_redemptions') || JSON.stringify(DEFAULT_REDEMPTIONS));
  }

  private persist(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Coin Slabs ---
  async getCoinSlabs(): Promise<CoinSlab[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('coin_slabs').select('*').order('priority', { ascending: false });
      if (!error && data && data.length > 0) return data;
    }
    return this.slabs;
  }

  async saveCoinSlab(slab: Partial<CoinSlab>): Promise<CoinSlab> {
    if (isSupabaseConfigured) {
      if (slab.id && !slab.id.startsWith('cs-')) {
        const { data, error } = await (supabase as any).from('coin_slabs').update(slab).eq('id', slab.id).select().single();
        if (!error && data) return data;
      } else {
        const { data, error } = await (supabase as any).from('coin_slabs').insert(slab as any).select().single();
        if (!error && data) return data;
      }
    }

    if (slab.id) {
      this.slabs = this.slabs.map(s => (s.id === slab.id ? ({ ...s, ...slab } as CoinSlab) : s));
    } else {
      const newSlab: CoinSlab = {
        id: `cs-${Date.now()}`,
        name: slab.name || 'New Tier',
        min_amount: slab.min_amount || 0,
        max_amount: slab.max_amount || null,
        coins_flat: slab.coins_flat || 0,
        coins_percent: slab.coins_percent || 0,
        priority: slab.priority || 0,
        active: slab.active ?? true,
        created_at: new Date().toISOString(),
      };
      this.slabs.push(newSlab);
    }
    this.persist('canteen_slabs', this.slabs);
    return this.slabs[this.slabs.length - 1];
  }

  async deleteCoinSlab(id: string): Promise<void> {
    if (isSupabaseConfigured && !id.startsWith('cs-')) {
      await (supabase as any).from('coin_slabs').delete().eq('id', id);
    }
    this.slabs = this.slabs.filter(s => s.id !== id);
    this.persist('canteen_slabs', this.slabs);
  }

  calculateCoinsForAmount(amount: number, slabsList?: CoinSlab[]): SlabCalculation {
    const list = slabsList || this.slabs;
    const activeSlabs = list
      .filter(s => s.active && s.min_amount <= amount && (s.max_amount === null || s.max_amount >= amount))
      .sort((a, b) => b.priority - a.priority || b.min_amount - a.min_amount);

    const slab = activeSlabs[0] || null;
    let baseCoins = 0;
    if (slab) {
      baseCoins = slab.coins_flat + Math.floor((amount * slab.coins_percent) / 100);
    } else {
      baseCoins = Math.max(1, Math.floor(amount * 0.05));
    }

    return {
      slab,
      baseCoins,
      bonusCoins: 0,
      totalCoins: baseCoins,
    };
  }

  // --- Rewards ---
  async getRewards(): Promise<Reward[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('rewards').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    return this.rewards;
  }

  async saveReward(reward: Partial<Reward>): Promise<Reward> {
    if (isSupabaseConfigured) {
      if (reward.id && !reward.id.startsWith('rew-')) {
        const { data, error } = await (supabase as any).from('rewards').update(reward).eq('id', reward.id).select().single();
        if (!error && data) return data;
      } else {
        const { data, error } = await (supabase as any).from('rewards').insert(reward as any).select().single();
        if (!error && data) return data;
      }
    }

    if (reward.id) {
      this.rewards = this.rewards.map(r => (r.id === reward.id ? ({ ...r, ...reward } as Reward) : r));
    } else {
      const newReward: Reward = {
        id: `rew-${Date.now()}`,
        title: reward.title || 'New Reward',
        description: reward.description || '',
        coin_cost: reward.coin_cost || 100,
        image_url: reward.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        stock: reward.stock ?? 50,
        active: reward.active ?? true,
        sort_order: reward.sort_order ?? this.rewards.length + 1,
        created_at: new Date().toISOString(),
      };
      this.rewards.push(newReward);
    }
    this.persist('canteen_rewards', this.rewards);
    return this.rewards[this.rewards.length - 1];
  }

  async deleteReward(id: string): Promise<void> {
    if (isSupabaseConfigured && !id.startsWith('rew-')) {
      await (supabase as any).from('rewards').delete().eq('id', id);
    }
    this.rewards = this.rewards.filter(r => r.id !== id);
    this.persist('canteen_rewards', this.rewards);
  }

  // --- Milestones ---
  async getMilestones(): Promise<Milestone[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await (supabase as any).from('milestones').select('*').order('threshold_lifetime_earned', { ascending: true });
      if (!error && data && data.length > 0) return data;
    }
    return this.milestones;
  }

  async saveMilestone(milestone: Partial<Milestone>): Promise<Milestone> {
    if (isSupabaseConfigured) {
      if (milestone.id && !milestone.id.startsWith('ms-')) {
        const { data, error } = await (supabase as any).from('milestones').update(milestone).eq('id', milestone.id).select().single();
        if (!error && data) return data;
      } else {
        const { data, error } = await (supabase as any).from('milestones').insert(milestone as any).select().single();
        if (!error && data) return data;
      }
    }

    if (milestone.id) {
      this.milestones = this.milestones.map(m => (m.id === milestone.id ? ({ ...m, ...milestone } as Milestone) : m));
    } else {
      const newMs: Milestone = {
        id: `ms-${Date.now()}`,
        name: milestone.name || 'New Tier',
        threshold_lifetime_earned: milestone.threshold_lifetime_earned || 500,
        bonus_coins: milestone.bonus_coins || 50,
        badge: milestone.badge || '⭐',
        active: milestone.active ?? true,
        created_at: new Date().toISOString(),
      };
      this.milestones.push(newMs);
    }
    this.persist('canteen_milestones', this.milestones);
    return this.milestones[this.milestones.length - 1];
  }

  // --- Transactions ---
  async getTransactions(userId?: string): Promise<Transaction[]> {
    if (isSupabaseConfigured) {
      let query = (supabase as any).from('transactions').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) return data;
    }

    if (userId) {
      return this.transactions.filter(t => t.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...this.transactions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- Redemptions ---
  async getRedemptions(userId?: string): Promise<Redemption[]> {
    if (isSupabaseConfigured) {
      let query = (supabase as any).from('redemptions').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) return data;
    }

    if (userId) {
      return this.redemptions.filter(r => r.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...this.redemptions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- ATOMIC ACTIONS (issue_coins, redeem_reward, verify_redemption, reverse_transaction) ---

  async issueCoins(
    studentId: string,
    billAmount: number,
    staffId: string,
    note?: string
  ): Promise<{ success: boolean; coinsAwarded: number; bonusCoins: number; newBalance: number; message: string }> {
    if (billAmount <= 0) {
      throw new Error('Amount must be greater than ₹0');
    }

    const calc = this.calculateCoinsForAmount(billAmount);

    if (isSupabaseConfigured && !studentId.startsWith('u-')) {
      try {
        const { data, error } = await (supabase as any).rpc('issue_coins', {
          p_student_id: studentId,
          p_bill_amount: billAmount,
          p_idempotency_key: `staff-issue-${Date.now()}`,
          p_note: note || `Canteen Purchase: ₹${billAmount}`,
        });
        if (error) throw error;
        const res = data as any;
        return {
          success: true,
          coinsAwarded: res.coins_awarded || calc.baseCoins,
          bonusCoins: res.bonus_coins || 0,
          newBalance: res.new_balance || 0,
          message: `Successfully issued ${res.total_coins_added || calc.totalCoins} coins!`,
        };
      } catch (err: any) {
        console.error('Supabase issue_coins error, falling back:', err);
      }
    }

    // Local engine simulation
    const users = JSON.parse(localStorage.getItem('canteen_all_users') || '[]');
    const student = users.find((u: any) => u.id === studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    const coinsToAdd = calc.totalCoins;
    student.wallet = student.wallet || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 };
    student.wallet.balance += coinsToAdd;
    student.wallet.lifetime_earned += coinsToAdd;

    // Check milestone trigger
    let bonusTotal = 0;
    const activeMilestones = this.milestones.filter(m => m.active && m.threshold_lifetime_earned <= student.wallet.lifetime_earned);
    
    // Save updated users
    localStorage.setItem('canteen_all_users', JSON.stringify(users.map((u: any) => u.id === studentId ? student : u)));

    // Create Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: studentId,
      kind: 'earn',
      coins_delta: coinsToAdd,
      bill_amount: billAmount,
      slab_id: calc.slab?.id || null,
      reward_id: null,
      redemption_id: null,
      reversal_of: null,
      note: note || `Canteen Purchase: ₹${billAmount}`,
      created_by: staffId,
      idempotency_key: `key-${Date.now()}`,
      is_demo: true,
      created_at: new Date().toISOString(),
    };

    this.transactions.unshift(newTx);
    this.persist('canteen_transactions', this.transactions);

    return {
      success: true,
      coinsAwarded: coinsToAdd,
      bonusCoins: bonusTotal,
      newBalance: student.wallet.balance,
      message: `Successfully issued +${coinsToAdd} coins to ${student.full_name}!`,
    };
  }

  async redeemReward(userId: string, rewardId: string): Promise<{ success: boolean; code: string; redemption: Redemption; message: string }> {
    const reward = this.rewards.find(r => r.id === rewardId);
    if (!reward || !reward.active) {
      throw new Error('Reward unavailable or out of stock.');
    }
    if (reward.stock !== null && reward.stock <= 0) {
      throw new Error('This reward is currently out of stock.');
    }

    if (isSupabaseConfigured && !userId.startsWith('u-')) {
      try {
        const { data, error } = await (supabase as any).rpc('redeem_reward', {
          p_reward_id: rewardId,
          p_idempotency_key: `redeem-${Date.now()}`,
        });
        if (error) throw error;
        const res = data as any;
        return {
          success: true,
          code: res.code,
          redemption: {
            id: res.redemption_id,
            user_id: userId,
            reward_id: rewardId,
            coin_cost: reward.coin_cost,
            code: res.code,
            code_hash: 'hash',
            status: 'pending',
            expires_at: res.expires_at,
            used_at: null,
            verified_by: null,
            is_demo: false,
            created_at: new Date().toISOString(),
          },
          message: `Redeemed ${reward.title}!`,
        };
      } catch (err: any) {
        console.error('Supabase redeem_reward error:', err);
      }
    }

    // Local engine
    const users = JSON.parse(localStorage.getItem('canteen_all_users') || '[]');
    const user = users.find((u: any) => u.id === userId);
    if (!user || (user.wallet?.balance || 0) < reward.coin_cost) {
      throw new Error('Insufficient coin balance.');
    }

    // Deduct coins
    user.wallet.balance -= reward.coin_cost;
    user.wallet.lifetime_spent += reward.coin_cost;
    localStorage.setItem('canteen_all_users', JSON.stringify(users.map((u: any) => u.id === userId ? user : u)));

    // Reduce stock
    if (reward.stock !== null) {
      reward.stock -= 1;
      this.persist('canteen_rewards', this.rewards);
    }

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `CAF-${randomSuffix}`;

    const newRedemption: Redemption = {
      id: `red-${Date.now()}`,
      user_id: userId,
      reward_id: rewardId,
      coin_cost: reward.coin_cost,
      code,
      code_hash: `hash-${code}`,
      status: 'pending',
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      used_at: null,
      verified_by: null,
      is_demo: true,
      created_at: new Date().toISOString(),
    };

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: userId,
      kind: 'redeem',
      coins_delta: -reward.coin_cost,
      bill_amount: null,
      slab_id: null,
      reward_id: rewardId,
      redemption_id: newRedemption.id,
      reversal_of: null,
      note: `Redeemed reward: ${reward.title}`,
      created_by: userId,
      idempotency_key: `key-${Date.now()}`,
      is_demo: true,
      created_at: new Date().toISOString(),
    };

    this.redemptions.unshift(newRedemption);
    this.transactions.unshift(newTx);
    this.persist('canteen_redemptions', this.redemptions);
    this.persist('canteen_transactions', this.transactions);

    return {
      success: true,
      code,
      redemption: newRedemption,
      message: `Reward unlocked! Show code ${code} at the counter.`,
    };
  }

  async verifyRedemption(code: string, staffId: string): Promise<{ success: boolean; redemption: Redemption; rewardTitle: string; studentName: string; rollNo: string; message: string }> {
    const cleanCode = code.trim().toUpperCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase as any).rpc('verify_redemption', { p_code: cleanCode });
        if (error) throw error;
        const res = data as any;
        return {
          success: true,
          redemption: {
            id: res.redemption_id,
            user_id: '',
            reward_id: '',
            coin_cost: res.coin_cost,
            code: cleanCode,
            code_hash: '',
            status: 'used',
            expires_at: '',
            used_at: res.used_at,
            verified_by: staffId,
            is_demo: false,
            created_at: '',
          },
          rewardTitle: res.reward_title,
          studentName: res.student_name,
          rollNo: res.student_roll_no,
          message: `Code verified! ${res.reward_title} redeemed for ${res.student_name}.`,
        };
      } catch (err: any) {
        console.error('Supabase verify_redemption error:', err);
      }
    }

    // Local engine
    const red = this.redemptions.find(r => r.code.toUpperCase() === cleanCode);
    if (!red) {
      throw new Error(`Redemption code ${cleanCode} not found.`);
    }
    if (red.status === 'used') {
      throw new Error(`This code has ALREADY been used on ${new Date(red.used_at!).toLocaleString()}.`);
    }
    if (new Date(red.expires_at).getTime() < Date.now()) {
      red.status = 'expired';
      this.persist('canteen_redemptions', this.redemptions);
      throw new Error('This redemption code has expired.');
    }

    red.status = 'used';
    red.used_at = new Date().toISOString();
    red.verified_by = staffId;
    this.persist('canteen_redemptions', this.redemptions);

    const users = JSON.parse(localStorage.getItem('canteen_all_users') || '[]');
    const student = users.find((u: any) => u.id === red.user_id);
    const reward = this.rewards.find(r => r.id === red.reward_id);

    return {
      success: true,
      redemption: red,
      rewardTitle: reward?.title || 'Cafe Reward',
      studentName: student?.full_name || 'Student',
      rollNo: student?.roll_no || 'N/A',
      message: `Verified successfully! Mark item as handed over.`,
    };
  }

  async reverseTransaction(txId: string, adminId: string, reason: string): Promise<{ success: boolean; message: string }> {
    if (!reason.trim()) {
      throw new Error('Audit reason is required for reversing transactions.');
    }

    if (isSupabaseConfigured && !txId.startsWith('tx-')) {
      try {
        const { data, error } = await (supabase as any).rpc('reverse_transaction', {
          p_transaction_id: txId,
          p_reason: reason,
        });
        if (error) throw error;
        return { success: true, message: 'Transaction successfully reversed with audit record.' };
      } catch (err: any) {
        console.error('Supabase reverse_transaction error:', err);
      }
    }

    // Local engine
    const origTx = this.transactions.find(t => t.id === txId);
    if (!origTx) throw new Error('Transaction not found');
    if (origTx.kind === 'reversal') throw new Error('Cannot reverse a reversal transaction');

    const alreadyReversed = this.transactions.some(t => t.reversal_of === txId);
    if (alreadyReversed) throw new Error('This transaction has already been reversed.');

    const reversalDelta = -origTx.coins_delta;

    // Update student wallet
    const users = JSON.parse(localStorage.getItem('canteen_all_users') || '[]');
    const student = users.find((u: any) => u.id === origTx.user_id);
    if (student && student.wallet) {
      student.wallet.balance += reversalDelta;
      localStorage.setItem('canteen_all_users', JSON.stringify(users.map((u: any) => u.id === origTx.user_id ? student : u)));
    }

    const reversalTx: Transaction = {
      id: `tx-rev-${Date.now()}`,
      user_id: origTx.user_id,
      kind: 'reversal',
      coins_delta: reversalDelta,
      bill_amount: null,
      slab_id: null,
      reward_id: null,
      redemption_id: null,
      reversal_of: txId,
      note: `Reversal: ${reason}`,
      created_by: adminId,
      idempotency_key: `rev-${Date.now()}`,
      is_demo: true,
      created_at: new Date().toISOString(),
    };

    this.transactions.unshift(reversalTx);
    this.persist('canteen_transactions', this.transactions);

    return { success: true, message: `Reversed ${origTx.coins_delta} coins. Balance updated.` };
  }

  // Reset to default seed data
  resetDemoData() {
    localStorage.setItem('canteen_slabs', JSON.stringify(DEFAULT_SLABS));
    localStorage.setItem('canteen_rewards', JSON.stringify(DEFAULT_REWARDS));
    localStorage.setItem('canteen_milestones', JSON.stringify(DEFAULT_MILESTONES));
    localStorage.setItem('canteen_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem('canteen_redemptions', JSON.stringify(DEFAULT_REDEMPTIONS));
    this.loadLocalData();
  }
}

export const dataService = new DataService();
