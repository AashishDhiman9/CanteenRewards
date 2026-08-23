-- ==============================================================================
-- Campus Canteen Rewards — Phase 1 Security, RLS & Atomic Functions
-- ==============================================================================

-- 1. SECURITY DEFINER: Role Checker
-- Checks whether a user has a specific role without exposing direct table writes
CREATE OR REPLACE FUNCTION public.has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = check_user_id AND role = check_role
    );
END;
$$;

-- 2. SECURITY DEFINER: Check if user is staff OR admin
CREATE OR REPLACE FUNCTION public.is_staff_or_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = check_user_id AND role IN ('staff', 'admin')
    );
END;
$$;

-- 3. SECURITY DEFINER: First Admin Bootstrap
-- Secure atomic claim: Only grants admin if NO admin currently exists in the entire system
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    current_uid UUID;
    admin_count INT;
BEGIN
    current_uid := auth.uid();
    IF current_uid IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User must be signed in.';
    END IF;

    -- Lock roles table to prevent race conditions during bootstrap
    PERFORM 1 FROM public.user_roles WHERE role = 'admin' FOR UPDATE;
    
    SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
    
    IF admin_count > 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Admin already exists. Contact existing admin for role assignment.');
    END IF;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (current_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN jsonb_build_object('success', true, 'message', 'Successfully bootstrapped as first Admin.');
END;
$$;

-- 4. TRIGGER: On Auth User Signup -> Create Profile, Wallet & Assign Student Role
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    raw_roll_no TEXT;
    raw_full_name TEXT;
BEGIN
    raw_roll_no := COALESCE(NEW.raw_user_meta_data->>'roll_no', 'ROLL-' || substr(NEW.id::text, 1, 8));
    raw_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student');

    -- Insert Profile
    INSERT INTO public.profiles (id, full_name, roll_no, email)
    VALUES (NEW.id, raw_full_name, UPPER(TRIM(raw_roll_no)), NEW.email)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    -- Initialize Wallet
    INSERT INTO public.wallets (user_id, balance, lifetime_earned, lifetime_spent)
    VALUES (NEW.id, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- Assign Default Student Role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Generate Initial Rotating QR Token (Valid for 15 minutes)
    INSERT INTO public.purchase_tokens (user_id, token, expires_at)
    VALUES (
        NEW.id, 
        'TOK-' || UPPER(substr(encode(gen_random_bytes(6), 'hex'), 1, 10)),
        now() + INTERVAL '15 minutes'
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();

-- 5. ATOMIC RPC: Issue Coins on Offline Canteen Purchase
CREATE OR REPLACE FUNCTION public.issue_coins(
    p_student_id UUID,
    p_bill_amount NUMERIC,
    p_idempotency_key TEXT DEFAULT NULL,
    p_note TEXT DEFAULT NULL,
    p_is_demo BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_slab RECORD;
    v_coins_to_award INT := 0;
    v_tx_id UUID;
    v_new_balance INT;
    v_new_lifetime INT;
    v_milestone RECORD;
    v_bonus_total INT := 0;
BEGIN
    v_caller_id := auth.uid();
    
    -- 1. Authorization check
    IF v_caller_id IS NULL OR NOT public.is_staff_or_admin(v_caller_id) THEN
        RAISE EXCEPTION 'Unauthorized: Only staff and admin can issue coins.';
    END IF;

    -- 2. Validation
    IF p_bill_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid bill amount: Amount must be greater than zero.';
    END IF;

    -- 3. Idempotency Check
    IF p_idempotency_key IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.transactions WHERE idempotency_key = p_idempotency_key) THEN
            RETURN jsonb_build_object(
                'success', true, 
                'message', 'Transaction already processed (idempotent)',
                'idempotent', true
            );
        END IF;
    END IF;

    -- 4. Determine matching coin slab
    SELECT * INTO v_slab
    FROM public.coin_slabs
    WHERE active = true
      AND min_amount <= p_bill_amount
      AND (max_amount IS NULL OR max_amount >= p_bill_amount)
    ORDER BY priority DESC, min_amount DESC
    LIMIT 1;

    IF v_slab.id IS NOT NULL THEN
        v_coins_to_award := COALESCE(v_slab.coins_flat, 0) + FLOOR((p_bill_amount * COALESCE(v_slab.coins_percent, 0)) / 100)::INT;
    ELSE
        -- Fallback default: 5% if no slab matched
        v_coins_to_award := GREATEST(1, FLOOR(p_bill_amount * 0.05)::INT);
    END IF;

    -- 5. Lock Wallet Row for student
    PERFORM 1 FROM public.wallets WHERE user_id = p_student_id FOR UPDATE;

    -- 6. Insert Transaction
    INSERT INTO public.transactions (
        user_id,
        kind,
        coins_delta,
        bill_amount,
        slab_id,
        note,
        created_by,
        idempotency_key,
        is_demo
    ) VALUES (
        p_student_id,
        'earn',
        v_coins_to_award,
        p_bill_amount,
        v_slab.id,
        COALESCE(p_note, 'Canteen purchase of ₹' || p_bill_amount),
        v_caller_id,
        p_idempotency_key,
        p_is_demo
    ) RETURNING id INTO v_tx_id;

    -- 7. Update Wallet
    UPDATE public.wallets
    SET 
        balance = balance + v_coins_to_award,
        lifetime_earned = lifetime_earned + v_coins_to_award,
        updated_at = now()
    WHERE user_id = p_student_id
    RETURNING balance, lifetime_earned INTO v_new_balance, v_new_lifetime;

    -- 8. Check & Award Unlocked Milestones
    FOR v_milestone IN 
        SELECT m.* 
        FROM public.milestones m
        WHERE m.active = true
          AND m.threshold_lifetime_earned <= v_new_lifetime
          AND NOT EXISTS (
              SELECT 1 FROM public.milestone_awards ma 
              WHERE ma.user_id = p_student_id AND ma.milestone_id = m.id
          )
    LOOP
        -- Record Milestone Award
        INSERT INTO public.milestone_awards (user_id, milestone_id)
        VALUES (p_student_id, v_milestone.id);

        -- Award Bonus if specified
        IF v_milestone.bonus_coins > 0 THEN
            INSERT INTO public.transactions (
                user_id,
                kind,
                coins_delta,
                note,
                created_by,
                is_demo
            ) VALUES (
                p_student_id,
                'bonus',
                v_milestone.bonus_coins,
                'Milestone Bonus: ' || v_milestone.name,
                v_caller_id,
                p_is_demo
            );

            UPDATE public.wallets
            SET balance = balance + v_milestone.bonus_coins,
                lifetime_earned = lifetime_earned + v_milestone.bonus_coins,
                updated_at = now()
            WHERE user_id = p_student_id;

            v_bonus_total := v_bonus_total + v_milestone.bonus_coins;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'coins_awarded', v_coins_to_award,
        'bonus_coins', v_bonus_total,
        'total_coins_added', v_coins_to_award + v_bonus_total,
        'new_balance', v_new_balance + v_bonus_total
    );
END;
$$;

-- 6. ATOMIC RPC: Redeem Reward
CREATE OR REPLACE FUNCTION public.redeem_reward(
    p_reward_id UUID,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_reward RECORD;
    v_wallet RECORD;
    v_code TEXT;
    v_code_hash TEXT;
    v_redemption_id UUID;
    v_tx_id UUID;
    v_expires_at TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Must be logged in to redeem rewards.';
    END IF;

    -- 1. Lock reward & verify availability
    SELECT * INTO v_reward
    FROM public.rewards
    WHERE id = p_reward_id AND active = true
    FOR UPDATE;

    IF v_reward.id IS NULL THEN
        RAISE EXCEPTION 'Reward not found or is currently inactive.';
    END IF;

    IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
        RAISE EXCEPTION 'Sorry, this reward is out of stock.';
    END IF;

    -- 2. Lock user wallet & verify coin balance
    SELECT * INTO v_wallet
    FROM public.wallets
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_wallet.balance < v_reward.coin_cost THEN
        RAISE EXCEPTION 'Insufficient coin balance. Required: %, Available: %', v_reward.coin_cost, v_wallet.balance;
    END IF;

    -- 3. Generate Unique Human-Readable Code (e.g. CAF-8X29K) and SHA-256 Hash
    v_code := 'CAF-' || UPPER(substr(encode(gen_random_bytes(4), 'hex'), 1, 5));
    v_code_hash := encode(digest(v_code, 'sha256'), 'hex');
    v_expires_at := now() + INTERVAL '24 hours';

    -- 4. Deduct Stock if limited
    IF v_reward.stock IS NOT NULL THEN
        UPDATE public.rewards
        SET stock = stock - 1
        WHERE id = p_reward_id;
    END IF;

    -- 5. Insert Redemption
    INSERT INTO public.redemptions (
        user_id,
        reward_id,
        coin_cost,
        code,
        code_hash,
        status,
        expires_at
    ) VALUES (
        v_user_id,
        p_reward_id,
        v_reward.coin_cost,
        v_code,
        v_code_hash,
        'pending',
        v_expires_at
    ) RETURNING id INTO v_redemption_id;

    -- 6. Insert Transaction
    INSERT INTO public.transactions (
        user_id,
        kind,
        coins_delta,
        reward_id,
        redemption_id,
        note,
        created_by,
        idempotency_key
    ) VALUES (
        v_user_id,
        'redeem',
        -v_reward.coin_cost,
        p_reward_id,
        v_redemption_id,
        'Redeemed reward: ' || v_reward.title,
        v_user_id,
        p_idempotency_key
    ) RETURNING id INTO v_tx_id;

    -- 7. Update Wallet
    UPDATE public.wallets
    SET balance = balance - v_reward.coin_cost,
        lifetime_spent = lifetime_spent + v_reward.coin_cost,
        updated_at = now()
    WHERE user_id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'redemption_id', v_redemption_id,
        'code', v_code,
        'reward_title', v_reward.title,
        'coin_cost', v_reward.coin_cost,
        'expires_at', v_expires_at,
        'remaining_balance', v_wallet.balance - v_reward.coin_cost
    );
END;
$$;

-- 7. ATOMIC RPC: Verify & Claim Redemption at Cafe Counter (Staff/Admin)
CREATE OR REPLACE FUNCTION public.verify_redemption(
    p_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_code_clean TEXT;
    v_code_hash TEXT;
    v_redemption RECORD;
    v_student_profile RECORD;
    v_reward RECORD;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL OR NOT public.is_staff_or_admin(v_caller_id) THEN
        RAISE EXCEPTION 'Unauthorized: Only cafe staff and administrators can verify redemption codes.';
    END IF;

    v_code_clean := UPPER(TRIM(p_code));
    v_code_hash := encode(digest(v_code_clean, 'sha256'), 'hex');

    -- Find redemption by hash or direct code
    SELECT * INTO v_redemption
    FROM public.redemptions
    WHERE (code_hash = v_code_hash OR code = v_code_clean)
    FOR UPDATE;

    IF v_redemption.id IS NULL THEN
        RAISE EXCEPTION 'Invalid redemption code: Code not found.';
    END IF;

    IF v_redemption.status = 'used' THEN
        RAISE EXCEPTION 'Code has already been used on %.', to_char(v_redemption.used_at, 'YYYY-MM-DD HH24:MI');
    END IF;

    IF v_redemption.status = 'cancelled' THEN
        RAISE EXCEPTION 'This redemption code has been cancelled.';
    END IF;

    IF v_redemption.expires_at < now() THEN
        UPDATE public.redemptions SET status = 'expired' WHERE id = v_redemption.id;
        RAISE EXCEPTION 'This redemption code has expired.';
    END IF;

    -- Mark as used
    UPDATE public.redemptions
    SET status = 'used',
        used_at = now(),
        verified_by = v_caller_id
    WHERE id = v_redemption.id;

    -- Fetch info for display
    SELECT full_name, roll_no INTO v_student_profile FROM public.profiles WHERE id = v_redemption.user_id;
    SELECT title INTO v_reward FROM public.rewards WHERE id = v_redemption.reward_id;

    RETURN jsonb_build_object(
        'success', true,
        'redemption_id', v_redemption.id,
        'reward_title', v_reward.title,
        'student_name', v_student_profile.full_name,
        'student_roll_no', v_student_profile.roll_no,
        'coin_cost', v_redemption.coin_cost,
        'used_at', now()
    );
END;
$$;

-- 8. ATOMIC RPC: Reverse Transaction (Admin Only)
CREATE OR REPLACE FUNCTION public.reverse_transaction(
    p_transaction_id UUID,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_original_tx RECORD;
    v_reversal_delta INT;
    v_reversal_tx_id UUID;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL OR NOT public.has_role(v_caller_id, 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can reverse transactions.';
    END IF;

    IF TRIM(COALESCE(p_reason, '')) = '' THEN
        RAISE EXCEPTION 'Reversal reason is mandatory for audit trail.';
    END IF;

    -- Lock original transaction
    SELECT * INTO v_original_tx
    FROM public.transactions
    WHERE id = p_transaction_id
    FOR UPDATE;

    IF v_original_tx.id IS NULL THEN
        RAISE EXCEPTION 'Transaction not found.';
    END IF;

    IF v_original_tx.kind = 'reversal' THEN
        RAISE EXCEPTION 'Cannot reverse an existing reversal transaction.';
    END IF;

    IF EXISTS (SELECT 1 FROM public.transactions WHERE reversal_of = p_transaction_id) THEN
        RAISE EXCEPTION 'This transaction has already been reversed.';
    END IF;

    v_reversal_delta := -v_original_tx.coins_delta;

    -- Lock user wallet
    PERFORM 1 FROM public.wallets WHERE user_id = v_original_tx.user_id FOR UPDATE;

    -- Create Reversal Transaction
    INSERT INTO public.transactions (
        user_id,
        kind,
        coins_delta,
        reversal_of,
        note,
        created_by,
        is_demo
    ) VALUES (
        v_original_tx.user_id,
        'reversal',
        v_reversal_delta,
        p_transaction_id,
        'Reversal: ' || p_reason,
        v_caller_id,
        v_original_tx.is_demo
    ) RETURNING id INTO v_reversal_tx_id;

    -- Update Wallet
    UPDATE public.wallets
    SET balance = balance + v_reversal_delta,
        updated_at = now()
    WHERE user_id = v_original_tx.user_id;

    RETURN jsonb_build_object(
        'success', true,
        'reversal_transaction_id', v_reversal_tx_id,
        'original_transaction_id', p_transaction_id,
        'coins_adjusted', v_reversal_delta
    );
END;
$$;

-- 9. ATOMIC RPC: Rotate Purchase QR Token for Student
CREATE OR REPLACE FUNCTION public.rotate_purchase_token()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_new_token TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized.';
    END IF;

    v_new_token := 'TOK-' || UPPER(substr(encode(gen_random_bytes(6), 'hex'), 1, 10));
    v_expires_at := now() + INTERVAL '15 minutes';

    INSERT INTO public.purchase_tokens (user_id, token, expires_at, updated_at)
    VALUES (v_user_id, v_new_token, v_expires_at, now())
    ON CONFLICT (user_id) DO UPDATE SET
        token = EXCLUDED.token,
        expires_at = EXCLUDED.expires_at,
        updated_at = now();

    RETURN jsonb_build_object(
        'token', v_new_token,
        'expires_at', v_expires_at
    );
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_slabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Staff and admin can read all profiles" ON public.profiles
    FOR SELECT USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- USER ROLES POLICIES
CREATE POLICY "Users can read own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON public.user_roles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- WALLETS POLICIES
CREATE POLICY "Users can read own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff and admin can read student wallets" ON public.wallets
    FOR SELECT USING (public.is_staff_or_admin(auth.uid()));

-- COIN SLABS POLICIES (Public read active, Admin manage)
CREATE POLICY "Anyone can view active slabs" ON public.coin_slabs
    FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage coin slabs" ON public.coin_slabs
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- REWARDS POLICIES (Public read active, Admin manage)
CREATE POLICY "Anyone can view active rewards" ON public.rewards
    FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage rewards" ON public.rewards
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- MILESTONES POLICIES
CREATE POLICY "Anyone can view active milestones" ON public.milestones
    FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage milestones" ON public.milestones
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- MILESTONE AWARDS POLICIES
CREATE POLICY "Users can view own awards" ON public.milestone_awards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff and admin can view awards" ON public.milestone_awards
    FOR SELECT USING (public.is_staff_or_admin(auth.uid()));

-- TRANSACTIONS POLICIES (Read own or staff/admin read all; modifications ONLY via RPCs)
CREATE POLICY "Users can read own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff and admin can read all transactions" ON public.transactions
    FOR SELECT USING (public.is_staff_or_admin(auth.uid()));

-- REDEMPTIONS POLICIES
CREATE POLICY "Users can read own redemptions" ON public.redemptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff and admin can read all redemptions" ON public.redemptions
    FOR SELECT USING (public.is_staff_or_admin(auth.uid()));

-- PURCHASE TOKENS POLICIES
CREATE POLICY "Users can view and manage own purchase token" ON public.purchase_tokens
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Staff and admin can lookup tokens" ON public.purchase_tokens
    FOR SELECT USING (public.is_staff_or_admin(auth.uid()));

-- APP SETTINGS POLICIES
CREATE POLICY "Anyone can read app settings" ON public.app_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage app settings" ON public.app_settings
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));
