-- ==============================================================================
-- Campus Canteen Rewards — Phase 1 Initial Schema Migration
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with student/staff metadata
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    roll_no TEXT UNIQUE NOT NULL,
    email TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. USER ROLES TABLE
-- Role mapping (student, staff, admin) separated from profiles for security
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'staff', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY(user_id, role)
);

-- 3. WALLETS TABLE
-- Coin balances and lifetime telemetry. Never directly updated by client frontend.
CREATE TABLE IF NOT EXISTS public.wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_earned >= 0),
    lifetime_spent INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_spent >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. COIN SLABS TABLE
-- Configurable spending tier rules for offline canteen purchases
CREATE TABLE IF NOT EXISTS public.coin_slabs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    min_amount NUMERIC(10, 2) NOT NULL CHECK (min_amount >= 0),
    max_amount NUMERIC(10, 2) CHECK (max_amount IS NULL OR max_amount >= min_amount),
    coins_flat INTEGER NOT NULL DEFAULT 0 CHECK (coins_flat >= 0),
    coins_percent NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (coins_percent >= 0),
    priority INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. REWARDS CATALOG TABLE
-- Cafe items and vouchers redeemable with coins
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    coin_cost INTEGER NOT NULL CHECK (coin_cost > 0),
    image_url TEXT,
    stock INTEGER CHECK (stock IS NULL OR stock >= 0),
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. MILESTONES TABLE
-- Spending tiers that reward bonus coins and badges
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    threshold_lifetime_earned INTEGER NOT NULL CHECK (threshold_lifetime_earned > 0),
    bonus_coins INTEGER NOT NULL DEFAULT 0 CHECK (bonus_coins >= 0),
    badge TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. MILESTONE AWARDS TABLE
-- Tracks awarded milestones to prevent duplicate bonuses
CREATE TABLE IF NOT EXISTS public.milestone_awards (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY(user_id, milestone_id)
);

-- 8. REDEMPTIONS TABLE
-- Generated voucher codes for cafe items
CREATE TABLE IF NOT EXISTS public.redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id),
    coin_cost INTEGER NOT NULL CHECK (coin_cost > 0),
    code TEXT NOT NULL,
    code_hash TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. TRANSACTIONS TABLE
-- Immutable financial and coin ledger
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('earn', 'redeem', 'bonus', 'adjust', 'reversal')),
    coins_delta INTEGER NOT NULL,
    bill_amount NUMERIC(10, 2),
    slab_id UUID REFERENCES public.coin_slabs(id),
    reward_id UUID REFERENCES public.rewards(id),
    redemption_id UUID REFERENCES public.redemptions(id),
    reversal_of UUID REFERENCES public.transactions(id),
    note TEXT,
    created_by UUID REFERENCES auth.users(id),
    idempotency_key TEXT UNIQUE,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. PURCHASE TOKENS TABLE
-- Rotating QR/identification tokens for students
CREATE TABLE IF NOT EXISTS public.purchase_tokens (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. APP SETTINGS TABLE
-- Application configurations (TTL, currency, demo mode flags)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR SCALE & SPEED (approx 150k+ transactions target)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_kind ON public.transactions(kind);
CREATE INDEX IF NOT EXISTS idx_transactions_is_demo ON public.transactions(is_demo);
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency ON public.transactions(idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON public.redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_code_hash ON public.redemptions(code_hash);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON public.redemptions(status);
CREATE INDEX IF NOT EXISTS idx_redemptions_expires_at ON public.redemptions(expires_at);

CREATE INDEX IF NOT EXISTS idx_profiles_roll_no ON public.profiles(roll_no);
CREATE INDEX IF NOT EXISTS idx_purchase_tokens_token ON public.purchase_tokens(token);
CREATE INDEX IF NOT EXISTS idx_rewards_active_order ON public.rewards(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_coin_slabs_active_priority ON public.coin_slabs(active, priority DESC);
