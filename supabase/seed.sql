-- ==============================================================================
-- Campus Canteen Rewards — Phase 1 Realistic Seed Data
-- ==============================================================================

-- 1. SEED COIN SLABS
INSERT INTO public.coin_slabs (id, name, min_amount, max_amount, coins_flat, coins_percent, priority, active)
VALUES
    ('c0a80101-0001-4000-8000-000000000001', 'Quick Bites (₹0–₹99)', 0.00, 99.99, 5, 0, 10, true),
    ('c0a80101-0001-4000-8000-000000000002', 'Daily Lunch (₹100–₹199)', 100.00, 199.99, 15, 0, 20, true),
    ('c0a80101-0001-4000-8000-000000000003', 'Combo Meal (₹200–₹299)', 200.00, 299.99, 30, 0, 30, true),
    ('c0a80101-0001-4000-8000-000000000004', 'Group Feast (₹300–₹499)', 300.00, 499.99, 50, 0, 40, true),
    ('c0a80101-0001-4000-8000-000000000005', 'Party Order (₹500–₹999)', 500.00, 999.99, 100, 0, 50, true),
    ('c0a80101-0001-4000-8000-000000000006', 'Grand Cater (₹1000+)', 1000.00, NULL, 250, 0, 60, true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED REWARDS CATALOG
INSERT INTO public.rewards (id, title, description, coin_cost, image_url, stock, active, sort_order)
VALUES
    ('r0a80101-0002-4000-8000-000000000001', 'Artisan Espresso / Americano', 'Freshly brewed single-origin espresso or smooth iced americano at the Campus Cafe counter.', 150, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 100, true, 1),
    ('r0a80101-0002-4000-8000-000000000002', 'Crispy Paneer Grilled Sandwich', 'Toasted sourdough with marinated cottage cheese, mint chutney, and molten mozzarella.', 300, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80', 50, true, 2),
    ('r0a80101-0002-4000-8000-000000000003', 'Hazelnut Iced Frappe', 'Chilled creamy hazelnut blend topped with chocolate drizzle and whipped foam.', 350, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80', 60, true, 3),
    ('r0a80101-0002-4000-8000-000000000004', 'Cafe Supreme Meal Combo', 'Choice of classic burger or club sandwich + seasoned waffle fries + iced drink.', 600, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80', 30, true, 4),
    ('r0a80101-0002-4000-8000-000000000005', 'Fudge Brownie Sundae', 'Warm Dutch cocoa brownie served with Madagascan vanilla scoop and roasted nuts.', 250, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', 40, true, 5),
    ('r0a80101-0002-4000-8000-000000000006', 'V.I.P Study Snacking Platter', 'Loaded nachos, cheese poppers, garlic dips and two beverages for marathon study sessions.', 1000, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80', 15, true, 6)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED MILESTONES
INSERT INTO public.milestones (id, name, threshold_lifetime_earned, bonus_coins, badge, active)
VALUES
    ('m0a80101-0003-4000-8000-000000000001', 'Bronze Canteen Explorer', 250, 25, '🥉', true),
    ('m0a80101-0003-4000-8000-000000000002', 'Silver Campus Foodie', 750, 75, '🥈', true),
    ('m0a80101-0003-4000-8000-000000000003', 'Gold Cafe VIP', 1500, 150, '🥇', true),
    ('m0a80101-0003-4000-8000-000000000004', 'Platinum Canteen Legend', 3000, 300, '👑', true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED APP SETTINGS
INSERT INTO public.app_settings (key, value)
VALUES
    ('general', '{"app_name": "Campus Canteen Rewards", "currency_symbol": "₹", "currency_code": "INR", "support_email": "canteen@campus.edu"}'::jsonb),
    ('security', '{"qr_token_ttl_minutes": 15, "redemption_code_ttl_hours": 24, "rate_limit_per_minute": 30}'::jsonb),
    ('demo_mode', '{"enabled": false, "allow_guest_preview": true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
