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
