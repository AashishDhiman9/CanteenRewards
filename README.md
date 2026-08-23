# Campus Canteen Rewards — Full-Stack PWA Architecture & Setup

Campus Canteen Rewards is a mobile-first Progressive Web App loyalty system for college canteens and campus cafes. Offline canteen purchases earn students loyalty coins calculated from configurable spending slabs, which students can redeem for food and beverage rewards at the cafe counter.

---

## 1. Project Architecture

The application adopts a **Client-Centric, Backend-Secure Architecture** using Supabase (PostgreSQL + Auth + Row Level Security + Atomic Database Functions) and React (Vite + TypeScript + Tailwind CSS + TanStack Query).

```
┌────────────────────────────────────────────────────────┐
│               Student / Staff / Admin PWA              │
│       (React 19 + TypeScript + Vite + Tailwind CSS)    │
└──────────────────────────┬─────────────────────────────┘
                           │ Supabase JS Client
                           ▼
┌────────────────────────────────────────────────────────┐
│            Supabase Backend (PostgreSQL)               │
├────────────────────────────────────────────────────────┤
│  • Auth: Email + Password & Secure Session JWTs        │
│  • Tables: profiles, user_roles, wallets, coin_slabs,  │
│    rewards, milestones, milestone_awards, redemptions, │
│    transactions, purchase_tokens, app_settings         │
│  • Security: Row Level Security (RLS) on all tables    │
│  • Atomic RPCs (SECURITY DEFINER):                     │
│    - has_role(uid, role)                               │
│    - claim_first_admin()                               │
│    - issue_coins(student_id, bill_amount, ...)         │
│    - redeem_reward(reward_id, ...)                     │
│    - verify_redemption(code)                           │
│    - reverse_transaction(tx_id, reason)                │
│    - rotate_purchase_token()                           │
└────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── README.md
├── supabase/
│   ├── migrations/
│   │   ├── 20260822000001_initial_schema.sql
│   │   └── 20260822000002_security_rls_functions.sql
│   └── seed.sql
├── src/
│   ├── components/       # Common UI elements, modals, cards, scanner
│   ├── layouts/          # Student, Staff, Admin shell layouts with nav
│   ├── pages/            # Student, Staff, Admin views
│   ├── hooks/            # Custom hooks for auth, wallet, scan, network
│   ├── lib/              # Supabase client, formatting utils, crypto helpers
│   ├── types/            # Database & domain TypeScript definitions
│   ├── App.tsx           # Router and top-level providers
│   ├── main.tsx          # Application entry point
│   └── index.css         # Tailwind CSS styling
```

---

## 3. Database Relationship Diagram (Text-Based)

```
                    ┌─────────────────────────┐
                    │      auth.users         │
                    └────────────┬────────────┘
                                 │ 1:1
                 ┌───────────────┼───────────────┬──────────────┐
                 │ 1:1           │ 1:N           │ 1:1          │ 1:1
                 ▼               ▼               ▼              ▼
         ┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌────────────────┐
         │   profiles   │ │  user_roles  │ │ wallets  │ │purchase_tokens │
         └──────────────┘ └──────────────┘ └──────────┘ └────────────────┘
                 ▲
                 │ (1:N via student_id / user_id)
                 ├──────────────────────────────┐
                 │                              │
                 ▼                              ▼
      ┌──────────────────────┐      ┌───────────────────────┐
      │     transactions     │      │      redemptions      │
      └──────────┬───────────┘      └───────────┬───────────┘
                 │                              │
        ┌────────┴────────┐                     │
   (N:1)│            (N:1)│                (N:1)│
        ▼                 ▼                     ▼
┌──────────────┐   ┌──────────────┐      ┌──────────────┐
│  coin_slabs  │   │   rewards    │◄─────┤   rewards    │
└──────────────┘   └──────────────┘      └──────────────┘
                          ▲
                          │ (N:1)
                   ┌──────────────┐
                   │  milestones  │
                   └──────┬───────┘
                          │ 1:N
                          ▼
               ┌──────────────────────┐
               │   milestone_awards   │ (user_id + milestone_id)
               └──────────────────────┘
```

---

## 4. Supabase Setup & Migration Guide

1. Create a free project at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor** in your Supabase dashboard.
3. Run the migrations in order:
   - `supabase/migrations/20260822000001_initial_schema.sql`
   - `supabase/migrations/20260822000002_security_rls_functions.sql`
   - `supabase/seed.sql`
4. Copy your **Project URL** and **anon public API Key** from **Project Settings -> API**.
5. Add them to `.env.local` or environment secrets:
   ```env
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-public-key"
   ```
6. The app is ready to run with complete server-side security, row locking, and atomic coin calculations.
