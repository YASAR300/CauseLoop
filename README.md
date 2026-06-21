<div align="center">

<br/>

<img src="public/landing.png" alt="CauseLoop Landing Page" width="100%" style="border-radius:16px;"/>

<br/><br/>

# ⛳ CauseLoop

### *Golf Scores × Charity Prize Draws × Real-World Impact*

**A premium full-stack subscription platform where golfers track their Stableford scores, enter monthly charity prize draws, and directly fund their chosen charity — all in one seamless experience.**

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-cause--loop.vercel.app-5227FF?style=for-the-badge&logo=vercel&logoColor=white)](https://cause-loop.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

<br/>

</div>

---

## 📋 Table of Contents

1. [What is CauseLoop?](#-what-is-causeloop)
2. [Live Screenshots](#-live-screenshots)
3. [System Architecture](#-system-architecture)
4. [Tech Stack](#-tech-stack)
5. [Project Structure](#-project-structure)
6. [Core Features](#-core-features)
7. [Database Schema](#-database-schema)
8. [API Routes Reference](#-api-routes-reference)
9. [Draw Engine Algorithm](#-draw-engine-algorithm)
10. [Email Notification System](#-email-notification-system)
11. [Authentication & Authorization](#-authentication--authorization)
12. [Stripe Payment Flow](#-stripe-payment-flow)
13. [Admin Panel](#-admin-panel)
14. [Environment Variables](#-environment-variables)
15. [Local Development Setup](#-local-development-setup)
16. [Deployment Guide](#-deployment-guide)
17. [User Journeys](#-user-journeys)

---

## 🎯 What is CauseLoop?

CauseLoop bridges **competitive golf**, **charity giving**, and **prize draws** into a single subscription platform. Here's the loop:

```
  Subscribe monthly (£12/mo)
         │
         ▼
  Log your Stableford golf scores (up to 5 rounds / rolling window)
         │
         ▼
  Your scores become your draw ticket numbers (1–45 range)
         │
         ▼
  Monthly admin-run draw — match 3, 4, or 5 numbers to win cash prizes
         │
         ▼
  40% of subscription revenue pools into jackpots (rolls over if unclaimed)
  + Your configured % goes directly to your chosen charity partner
         │
         ▼
  Winners upload proof of scores → Admin verifies → Payout processed
```

**Why CauseLoop?**

| Traditional Golf Apps | CauseLoop |
|---|---|
| Just track scores | Scores become draw ticket numbers |
| No financial benefit | Win real cash prizes (3-tier) |
| No social impact | 10%+ of subscription funds charity |
| Static leaderboards | Live monthly jackpot + rollover |
| Generic notifications | Premium transactional email system |

---

## 📸 Live Screenshots

### 🏠 Landing Page
> Premium dark-mode landing with Silk WebGL shader background, animated hero section, feature bento grid, charity spotlight, and pricing.

<img src="public/landing.png" alt="CauseLoop Landing Page" width="100%" style="border-radius:12px; margin-bottom:16px;"/>

---

### 🔐 Login Page
> Clean authentication form with Google OAuth + magic link + email/password. Auto-redirects authenticated users to dashboard.

<img src="public/login.png" alt="CauseLoop Login" width="100%" style="border-radius:12px; margin-bottom:16px;"/>

---

### 📊 Dashboard — Overview
> Supabase-Studio-style sidebar navigation with real-time stat cards, charity snapshot, draw eligibility summary, and live subscription status.

<img src="public/dashbord.png" alt="CauseLoop Dashboard" width="100%" style="border-radius:12px; margin-bottom:16px;"/>

---

### ⛳ My Scores — Scorecard
> Rolling 5-score Stableford window. Performance tiers (Excellent / Great / Good / Below Avg), CRUD operations, duplicate date guard, and oldest-score highlighted for upcoming rollover.

<img src="public/score.png" alt="CauseLoop Scorecard" width="100%" style="border-radius:12px; margin-bottom:16px;"/>

---

### 🏆 Draws & Winnings
> User's active draw entries, winner claim cards with status (Awaiting Upload / Awaiting Verification / Verified), proof upload with real-time spinner, and prize amounts.

<img src="public/drawandwin.png" alt="CauseLoop Draws and Winnings" width="100%" style="border-radius:12px; margin-bottom:16px;"/>

---

### ❤️ Charity Directory
> Searchable, filterable charity partner grid. Spotlight featured charity. One-off donation modal with Stripe Checkout. Category filters (Featured, Environment, Humanitarian, Wellbeing).

<img src="public/charity.png" alt="CauseLoop Charity Directory" width="100%" style="border-radius:12px; margin-bottom:16px;"/>

---

### 📈 Admin Reports
> Admin-only analytics panel with area charts (cumulative user growth), bar charts (charity supporter distribution), draw history, and winner claim management.

<img src="public/reports.png" alt="CauseLoop Admin Reports" width="100%" style="border-radius:12px; margin-bottom:16px;"/>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CAUSELOOP ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────────────────────┐
  │                         CLIENT BROWSER                                │
  │                                                                        │
  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────────────────┐    │
  │   │ Landing Page│   │ Auth Pages  │   │    Dashboard SPA        │    │
  │   │  (public/)  │   │ login/signup│   │ (sidebar + tab routing) │    │
  │   │             │   │ reset-pwd   │   │                         │    │
  │   │ ▪ Silk WebGL│   │             │   │ ▪ Overview Stats        │    │
  │   │ ▪ ScrollRevl│   │ ▪ Email/pwd │   │ ▪ Scorecard CRUD        │    │
  │   │ ▪ Charities │   │ ▪ OAuth     │   │ ▪ Charity Directory     │    │
  │   │ ▪ Pricing   │   │ ▪ Magic Link│   │ ▪ Draws & Winnings      │    │
  │   └──────┬──────┘   └──────┬──────┘   │ ▪ Settings              │    │
  │          │                 │          │ ▪ Admin Panels (if admin)│    │
  └──────────┼─────────────────┼──────────┴────────────┬────────────┘    │
             │                 │                        │                  │
             ▼                 ▼                        ▼                  │
  ┌──────────────────────────────────────────────────────────────────┐    │
  │                    NEXT.JS MIDDLEWARE (Edge)                      │    │
  │                                                                    │    │
  │  • Session refresh via @supabase/ssr cookie management            │    │
  │  • Route protection:                                              │    │
  │    - /dashboard/* → requires valid session + active subscription  │    │
  │    - /login, /signup → redirect if already authenticated          │    │
  │    - /dashboard/admin/* → requires role === 'admin'               │    │
  └──────────────────────────────┬───────────────────────────────────┘    │
                                  │                                         │
             ┌────────────────────┼────────────────────┐                   │
             ▼                    ▼                    ▼                   │
  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
  │   NEXT.JS API    │  │   NEXT.JS API    │  │    NEXT.JS API       │   │
  │    AUTH ROUTES   │  │  BUSINESS ROUTES │  │    ADMIN ROUTES      │   │
  │                  │  │                  │  │                      │   │
  │ /auth/callback   │  │ /api/scores      │  │ /api/admin/users     │   │
  │ /api/auth/welcome│  │ /api/charities   │  │ /api/admin/draws     │   │
  │                  │  │ /api/checkout    │  │ /api/admin/draws/    │   │
  │                  │  │ /api/portal      │  │   simulate           │   │
  │                  │  │ /api/winners/*   │  │ /api/admin/draws/    │   │
  │                  │  │ /api/webhooks/   │  │   publish            │   │
  │                  │  │   stripe         │  │ /api/cron/check-     │   │
  │                  │  │                  │  │   lapsed             │   │
  └────────┬─────────┘  └────────┬─────────┘  └──────────┬───────────┘   │
           │                     │                        │                │
           └─────────────────────┴────────────────────────┘               │
                                  │                                        │
              ┌───────────────────┼───────────────────┐                   │
              ▼                   ▼                   ▼                   │
  ┌────────────────────┐ ┌────────────────┐ ┌──────────────────────────┐ │
  │  SUPABASE / NEON   │ │    STRIPE      │ │      EXTERNAL SERVICES   │ │
  │   PostgreSQL DB    │ │                │ │                          │ │
  │                    │ │ ▪ Subscriptions│ │  ▪ Brevo Email API       │ │
  │  Tables:           │ │ ▪ Webhooks     │ │    (Transactional email) │ │
  │  ▪ profiles        │ │ ▪ Checkout     │ │                          │ │
  │  ▪ subscriptions   │ │ ▪ Customer     │ │  ▪ Cloudinary            │ │
  │  ▪ scores          │ │   Portal       │ │    (Winner proof image   │ │
  │  ▪ charities       │ │ ▪ One-off      │ │     upload & CDN)        │ │
  │  ▪ draws           │ │   Donations    │ │                          │ │
  │  ▪ draw_entries    │ │                │ │  ▪ Node.js crypto        │ │
  │  ▪ draw_simulation │ │                │ │    (CSPRNG draw engine)  │ │
  │  ▪ winners         │ │                │ │                          │ │
  │  ▪ notifications   │ │                │ │                          │ │
  │    _log            │ │                │ │                          │ │
  └────────────────────┘ └────────────────┘ └──────────────────────────┘ │
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14.2 (App Router) | Full-stack React with SSR, API routes, middleware |
| **Language** | JavaScript (JSX) | Frontend + Backend, no TypeScript overhead |
| **Styling** | TailwindCSS 3.4 | Utility-first dark-mode design system |
| **Database** | Supabase (PostgreSQL) | Primary data store + Row-Level Security |
| **Auth** | Supabase Auth | JWT sessions, OAuth, Magic Links, Email/Password |
| **Payments** | Stripe | Subscriptions, webhooks, customer portal, one-off donations |
| **Email** | Brevo REST API | Transactional email with delivery tracking |
| **Media** | Cloudinary | Winner proof image upload, CDN delivery |
| **Draw Engine** | Node.js `crypto` module | CSPRNG-based lottery with zero modulo bias |
| **Charts** | Recharts | Admin analytics (area charts, bar charts) |
| **3D/WebGL** | Three.js + @react-three/fiber | Landing page Silk shader background |
| **Animations** | GSAP + CSS | ScrollReveal, micro-animations, skeleton loaders |
| **Icons** | Lucide React | Consistent iconography throughout |
| **ORM** | Prisma (schema mgmt) | Schema definition, migrations |
| **Deployment** | Vercel | Serverless edge functions, automatic CI/CD |

---

## 📁 Project Structure

```
causeloop/
│
├── 📂 app/                            # Next.js App Router
│   ├── 📂 (app)/                      # Authenticated route group
│   │   ├── 📂 dashboard/
│   │   │   └── page.jsx               # ⭐ Main 3635-line dashboard SPA
│   │   └── 📂 subscribe/
│   │       └── page.jsx               # Stripe subscription page
│   │
│   ├── 📂 (auth)/                     # Auth route group
│   │   ├── 📂 login/page.jsx          # Email + OAuth login
│   │   ├── 📂 signup/page.jsx         # Multi-step signup
│   │   └── 📂 reset-password/
│   │       ├── page.jsx               # Request reset link
│   │       └── 📂 update/page.jsx     # New password form
│   │
│   ├── 📂 (public)/                   # Public route group
│   │   ├── page.jsx                   # Landing page (1280 lines)
│   │   └── 📂 charities/
│   │       ├── page.jsx               # Charity directory
│   │       └── 📂 [id]/page.jsx       # Charity detail page
│   │
│   ├── 📂 api/                        # API Route Handlers
│   │   ├── 📂 admin/
│   │   │   ├── 📂 users/route.js      # Admin user CRUD
│   │   │   └── 📂 draws/
│   │   │       ├── route.js           # Draw CRUD
│   │   │       ├── 📂 simulate/route.js   # Run draw simulation
│   │   │       └── 📂 publish/route.js    # Publish + notify all users
│   │   │
│   │   ├── 📂 auth/
│   │   │   └── 📂 welcome/route.js    # Idempotent welcome email
│   │   │
│   │   ├── 📂 charities/route.js      # Charity listing/detail
│   │   ├── 📂 scores/route.js         # Score CRUD (GET/POST/PATCH/DELETE)
│   │   │
│   │   ├── 📂 checkout/
│   │   │   ├── route.js               # Stripe subscription checkout
│   │   │   ├── 📂 confirm/route.js    # Post-payment confirmation
│   │   │   └── 📂 donate/route.js     # One-off charity donation
│   │   │
│   │   ├── 📂 portal/route.js         # Stripe Customer Portal redirect
│   │   │
│   │   ├── 📂 winners/
│   │   │   ├── 📂 proof-upload/route.js   # Cloudinary image upload
│   │   │   ├── 📂 verify/route.js         # Admin verify / pay winner
│   │   │   └── 📂 payment/route.js        # Payment tracking
│   │   │
│   │   ├── 📂 cron/
│   │   │   └── 📂 check-lapsed/route.js   # Sweep expired subscriptions
│   │   │
│   │   └── 📂 webhooks/
│   │       └── 📂 stripe/route.js     # Stripe webhook handler
│   │
│   ├── 📂 auth/
│   │   └── 📂 callback/route.js       # OAuth/email callback + welcome email
│   │
│   ├── globals.css                    # Global styles + custom animations
│   ├── icon.svg                       # CauseLoop brand favicon
│   └── layout.jsx                     # Root HTML layout
│
├── 📂 components/
│   ├── 📂 ui/
│   │   ├── silk.jsx                   # WebGL Silk shader (Three.js)
│   │   └── scroll-reveal.jsx          # GSAP ScrollReveal text animation
│   ├── 📂 dashboard/                  # Dashboard-specific sub-components
│   └── 📂 landing/                    # Landing page components
│
├── 📂 lib/
│   ├── brevo.js                       # ⭐ Brevo email helper + 6 HTML templates
│   ├── draw-engine.js                 # ⭐ CSPRNG draw algorithm + prize logic
│   ├── stripe.js                      # Stripe singleton client
│   ├── supabase.js                    # Supabase helper
│   ├── utils.js                       # Utility helpers
│   └── 📂 supabase/
│       ├── client.js                  # Browser Supabase client
│       └── server.js                  # Server + Admin Supabase clients
│
├── 📂 public/                         # Static assets
│   ├── landing.png                    # Hero/landing screenshot
│   ├── dashbord.png                   # Dashboard screenshot
│   ├── score.png                      # Scorecard screenshot
│   ├── drawandwin.png                 # Draws & winnings screenshot
│   ├── charity.png                    # Charity directory screenshot
│   ├── reports.png                    # Admin reports screenshot
│   └── login.png                      # Login page screenshot
│
├── 📂 supabase/                       # Database migration files
├── 📂 prisma/                         # Prisma schema
├── 📂 types/                          # Shared type definitions
├── middleware.js                      # Next.js edge middleware (auth guard)
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## ✨ Core Features

### 1. ⛳ Golf Score Tracking (Stableford)

```
User submits score
       │
       ▼
Validate: 1 ≤ score ≤ 45 (Stableford range)
       │
       ▼
Check: Is there already a score for this date? (duplicate guard)
       │            │
      YES           NO
       │             │
  Return error    Insert into scores table
  with existing   (user_id, score_value, score_date)
  score ID             │
                       ▼
                Enforce rolling 5-score window:
                If user already has 5 scores,
                delete the oldest score first
                       │
                       ▼
                Score is now a draw ticket number!
```

**Key rules:**
- **Rolling window**: Maximum 5 scores stored simultaneously
- **Date uniqueness**: One score per calendar date per user
- **Range**: Stableford format, 1–45 points
- **Performance tiers**: Excellent (36+), Great (28+), Good (18+), Below Avg

---

### 2. 🏆 Draw System (3-Tier Prize Pool)

```
Admin Panel
     │
     ├─── 1. Create Draft Draw (month + year + logic type)
     │
     ├─── 2. Choose Draw Strategy:
     │         ┌──────────────────┬─────────────────────────┐
     │         │   RANDOM mode    │    ALGORITHMIC mode      │
     │         │                  │                          │
     │         │ Node.js crypto   │ Laplace-smoothed         │
     │         │ CSPRNG with zero │ frequency-weighted       │
     │         │ modulo bias      │ selection from active    │
     │         │                  │ subscriber score history │
     │         └──────────────────┴─────────────────────────┘
     │
     ├─── 3. Run Simulation → Preview winners (no commitment)
     │
     └─── 4. Publish Draw → Lock results + notify ALL subscribers
                   │
                   ▼
         ┌─────────────────────────────────────────┐
         │           PRIZE POOL DISTRIBUTION        │
         │                                          │
         │  40% of all active subscription revenue  │
         │  ──────────────────────────────────────  │
         │  5 matches → 40% of pool (JACKPOT)       │
         │              ↑ Rolls over if no winner!  │
         │  4 matches → 35% of pool (shared)        │
         │  3 matches → 25% of pool (shared)        │
         └─────────────────────────────────────────┘
```

---

### 3. 💳 Subscription & Billing

```
User clicks "Subscribe"
        │
        ▼
Stripe Checkout Session created
(plan: monthly £12/mo OR yearly £120/yr)
        │
        ▼
User completes Stripe payment UI
        │
        ▼
Stripe fires webhook: customer.subscription.created
        │
        ▼
Webhook handler writes subscription to Supabase:
{user_id, stripe_customer_id, stripe_subscription_id,
 status: 'active', plan_type, current_period_end}
        │
        ▼
Dashboard polls for subscription → shows success overlay
        │
        ▼
Welcome + subscription_activated emails fired via Brevo
```

---

### 4. 🏅 Winner Claim & Proof Verification

```
Draw Published
      │
      ▼
Winners auto-detected (match_count >= 3)
winner records created in DB with status: 'pending'
      │
      ▼
Winner receives email alert via Brevo
      │
      ▼
Winner logs into dashboard → "Draws & Winnings" tab
      │ Shows status: "Awaiting Upload"
      ▼
Winner uploads screenshot (JPEG/PNG/GIF/WEBP, max 5MB)
      │
      ▼
Cloudinary signed upload API
      │
      ▼
proof_url stored on winner record
status: 'pending' → still awaiting admin verification
      │ Shows status: "Awaiting Verification"
      ▼
Admin verifies proof in Admin Panel
      │ Can: Verify ✓ or Reject ✗ (with reason)
      ▼
On verify: Admin marks as paid → payment_status: 'paid'
On reject: winner notified, proof_url cleared
```

---

### 5. ❤️ Charity Partner System

```
User Profile Setup
      │
      ▼
Browse Charity Directory (/charities)
Search + filter by category
      │
      ▼
Select charity partner (saved to profile.charity_id)
      │
      ▼
Configure contribution percentage (min 10%, adjustable slider)
      │
      ▼
Monthly: (subscription_amount × contribution%) → charity
         (subscription_amount × 40%) → prize pool
         (remaining) → platform operations
```

---

## 🗄️ Database Schema

```sql
-- ══════════════════════════════════════════════════════════════
-- CAUSELOOP DATABASE SCHEMA (Supabase / PostgreSQL)
-- ══════════════════════════════════════════════════════════════

-- 1. User profiles (linked to Supabase auth.users)
CREATE TABLE profiles (
  id                           UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name                    TEXT,
  role                         TEXT DEFAULT 'subscriber',      -- 'subscriber' | 'admin'
  charity_id                   UUID REFERENCES charities(id),
  charity_contribution_percentage NUMERIC DEFAULT 10,          -- 10–100%
  created_at                   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Active subscriptions (synced from Stripe via webhook)
CREATE TABLE subscriptions (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      UUID REFERENCES profiles(id),
  stripe_customer_id           TEXT,
  stripe_subscription_id       TEXT UNIQUE,
  status                       TEXT,                           -- 'active' | 'lapsed' | 'cancelled'
  plan_type                    TEXT,                           -- 'monthly' | 'yearly'
  current_period_end           TIMESTAMPTZ,
  created_at                   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Golf scores (Stableford, rolling 5-score window)
CREATE TABLE scores (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      UUID REFERENCES profiles(id),
  score_value                  INTEGER CHECK (score_value BETWEEN 1 AND 45),
  score_date                   DATE NOT NULL,
  created_at                   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, score_date)                                  -- one score per day
);

-- 4. Charity partners
CREATE TABLE charities (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                         TEXT NOT NULL,
  description                  TEXT,
  image_urls                   TEXT[],
  is_featured                  BOOLEAN DEFAULT FALSE,
  upcoming_events              JSONB[],                        -- [{name, date, location}]
  created_at                   TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Monthly prize draws
CREATE TABLE draws (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month                        INTEGER CHECK (month BETWEEN 1 AND 12),
  year                         INTEGER,
  draw_type                    TEXT DEFAULT 'five_match',
  status                       TEXT DEFAULT 'draft',           -- 'draft' | 'simulated' | 'published'
  logic_type                   TEXT DEFAULT 'random',          -- 'random' | 'algorithmic'
  winning_numbers              INTEGER[],
  prize_pool_amount            NUMERIC,
  rollover_amount              NUMERIC DEFAULT 0,
  latest_simulation            JSONB,
  created_at                   TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User entries per draw
CREATE TABLE draw_entries (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id                      UUID REFERENCES draws(id),
  user_id                      UUID REFERENCES profiles(id),
  numbers_played               INTEGER[],                      -- user's score values
  match_count                  INTEGER DEFAULT 0,
  created_at                   TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Winner claims
CREATE TABLE winners (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id                      UUID REFERENCES draws(id),
  user_id                      UUID REFERENCES profiles(id),
  match_count                  INTEGER,                        -- 3 | 4 | 5
  prize_amount                 NUMERIC,
  proof_url                    TEXT,                           -- Cloudinary CDN URL
  verification_status          TEXT DEFAULT 'pending',         -- 'pending' | 'verified' | 'rejected'
  payment_status               TEXT DEFAULT 'unpaid',          -- 'unpaid' | 'paid'
  rejection_reason             TEXT,
  created_at                   TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Email delivery log (audit trail)
CREATE TABLE notifications_log (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      UUID REFERENCES profiles(id),
  type                         TEXT,                           -- 'welcome' | 'subscription_activated' | ...
  status                       TEXT DEFAULT 'pending',         -- 'pending' | 'sent' | 'failed'
  metadata                     JSONB,                          -- {toEmail, messageId, error...}
  created_at                   TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 API Routes Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/auth/callback` | OAuth + magic link exchange → session | No |
| POST | `/api/auth/welcome` | Idempotent welcome email trigger | Yes (session) |

### Scores

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/scores` | Fetch current user's scores | Yes |
| POST | `/api/scores` | Add new score (with rollover logic) | Yes |
| PATCH | `/api/scores` | Edit existing score | Yes |
| DELETE | `/api/scores?id=` | Delete a score | Yes |

### Charities

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/charities` | List all charities | No |
| GET | `/api/charities?featured=true` | Get featured charity | No |
| GET | `/api/charities?id=<uuid>` | Get charity by ID | No |

### Checkout & Billing

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/checkout?plan=monthly` | Create Stripe subscription checkout | Yes |
| GET | `/api/checkout?plan=yearly` | Create yearly subscription checkout | Yes |
| GET | `/api/checkout/confirm?session_id=` | Verify payment session | Yes |
| POST | `/api/checkout/donate` | One-off charity donation via Stripe | No |
| GET | `/api/portal` | Redirect to Stripe Customer Portal | Yes |

### Winners & Proof

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/winners/proof-upload` | Upload proof image to Cloudinary | Yes |
| POST | `/api/winners/verify` | Admin: verify or reject winner | Admin |
| POST | `/api/winners/payment` | Admin: mark payment as paid | Admin |

### Admin

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/admin/users` | Fetch all users, charities, draws, winners | Admin |
| PATCH | `/api/admin/users` | Update user role or subscription | Admin |
| GET | `/api/admin/draws` | Get draws by month/year | Admin |
| POST | `/api/admin/draws` | Create draft draw | Admin |
| PATCH | `/api/admin/draws` | Update draw strategy | Admin |
| POST | `/api/admin/draws/simulate` | Run simulation | Admin |
| POST | `/api/admin/draws/publish` | Publish draw + notify all | Admin |

### System

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/webhooks/stripe` | Handle Stripe webhook events | Webhook secret |
| GET | `/api/cron/check-lapsed` | Sweep + update lapsed subscriptions | Cron/internal |

---

## 🎰 Draw Engine Algorithm

Located in [`lib/draw-engine.js`](lib/draw-engine.js)

### Strategy 1: Cryptographically Secure Random (CSPRNG)

```javascript
// Uses Node.js crypto.randomBytes — NOT Math.random()
// Rejection sampling eliminates modulo bias

function getCryptoRandomInt(min, max) {
  const range = max - min + 1;
  const bytes = crypto.randomBytes(1);
  const val = bytes[0];
  const maxUsable = 256 - (256 % range);  // eliminate bias
  if (val >= maxUsable) return getCryptoRandomInt(min, max);  // recurse
  return min + (val % range);
}
```

### Strategy 2: Frequency-Weighted Algorithmic

```
Input: All active subscribers' historical scores

1. Count frequency of each number (1–45) across all scores
2. Apply Laplace smoothing: weight(i) = frequency(i) + 1
   → Prevents zero-probability numbers
   → Biases toward numbers players actually submit
3. Weighted random sampling without replacement
   (numbers more commonly scored are more likely to be drawn)

Example:
  Scores submitted: [18, 22, 22, 28, 36, 22]
  Frequencies:      {22: 3, 18: 1, 28: 1, 36: 1, ...rest: 0}
  Weights:          {22: 4, 18: 2, 28: 2, 36: 2, ...rest: 1}
  → 22 is 4× more likely than an unplayed number
```

### Prize Pool Calculation

```
Monthly Prize Pool = Active Subscriber Revenue × 40%

  ┌─────────────────────────────────────────────────────────┐
  │                    PRIZE DISTRIBUTION                    │
  │                                                          │
  │  5 Matches (JACKPOT) ──── 40% of prize pool             │
  │                            + Any rollover from last month│
  │                            ↑ Rolls over if no winner!   │
  │                                                          │
  │  4 Matches ─────────────  35% of prize pool             │
  │                            Split equally if multiple     │
  │                                                          │
  │  3 Matches ─────────────  25% of prize pool             │
  │                            Split equally if multiple     │
  └─────────────────────────────────────────────────────────┘

Example (£500 prize pool from 100 subscribers × £5 effective):
  5-match pool: £200 (+ any rollover from prior month)
  4-match pool: £175 (split among all 4-match winners)
  3-match pool: £125 (split among all 3-match winners)
```

---

## 📧 Email Notification System

Powered by **Brevo REST API** via [`lib/brevo.js`](lib/brevo.js)

### Email Types

| Type | Trigger | Description |
|---|---|---|
| `welcome` | New user signup via OAuth/email | Welcome with dashboard CTA, idempotent (sent once) |
| `subscription_activated` | Stripe webhook: subscription becomes active | Confirms enrollment in draws + charity funding |
| `payment_failed_warning` | Stripe webhook: `invoice.payment_failed` | Warn before auto-cancellation, ask to update card |
| `subscription_cancelled_lapsed` | Stripe cancelled OR cron lapsed sweep | Notifies of account lapse + reactivation CTA |
| `draw_results` | Admin publishes draw | Sends winning numbers to ALL subscribers |
| `winner_alert` | Draw published + user matched ≥3 numbers | Congratulations + proof upload instructions |

### Delivery Pipeline

```
Business Event Triggered
        │
        ▼
sendTransactionalEmail(userId, {type, toEmail, ...})
        │
        ▼
INSERT notifications_log → status: 'pending'
        │
        ▼
POST https://api.brevo.com/v3/smtp/email
  headers: { 'api-key': BREVO_API_KEY }
  body: { sender, to, subject, htmlContent }
        │
      ┌─┴──────────────────────────┐
      │ HTTP 201                   │ HTTP 4xx/5xx
      ▼                            ▼
UPDATE log → status: 'sent'   UPDATE log → status: 'failed'
             messageId: ...                error: '...'
```

### Design Principles

- **Non-blocking**: Email failures never disrupt the main user flow
- **Idempotent**: Welcome emails have a DB check — never sent twice
- **Auditable**: Every attempt logged to `notifications_log` with full metadata
- **Paginated draw announcements**: Admin draw publish uses paginated `listUsers()` + background async execution to avoid Vercel function timeouts

---

## 🔐 Authentication & Authorization

### Auth Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOWS                              │
└─────────────────────────────────────────────────────────────────────┘

  EMAIL / PASSWORD                 GOOGLE OAUTH              MAGIC LINK
       │                                │                        │
       ▼                                ▼                        ▼
  POST to Supabase              supabase.auth.signInWith    Email sent →
  signInWithPassword            OAuth('google')             User clicks →
       │                                │                        │
       └────────────────────────────────┴────────────────────────┘
                                        │
                                        ▼
                                 /auth/callback
                         (Next.js server route handler)
                                        │
                                 Exchange code → session
                                        │
                                 Create/update profile row
                                        │
                                 Fire welcome email (async)
                                        │
                                 Redirect to /dashboard
```

### Authorization Levels

```
VISITOR (no auth)
  └── Can: View landing, charities, pricing, login, signup

SUBSCRIBER (authenticated + active subscription)
  └── Can: Dashboard (all tabs), Scores CRUD, Pick charity,
           Upload winner proof, View draws + winnings

ADMIN (role === 'admin')
  └── Can: Everything above PLUS:
           User management, Draw simulation/publish,
           Charity CRUD, Winner verification/payment,
           Admin reports panel
```

### Middleware Guard (Edge Runtime)

```javascript
// Every request passes through middleware.js

/dashboard/* → Check:
  1. Valid Supabase session?  → No → redirect /login?redirect=...
  2. Active subscription?    → No → redirect /subscribe
  3. Admin route?            → role !== 'admin' → redirect /dashboard

/login, /signup → Already logged in? → redirect /dashboard
```

---

## 💰 Stripe Payment Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    STRIPE INTEGRATION FLOW                        │
└──────────────────────────────────────────────────────────────────┘

SUBSCRIPTION CHECKOUT
─────────────────────
User → /api/checkout?plan=monthly
          │
          ▼
Stripe creates Checkout Session
{mode: 'subscription', priceId: MONTHLY_PRICE_ID}
          │
          ▼
User redirected to Stripe hosted page
          │
          ▼
Payment success → redirect to /dashboard?checkout=success
          │
          ▼
Dashboard polls DB for active subscription (up to 10 times)
Also hits /api/checkout/confirm?session_id= for instant check
          │
          ▼
Shows success overlay → fetches fresh data

WEBHOOK EVENTS HANDLED
──────────────────────
customer.subscription.created    → Insert subscription row
customer.subscription.updated    → Update status/period_end
                                    If activated → send activation email
                                    If cancelled → send cancellation email
customer.subscription.deleted    → Update status → 'lapsed'
                                    Send cancellation email
invoice.payment_failed           → Send payment warning email
invoice.payment_succeeded        → Update subscription active

ONE-OFF CHARITY DONATION
────────────────────────
User clicks "One-off Donate" on charity card
          │
          ▼
/api/checkout/donate → Stripe Payment Intent
{amount, metadata: {charityId, charityName}}
          │
          ▼
Stripe Checkout → success redirect to /charities?donation=success
```

---

## 🛡️ Admin Panel

The admin panel is embedded within the main dashboard (tab-based navigation). Only users with `role === 'admin'` in the `profiles` table can see the admin tabs.

### Admin Tabs

```
Admin Dashboard
├── 👥 Users
│   ├── Full user list with profile + subscription status
│   ├── Score correction per user
│   ├── Role management (subscriber ↔ admin toggle)
│   └── Subscription status toggle
│
├── 🏆 Draws
│   ├── Month/year selector
│   ├── Draw strategy selector (Random / Algorithmic)
│   ├── Draft Draw creation
│   ├── Run Simulation (preview-only, non-destructive)
│   ├── Simulation results preview (winners, prize amounts)
│   └── PUBLISH button (one-way, with confirm dialog)
│
├── ❤️ Charities
│   ├── Charity CRUD (name, description, images, events)
│   ├── Featured charity toggle
│   └── Upcoming events JSON editor
│
├── 🏅 Winners
│   ├── All winner claims with filter by status
│   ├── Admin proof image modal viewer
│   ├── Verify ✓ button → updates DB + marks verified
│   ├── Reject ✗ button → modal for rejection reason
│   └── Mark as Paid $ button
│
└── 📈 Reports
    ├── Cumulative user growth area chart (Recharts)
    ├── Charity supporter distribution bar chart (Recharts)
    ├── Total users, active subscribers, total draws stats
    └── Recent winner claims summary
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root. See [`.env.example`](.env.example) for reference.

```bash
# ─── Database ──────────────────────────────────────────────────────────────
# Neon PostgreSQL (for Prisma schema management)
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

# ─── Supabase ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"   # ⚠️ SERVER ONLY

# ─── Stripe ────────────────────────────────────────────────────────────────
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."                      # ⚠️ SERVER ONLY
STRIPE_WEBHOOK_SECRET="whsec_..."                    # ⚠️ SERVER ONLY

# ─── Brevo Transactional Email ─────────────────────────────────────────────
BREVO_API_KEY="your-dedicated-brevo-api-key"        # ⚠️ SERVER ONLY
BREVO_SENDER_EMAIL="noreply@yourdomain.com"

# ─── Cloudinary (Winner Proof Uploads) ────────────────────────────────────
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"             # ⚠️ SERVER ONLY
CLOUDINARY_UPLOAD_PRESET="your-upload-preset"

# ─── App Config ────────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL="https://cause-loop.vercel.app"
JWT_SECRET="replace-with-a-long-random-secret"
```

> **Security Note**: Variables prefixed `NEXT_PUBLIC_` are exposed to the browser. All secret keys (Stripe, Supabase service role, Brevo API key, Cloudinary secret) must **never** have the `NEXT_PUBLIC_` prefix.

---

## 💻 Local Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A Supabase project (free tier is sufficient for development)
- A Stripe account (test mode)
- A Brevo account (free tier for email testing)
- A Cloudinary account (free tier)

### Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/your-org/causeloop.git
cd causeloop

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local
# Edit .env.local with your actual credentials

# 4. Run Supabase migrations
# Navigate to your Supabase dashboard → SQL Editor
# Run the contents of supabase/consolidated_migrations.sql

# 5. Start the development server
npm run dev
# App runs at http://localhost:3000

# 6. (Optional) Run lint check
npm run lint

# 7. (Optional) Run production build locally
npm run build
npm run start
```

### Local Stripe Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI will output a webhook signing secret starting with 'whsec_'
# Add it to .env.local as STRIPE_WEBHOOK_SECRET
```

---

## 🚀 Deployment Guide

CauseLoop is deployed to **Vercel** with zero-config Next.js optimization.

### Vercel Setup

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Link your project
vercel link

# 3. Add all environment variables in Vercel dashboard:
#    Settings → Environment Variables → Add each from .env.example

# 4. Deploy
vercel --prod
```

### Stripe Webhook for Production

```
1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: https://cause-loop.vercel.app/api/webhooks/stripe
3. Events to listen:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed
   - invoice.payment_succeeded
4. Copy the webhook signing secret → add to Vercel env as STRIPE_WEBHOOK_SECRET
```

### Brevo IP Allowlisting

> Brevo API keys can be restricted by IP. For Vercel deployments on shared infrastructure, configure your Brevo API key to allow the Vercel IP ranges, or use a dedicated API key without IP restrictions.

### Cron Job Setup (Lapsed Subscription Sweep)

The `/api/cron/check-lapsed` endpoint sweeps for subscriptions that have passed their `current_period_end` without being renewed. Set this up as a scheduled cron via Vercel Cron Jobs or an external scheduler:

```json
// vercel.json (if using Vercel Cron)
{
  "crons": [
    {
      "path": "/api/cron/check-lapsed",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## 🗺️ User Journeys

### Journey 1: New User Signup → First Draw Entry

```
1. User visits https://cause-loop.vercel.app/
2. Clicks "Get Started" → /signup
3. Fills in name, email, password, selects charity partner
4. Submits → account created in Supabase
5. Redirected via /auth/callback → welcome email sent via Brevo
6. Redirected to /subscribe (no active subscription yet)
7. Selects Monthly (£12) or Yearly plan
8. Completes Stripe Checkout → returns with ?checkout=success
9. Dashboard verifies subscription → shows success modal
10. User navigates to "My Scores" tab
11. Logs first Stableford score (e.g., 28 pts on June 15)
12. Score saved → becomes draw ticket number 28
13. Next monthly draw: if 28 appears in winning numbers → match!
```

### Journey 2: Admin Runs Monthly Draw

```
1. Admin logs in → sees "ADM" section in sidebar
2. Navigates to Admin → Draws
3. Selects month: June, year: 2026
4. Clicks "Create Draft Draw"
5. Selects strategy: Random OR Algorithmic
6. Clicks "Run Simulation" → previews results (non-destructive)
7. Reviews winner list and prize amounts
8. Clicks "PUBLISH Draw" → confirms dialog
9. System:
   a. Locks winning numbers in DB
   b. Creates winner records for all matches ≥ 3
   c. Sends draw_results email to ALL subscribers (paginated)
   d. Sends winner_alert email to matched users
10. Admin navigates to Admin → Winners
11. Reviews proof uploads as winners submit them
12. Clicks "Verify" on verified claims
13. Clicks "Mark as Paid" to complete payout
```

### Journey 3: Winner Claims Prize

```
1. Winner receives email "You've Won!" with match count + prize
2. Logs into dashboard → Draws & Winnings tab
3. Sees winner card: status "Awaiting Upload"
4. Clicks upload area → selects screenshot from golf app
5. Spinner shown during Cloudinary upload
6. On success: status changes to "Awaiting Verification"
7. Admin reviews proof → clicks Verify
8. Status changes to "Verified" → payment processed
9. Winner's profile shows prize amount in Winnings stat card
```

---

## 📊 Build Output

```
Route (app)                              Size     First Load JS
┌ ○ /                                    13 kB           173 kB
├ ○ /charities                           5.05 kB         166 kB
├ ƒ /charities/[id]                      4.83 kB         165 kB
├ ○ /dashboard                           133 kB          293 kB
├ ○ /login                               3.5 kB          164 kB
├ ○ /reset-password                      2.86 kB         163 kB
├ ○ /signup                              4.36 kB         165 kB
└ ○ /subscribe                           4.94 kB         165 kB

○  (Static)  prerendered as static content
ƒ  (Dynamic) server-rendered on demand

Total API Routes: 18 serverless functions
Middleware:       82.9 kB (edge runtime)
```

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Background | `#030308` / `#111111` | Page + sidebar bg |
| Card bg | `#161616` / `#0e0e12` | All cards and panels |
| Border | `#1e1e1e` / `#222` | Subtle card borders |
| Primary purple | `#5227FF` | CauseLoop brand primary |
| Secondary purple | `#8644FF` | Gradients, accents |
| Emerald green | `#3ecf8e` | Active status, CTAs |
| Zinc text | `#e4e4e7` | Primary text |
| Muted text | `#a1a1aa` | Secondary text |
| Font | System UI / Roboto | Dashboard, sans-serif |
| Border radius | `12px` / `16px` | Cards, `24px`+ modals |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

CauseLoop is proprietary software. All rights reserved.

---

<div align="center">

**Built with ❤️ to make golf matter more.**

[🌐 Live at cause-loop.vercel.app](https://cause-loop.vercel.app/)

</div>
