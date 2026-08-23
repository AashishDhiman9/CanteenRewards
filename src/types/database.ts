export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'staff' | 'admin';
export type TransactionKind = 'earn' | 'redeem' | 'bonus' | 'adjust' | 'reversal';
export type RedemptionStatus = 'pending' | 'used' | 'expired' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          roll_no: string;
          email: string | null;
          avatar: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          roll_no: string;
          email?: string | null;
          avatar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          roll_no?: string;
          email?: string | null;
          avatar?: string | null;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          user_id: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: UserRole;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: UserRole;
          created_at?: string;
        };
      };
      wallets: {
        Row: {
          user_id: string;
          balance: number;
          lifetime_earned: number;
          lifetime_spent: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          balance?: number;
          lifetime_earned?: number;
          lifetime_spent?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          balance?: number;
          lifetime_earned?: number;
          lifetime_spent?: number;
          updated_at?: string;
        };
      };
      coin_slabs: {
        Row: {
          id: string;
          name: string;
          min_amount: number;
          max_amount: number | null;
          coins_flat: number;
          coins_percent: number;
          priority: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          min_amount: number;
          max_amount?: number | null;
          coins_flat?: number;
          coins_percent?: number;
          priority?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          min_amount?: number;
          max_amount?: number | null;
          coins_flat?: number;
          coins_percent?: number;
          priority?: number;
          active?: boolean;
          created_at?: string;
        };
      };
      rewards: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          coin_cost: number;
          image_url: string | null;
          stock: number | null;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          coin_cost: number;
          image_url?: string | null;
          stock?: number | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          coin_cost?: number;
          image_url?: string | null;
          stock?: number | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      milestones: {
        Row: {
          id: string;
          name: string;
          threshold_lifetime_earned: number;
          bonus_coins: number;
          badge: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          threshold_lifetime_earned: number;
          bonus_coins?: number;
          badge?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          threshold_lifetime_earned?: number;
          bonus_coins?: number;
          badge?: string | null;
          active?: boolean;
          created_at?: string;
        };
      };
      milestone_awards: {
        Row: {
          user_id: string;
          milestone_id: string;
          awarded_at: string;
        };
        Insert: {
          user_id: string;
          milestone_id: string;
          awarded_at?: string;
        };
        Update: {
          user_id?: string;
          milestone_id?: string;
          awarded_at?: string;
        };
      };
      redemptions: {
        Row: {
          id: string;
          user_id: string;
          reward_id: string;
          coin_cost: number;
          code: string;
          code_hash: string;
          status: RedemptionStatus;
          expires_at: string;
          used_at: string | null;
          verified_by: string | null;
          is_demo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reward_id: string;
          coin_cost: number;
          code: string;
          code_hash: string;
          status?: RedemptionStatus;
          expires_at: string;
          used_at?: string | null;
          verified_by?: string | null;
          is_demo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reward_id?: string;
          coin_cost?: number;
          code?: string;
          code_hash?: string;
          status?: RedemptionStatus;
          expires_at?: string;
          used_at?: string | null;
          verified_by?: string | null;
          is_demo?: boolean;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          kind: TransactionKind;
          coins_delta: number;
          bill_amount: number | null;
          slab_id: string | null;
          reward_id: string | null;
          redemption_id: string | null;
          reversal_of: string | null;
          note: string | null;
          created_by: string | null;
          idempotency_key: string | null;
          is_demo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          kind: TransactionKind;
          coins_delta: number;
          bill_amount?: number | null;
          slab_id?: string | null;
          reward_id?: string | null;
          redemption_id?: string | null;
          reversal_of?: string | null;
          note?: string | null;
          created_by?: string | null;
          idempotency_key?: string | null;
          is_demo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          kind?: TransactionKind;
          coins_delta?: number;
          bill_amount?: number | null;
          slab_id?: string | null;
          reward_id?: string | null;
          redemption_id?: string | null;
          reversal_of?: string | null;
          note?: string | null;
          created_by?: string | null;
          idempotency_key?: string | null;
          is_demo?: boolean;
          created_at?: string;
        };
      };
      purchase_tokens: {
        Row: {
          user_id: string;
          token: string;
          expires_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          token: string;
          expires_at: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          token?: string;
          expires_at?: string;
          updated_at?: string;
        };
      };
      app_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
    };
    Functions: {
      has_role: {
        Args: { check_user_id: string; check_role: string };
        Returns: boolean;
      };
      is_staff_or_admin: {
        Args: { check_user_id: string };
        Returns: boolean;
      };
      claim_first_admin: {
        Args: Record<string, never>;
        Returns: Json;
      };
      issue_coins: {
        Args: {
          p_student_id: string;
          p_bill_amount: number;
          p_idempotency_key?: string;
          p_note?: string;
          p_is_demo?: boolean;
        };
        Returns: Json;
      };
      redeem_reward: {
        Args: {
          p_reward_id: string;
          p_idempotency_key?: string;
        };
        Returns: Json;
      };
      verify_redemption: {
        Args: {
          p_code: string;
        };
        Returns: Json;
      };
      reverse_transaction: {
        Args: {
          p_transaction_id: string;
          p_reason: string;
        };
        Returns: Json;
      };
      rotate_purchase_token: {
        Args: Record<string, never>;
        Returns: Json;
      };
    };
  };
}
