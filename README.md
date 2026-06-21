# CauseLoop ⛳️🎗️

CauseLoop is a modern, subscription-based golf score tracking platform designed for golfers who want to improve their game while giving back to society. The platform features an integrated monthly, charity-driven prize draw system where active subscribers are automatically entered to win premium golf gear, travel experiences, and custom packages. A dedicated percentage of subscription fees directly funds verified charity partners, creating a continuous loop of play, support, and reward.

## Technology Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Runtime & Language**: Node.js & JavaScript (ES6+ / JSX)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with [Neon PostgreSQL](https://neon.tech/) (Serverless Postgres)
- **Authentication**: [Supabase JS](https://supabase.com/docs/reference/javascript) & [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- **Payments**: [Stripe](https://stripe.com/) Subscription Billing
- **Transactional Emails**: [Brevo SMTP Relay](https://www.brevo.com/)

---

## Directory Structure

```text
CauseLoop/
├── app/                  # Next.js App Router root
│   ├── (app)/            # Authenticated routing shell (Dashboard)
│   ├── (auth)/           # Authentication flows (Login, Signup, Reset)
│   ├── (public)/         # Public landing pages
│   ├── globals.css       # Tailwind directives and CSS theme variables
│   └── layout.jsx        # Root HTML Shell
├── components/           # Component library
│   ├── dashboard/        # Dashboard specific sub-views
│   ├── landing/          # Public-facing presentation components
│   └── ui/               # Shared primitive components (Button, Card, Modal, Input, Tabs)
├── lib/                  # Initialized client SDK wrappers (Supabase, Stripe, Brevo)
├── prisma/               # Schema configuration for Neon PostgreSQL database
├── types/                # Core domain TypeScript interfaces for developer guidance
├── jsconfig.json         # Module resolution paths (@/* absolute imports)
├── middleware.js         # Navigation guard placeholder
├── .env.example          # Template environment config
└── README.md             # Project documentation
```

---

## Local Setup & Installation

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18.17+ recommended) along with `npm`.

### 2. Install Dependencies
Clone the repository and install the standard dependencies:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file at the root of the project using the structure from `.env.example`:
```bash
cp .env.example .env
```
Fill in the credentials for Neon PostgreSQL, Supabase, Stripe, and Brevo SMTP.

### 4. Database Setup (Prisma)
Generate the Prisma Client code and sync the schema to your Neon PostgreSQL database instance:
```bash
# Generate the Client code
npx prisma generate

# Sync the schema structures with the database
npx prisma db push
```

### 5. Launch the Development Server
Run the local dev compiler:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the Coming Soon page.

---

## Linting & Formatting
We use ESLint combined with Prettier for code style consistency.

- **Check Lints**: `npm run lint`
- **Format Codebase**: `npm run format`

---

## Phase 6: Draw and Reward Engine

The Draw and Reward Engine is a core administrative feature implemented in Phase 6 to manage and execute the monthly subscription-revenue-funded prize drawings.

### 1. Single Monthly Draw Model
Rather than running multiple independent draws, each monthly cycle features **exactly one draw** matching 5 winning numbers (represented as `draw_type = 'five_match'`).
- The prize pool is split across three tiers: **5-Match Jackpot (40%)**, **4-Match Tier (35%)**, and **3-Match Tier (25%)**.
- Users' latest 5 logged Stableford scores represent their played numbers.
- Payouts are computed by matching these 5 played numbers against the 5 winning numbers.
- If a tier has multiple winners, they split the tier's pool equally.
- **5-Match Tier Rollover:** If zero winners match all 5 numbers in a given month, that month's 40% share rolls over to the next month's 5-match jackpot pool. The 4-match and 3-match pools are paid out to winners (or cleared if none) but never roll over.

### 2. Algorithmic Weighted Strategy (Laplace Smoothing)
The admin can choose between a standard cryptographically secure random strategy (picking numbers uniformly at random without bias) and a weighted algorithmic strategy.
- **Direct Proportional Weighting:** To reward the most commonly submitted score values and increase winner counts, the probability of drawing a number is directly proportional to its occurrence in active subscribers' scores during that draw period.
- **Laplace Smoothing ($\alpha = 1$):** To ensure every number from 1 to 45 retains a non-zero probability of being selected (even if no active subscriber logged it), we add 1 to the baseline frequency of all numbers:
  $$W_i = F_i + 1$$
  where $F_i$ is the frequency of number $i$ in scores submitted by active subscribers for that period.
- **Sampling Without Replacement:** Winning numbers are drawn sequentially. At each step, a candidate is selected using the normalized probabilities of remaining candidates, and is then removed from the pool so that no duplicates can be drawn.
- Cryptographically secure bytes are retrieved from Node's `crypto` module to generate high-resolution fractions for weighted sampling.

### 3. State Machine Workflow
- **`draft`**: The draw is initialized with the selected month, year, and strategy.
- **`simulated`**: The admin runs sandboxed simulation runs. Winning numbers, pool splits, and projected payouts are calculated and saved in a separate `draw_simulations` table, leaving live tables untouched.
- **`published`**: A one-way, irreversible action that locks in winning numbers. It executes calculations against real-time active subscriptions, writes records to `draw_entries` for all eligible participants (retaining complete participation histories), populates the `winners` table for claims verification, and logs pending winner notification emails.

