"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Download,
  ArrowRight,
  Check,
  Trophy,
  Heart,
  BarChart2,
  Target,
  Calendar,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  HeartPulse,
  Waves,
  Brain,
  Users,
  GraduationCap,
  Ticket,
  Zap,
  Activity,
  Coins,
  UserPlus,
  LogOut
} from "lucide-react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";

const Silk = dynamic(() => import("@/components/ui/silk"), { ssr: false });
const ScrollReveal = dynamic(() => import("@/components/ui/scroll-reveal"), { ssr: false });

// ─── Premium Logo with Purple-Indigo Gradient ────────────────────────────────
function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5227FF" />
          <stop offset="100%" stopColor="#8644FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#logo-grad)"
        fillRule="evenodd"
        d="M12 30.99V36L-.01 23.99l2.516-2.499zM17.01 36H12l12.011 12.01 2.506-2.505zm28.487-9.497L48 24 24 0l-2.503 2.503L30.98 12h-5.732l-6.62-6.614-2.506 2.503 4.122 4.122h-2.869v18.625H36V27.77l4.122 4.122 2.503-2.506L36 22.747v-5.732zM13.253 10.747l-2.503 2.506 2.686 2.686 2.503-2.506zm21.314 21.314-2.495 2.503 2.686 2.686 2.506-2.503zM7.878 16.121l-2.503 2.504L12 25.253v-5.012zM27.756 36h-5.009l6.628 6.625 2.503-2.503z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ─── Navbar — Apple Floating Island style ───────────────────────────────────
const NAV_ITEMS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Scores", href: "#scores" },
  { label: "Draws", href: "#draws" },
  { label: "Charities", href: "#charities" },
  { label: "Pricing", href: "#pricing" },
];

function Navbar({ user: propUser, loading: propLoading }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);

  const user = propUser !== undefined ? propUser : localUser;
  const loading = propLoading !== undefined ? propLoading : localLoading;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });

    if (propUser === undefined) {
      // Fetch initial user session
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        setLocalUser(session?.user ?? null);
        setLocalLoading(false);
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setLocalUser(session?.user ?? null);
        setLocalLoading(false);
      });

      return () => {
        window.removeEventListener("scroll", fn);
        subscription.unsubscribe();
      };
    }

    return () => {
      window.removeEventListener("scroll", fn);
    };
  }, [propUser]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-500 py-3">
      <nav
        id="navbar"
        className={`max-w-[1120px] mx-auto px-5 rounded-2xl h-[56px] flex items-center gap-6 transition-all duration-500 ${
          scrolled
            ? "bg-black/50 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] mx-4 md:mx-auto"
            : "bg-transparent border border-transparent mx-4 md:mx-auto"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-4">
          <Logo size={24} />
          <span className="text-white text-[16px] font-bold tracking-[-0.02em]">
            CauseLoop
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[13.5px] font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.03] transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-4 ml-auto shrink-0">
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-white text-black px-4 py-2 rounded-xl hover:bg-zinc-200 hover:scale-[1.02] transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
              >
                Go to Dashboard
              </Link>
              <div className="relative group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-zinc-800 flex items-center justify-center font-bold text-white text-[12px] shadow-sm select-none cursor-pointer">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="absolute right-0 mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-zinc-900">
                    <p className="text-[11px] text-zinc-500 truncate">Signed in as</p>
                    <p className="text-[12px] font-semibold text-white truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link href="/dashboard" className="block px-4 py-2 text-[12px] text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-[12px] text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors border-t border-zinc-900 mt-1"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13.5px] font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold bg-white text-black px-4 py-2 rounded-xl hover:bg-zinc-200 hover:scale-[1.02] transition-all shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
              >
                <Download size={13} strokeWidth={2.5} />
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden ml-auto text-zinc-300 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile drop menu */}
      {open && (
        <div className="md:hidden mx-4 mt-2 p-5 bg-zinc-950/90 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl space-y-2 animate-fadeInUp">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block text-[14.5px] font-medium text-zinc-300 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-all"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-4 border-t border-white/[0.06] mt-3">
            {!loading && user ? (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex items-center gap-3 px-3 py-1.5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-[12px] shadow-sm select-none">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-white truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center text-[13px] font-semibold bg-white text-black rounded-xl py-2.5 hover:bg-zinc-200 transition-all"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleSignOut();
                    }}
                    className="flex-1 text-center text-[13px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl py-2.5 hover:bg-red-500/20 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-[13px] font-medium text-zinc-300 border border-white/[0.1] rounded-xl py-2.5 hover:bg-white/[0.02] transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-[13px] font-semibold bg-white text-black rounded-xl py-2.5 hover:bg-zinc-200 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero — centered layout with Silk indigo-purple background ──────────────
function Hero({ user, loading }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#020205]">
      {/* Silk background configuration */}
      <Silk
        speed={5}
        scale={1}
        color="#5227FF"
        noiseIntensity={1.5}
        rotation={0}
        className="opacity-60 pointer-events-none"
      />

      {/* Radial vignette and ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 10%, rgba(2, 2, 5, 0.4) 50%, rgba(2, 2, 5, 0.95) 100%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020205]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020205] to-transparent pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 text-center px-5 max-w-[800px] mx-auto animate-fadeInUp flex flex-col items-center">
        {/* Title */}
        <h1 className="text-[clamp(44px,7.5vw,78px)] font-extrabold text-white leading-[1.06] tracking-[-0.03em]">
          Take the <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-indigo-400 to-purple-400">short way</span>.
        </h1>
        {/* Description as requested */}
        <p className="mt-6 text-[clamp(16px,1.8vw,20px)] text-zinc-300 max-w-[540px] leading-relaxed font-medium">
          Subscribe to CauseLoop and start tracking, winning.
        </p>

        {/* Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
          {!loading && user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black text-[14.5px] font-bold px-8 py-3.5 rounded-xl hover:bg-zinc-200 hover:scale-[1.02] transition-all shadow-[0_8px_30px_rgba(255,255,255,0.25)]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black text-[14px] font-bold px-6 py-3.5 rounded-xl hover:bg-zinc-200 hover:scale-[1.02] transition-all shadow-[0_8px_30px_rgba(82,39,255,0.25)]"
              >
                <Download size={14} strokeWidth={2.5} />
                Start Free Trial
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white text-[14px] font-bold px-6 py-3.5 rounded-xl hover:bg-white/[0.08] hover:scale-[1.02] transition-all backdrop-blur-md"
              >
                <Heart size={14} strokeWidth={2.5} className="text-indigo-400" />
                Choose Your Charity
              </Link>
            </>
          )}
        </div>

        {/* Sub Info & Announcement */}
        <div className="mt-8 flex items-center gap-3 text-[12.5px] text-zinc-500 font-medium divide-x divide-zinc-800">
          <span className="pr-3">v1.0</span>
          <span className="px-3">No credit card</span>
          <span className="pl-3">Cancel any time</span>
        </div>

        <div className="mt-10">
          <Link
            href="#"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.03] backdrop-blur-md text-[13px] text-zinc-300 hover:text-white transition-colors group"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
            <span>CauseLoop is live — monthly jackpot starts now</span>
            <span className="text-zinc-500 flex items-center gap-0.5 group-hover:text-indigo-400 transition-colors ml-1">
              Learn more
              <ArrowRight size={12} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Bento Grid ("It's not about saving time.") ─────────────────────
function TimeSection() {
  const items = [
    {
      icon: BarChart2,
      label: "Score every round",
      sub: "Automatic WHS handicap",
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-400",
    },
    {
      icon: Trophy,
      label: "Win monthly prizes",
      sub: "Jackpots roll over",
      color: "from-amber-500/20 to-yellow-500/10",
      iconColor: "text-amber-400",
    },
    {
      icon: Heart,
      label: "Fund your charity",
      sub: "10% guaranteed",
      color: "from-rose-500/20 to-pink-500/10",
      iconColor: "text-rose-400",
    },
    {
      icon: Target,
      label: "Track your progress",
      sub: "Trends & stats",
      color: "from-indigo-500/20 to-purple-500/10",
      iconColor: "text-indigo-400",
    },
  ];

  return (
    <section id="scores" className="bg-[#020205] py-24 border-t border-white/[0.04] relative">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1120px] mx-auto px-5 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-16">
          {/* Left Text */}
          <div className="lg:w-[400px] shrink-0">
            <ScrollReveal
              baseOpacity={0.1}
              enableBlur
              baseRotation={1}
              blurStrength={4}
              containerClassName="my-0"
              textClassName="text-[clamp(28px,3.2vw,40px)] font-extrabold text-white leading-tight tracking-[-0.02em]"
            >
              It&apos;s not about saving time.
            </ScrollReveal>
            <ScrollReveal
              baseOpacity={0.15}
              enableBlur
              baseRotation={0}
              blurStrength={3}
              containerClassName="my-0 mt-4"
              textClassName="text-[15.5px] text-zinc-400 leading-relaxed font-normal"
            >
              It&apos;s about feeling like every round, every penny, and every draw matters. Enhance your game, contribute to what counts, and play for the jackpot.
            </ScrollReveal>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white text-black text-[13.5px] font-bold px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition-all hover:scale-[1.02] shadow-[0_4px_15px_rgba(255,255,255,0.05)]"
              >
                <Download size={13} strokeWidth={2.5} />
                Start Free
              </Link>
            </div>
          </div>

          {/* Right Bento Grid */}
          <div className="flex-1 grid sm:grid-cols-2 gap-4">
            {items.map(({ icon: Icon, label, sub, color, iconColor }, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-md p-6 flex flex-col gap-4 group hover:border-white/[0.12] hover:bg-zinc-900/40 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Accent glow icon wrapper */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center border border-white/[0.04]`}>
                  <Icon size={18} className={iconColor} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white tracking-wide">{label}</h3>
                  <p className="text-[13px] text-zinc-500 mt-1 leading-normal">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features scrolling cards ───────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    icon: BarChart2,
    name: "Score Tracker",
    desc: "Log every round in seconds. WHS-compliant handicap index updated after each submission.",
    tag: "Core",
    color: "emerald",
  },
  {
    icon: Trophy,
    name: "Monthly Draws",
    desc: "Every active subscriber gets draw tickets. Three prize tiers — match 3, 4, or 5 numbers to win.",
    tag: "Prizes",
    color: "amber",
  },
  {
    icon: Heart,
    name: "Charity Giving",
    desc: "Pick from verified charity partners. At least 10% of your subscription goes to your chosen cause.",
    tag: "Impact",
    color: "rose",
  },
  {
    icon: Activity,
    name: "Handicap Engine",
    desc: "WHS-compliant handicap index calculated and updated automatically after every round.",
    tag: "Calculation",
    color: "blue",
  },
  {
    icon: Calendar,
    name: "Round History",
    desc: "Full scorecard archive with per-course breakdowns, performance trends, and best-round stats.",
    tag: "History",
    color: "violet",
  },
  {
    icon: Target,
    name: "Prize Pool",
    desc: "Jackpots roll over and grow each month until claimed. The longer the run, the bigger the win.",
    tag: "Jackpot",
    color: "green",
  },
  {
    icon: Sparkles,
    name: "Leaderboard",
    desc: "Community-wide leaderboards ranked by handicap improvement. Compete, not just play.",
    tag: "Community",
    color: "cyan",
  },
];

const COLOR = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", tag: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   text: "text-amber-400",   tag: "text-amber-400 border-amber-500/10 bg-amber-500/5" },
  rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/20",    text: "text-rose-400",    tag: "text-rose-400 border-rose-500/10 bg-rose-500/5" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400",    tag: "text-blue-400 border-blue-500/10 bg-blue-500/5" },
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  text: "text-violet-400",  tag: "text-violet-400 border-violet-500/10 bg-violet-500/5" },
  green:   { bg: "bg-green-500/10",   border: "border-green-500/20",   text: "text-green-400",   tag: "text-green-400 border-green-500/10 bg-green-500/5" },
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    text: "text-cyan-400",    tag: "text-cyan-400 border-cyan-500/10 bg-cyan-500/5" },
};

function FeaturesSection() {
  const scrollRef = useRef(null);

  return (
    <section className="bg-[#020205] py-24 border-t border-white/[0.04]">
      {/* Header */}
      <div className="max-w-[1120px] mx-auto px-5 mb-10">
        <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.12em] mb-3">
          Features
        </p>
        <div className="flex items-end justify-between gap-4">
          <ScrollReveal
            baseOpacity={0.1}
            enableBlur
            baseRotation={1}
            blurStrength={4}
            containerClassName="my-0 max-w-[480px]"
            textClassName="text-[clamp(28px,3.2vw,40px)] font-extrabold text-white leading-tight tracking-[-0.02em]"
          >
            There&apos;s a feature for that.
          </ScrollReveal>
          <Link
            href="#"
            className="hidden md:flex shrink-0 items-center gap-1.5 text-[13.5px] font-semibold text-zinc-500 hover:text-white transition-colors"
          >
            Explore all <ChevronRight size={15} />
          </Link>
        </div>
      </div>

      {/* Spec sheet sliders */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 px-5 max-w-[1120px] mx-auto scrollbar-hide"
      >
        {FEATURE_CARDS.map((card, i) => {
          const c = COLOR[card.color];
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="shrink-0 w-[240px] rounded-2xl border border-white/[0.05] bg-zinc-950/30 p-6 flex flex-col gap-5 group hover:border-indigo-500/35 hover:bg-zinc-950/60 hover:shadow-[0_0_30px_rgba(82,39,255,0.05)] transition-all duration-300 cursor-pointer hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                  <Icon size={16} className={c.text} strokeWidth={2} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.tag} uppercase tracking-wider`}>
                  {card.tag}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] font-bold text-white tracking-wide">{card.name}</h3>
                <p className="text-[12.5px] text-zinc-500 mt-2 leading-relaxed">{card.desc}</p>
              </div>
              <div className={`flex items-center gap-1 text-[12px] font-bold ${c.text} opacity-70 group-hover:opacity-100 transition-opacity`}>
                Learn more <ArrowRight size={11} />
              </div>
            </div>
          );
        })}

        {/* More coming card */}
        <div className="shrink-0 w-[180px] rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group hover:bg-white/[0.02] hover:border-white/[0.08] transition-all">
          <Sparkles size={22} className="text-zinc-700 group-hover:text-indigo-400 transition-colors" />
          <p className="text-[13px] font-medium text-zinc-500 text-center group-hover:text-zinc-300 transition-colors leading-tight">
            More coming soon
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Section: How It Works ───────────────────────────────────────────────────
const HOW = [
  {
    n: "01",
    title: "Subscribe",
    desc: "Join our community. Select your charity partner. You are entered into all prize draws instantly.",
    icon: UserPlus,
    color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
  },
  {
    n: "02",
    title: "Track Scores",
    desc: "Submit your cards. CauseLoop calculates WHS indices automatically so you see real-time updates.",
    icon: Activity,
    color: "text-purple-400 border-purple-500/20 bg-purple-500/5",
  },
  {
    n: "03",
    title: "Earn Tickets",
    desc: "Get tickets every month. Submit scores consistently to receive bonus tickets for upcoming draws.",
    icon: Ticket,
    color: "text-pink-400 border-pink-500/20 bg-pink-500/5",
  },
  {
    n: "04",
    title: "Win & Give",
    desc: "Matched numbers win cash jackpots. Meanwhile, 10%+ of monthly subs fund chosen charities.",
    icon: Coins,
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#020205] py-24 border-t border-white/[0.04]">
      <div className="max-w-[1120px] mx-auto px-5">
        <div className="text-center mb-16 flex flex-col items-center">
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.12em] mb-3">
            How It Works
          </p>
          <ScrollReveal
            baseOpacity={0.1}
            enableBlur
            baseRotation={0}
            blurStrength={4}
            containerClassName="my-0"
            textClassName="text-[clamp(28px,3.2vw,40px)] font-extrabold text-white leading-tight tracking-[-0.02em]"
          >
            Simple. Fair. Meaningful.
          </ScrollReveal>
          <ScrollReveal
            baseOpacity={0.2}
            enableBlur
            baseRotation={0}
            blurStrength={3}
            containerClassName="my-0 mt-4 max-w-[420px]"
            textClassName="text-[15.5px] text-zinc-500 leading-relaxed font-normal"
          >
            From round tracking to prize pool draws and charity funding, everything happens seamlessly.
          </ScrollReveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div
                key={i}
                className="relative bg-zinc-950/40 border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all hover:bg-zinc-900/40 group duration-300"
              >
                {/* Steps visual elements */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[20px] font-black font-mono text-zinc-700 group-hover:text-zinc-500 transition-colors">
                    {step.n}
                  </span>
                  <div className={`w-8 h-8 rounded-lg border ${step.color} flex items-center justify-center`}>
                    <StepIcon size={15} strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-[15.5px] font-bold text-white tracking-wide mb-2.5">{step.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Charities ──────────────────────────────────────────────────────
const CHARITIES = [
  { icon: Trophy, name: "Golf for Good", cat: "Sport & Youth", raised: "£12,400", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
  { icon: HeartPulse, name: "British Red Cross", cat: "Humanitarian", raised: "£8,200", color: "text-red-400 border-red-500/20 bg-red-500/5" },
  { icon: Waves, name: "Ocean Cleanup", cat: "Environment", raised: "£6,500", color: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
  { icon: Brain, name: "Mental Health UK", cat: "Wellbeing", raised: "£9,100", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
  { icon: Users, name: "Age UK", cat: "Elderly Care", raised: "£5,300", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
  { icon: GraduationCap, name: "UNICEF UK", cat: "Children Support", raised: "£14,700", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" },
];

function FeaturedCharitySpotlight() {
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/charities?featured=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.charities && data.charities.length > 0) {
          setFeatured(data.charities[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading featured charity:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !featured) return null;

  return (
    <div className="mb-12 rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/20 via-zinc-950/50 to-zinc-950/20 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 shadow-lg">
        {featured.image_urls && featured.image_urls.length > 0 ? (
          <img src={featured.image_urls[0]} alt={featured.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-rose-500"><Heart size={28} /></div>
        )}
      </div>

      <div className="flex-grow space-y-3.5 text-center md:text-left">
        <div>
          <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 rounded-full">
            Spotlight partner
          </span>
          <h3 className="text-[18px] font-black text-white mt-2">{featured.name}</h3>
        </div>
        <p className="text-[13px] text-zinc-400 leading-relaxed font-medium max-w-2xl">
          {featured.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-1">
          <Link href={`/charities/${featured.id}`} className="h-8 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all shadow-md">
            View Details <ArrowRight size={11} />
          </Link>
          <Link href="/charities" className="h-8 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[12px] font-bold rounded-xl flex items-center justify-center transition-all">
            Donate One-off
          </Link>
        </div>
      </div>
    </div>
  );
}

function CharitiesSection() {
  return (
    <section id="charities" className="bg-[#020205] py-24 border-t border-white/[0.04] relative">
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-600/5 blur-[130px] pointer-events-none" />

      <div className="max-w-[1120px] mx-auto px-5 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex-1">
            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.12em] mb-3">
              Giving Back
            </p>
            <ScrollReveal
              baseOpacity={0.1}
              enableBlur
              baseRotation={1}
              blurStrength={4}
              containerClassName="my-0"
              textClassName="text-[clamp(28px,3.2vw,40px)] font-extrabold text-white leading-tight tracking-[-0.02em]"
            >
              Your game funds real change.
            </ScrollReveal>
            <ScrollReveal
              baseOpacity={0.2}
              enableBlur
              baseRotation={0}
              blurStrength={3}
              containerClassName="my-0 mt-3 max-w-[420px]"
              textClassName="text-[15.5px] text-zinc-400 leading-relaxed font-normal"
            >
              Select your charity partner. At least 10% of subscription fees are donated to your chosen cause, month in, month out.
            </ScrollReveal>
          </div>
          <Link
            href="/charities"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-zinc-400 border border-white/[0.08] rounded-xl px-4 py-2 hover:text-white hover:border-white/20 transition-all shrink-0 bg-white/[0.02]"
          >
            Browse all charities <ArrowRight size={13} />
          </Link>
        </div>

        <FeaturedCharitySpotlight />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CHARITIES.map((c, i) => {
            const CharityIcon = c.icon;
            return (
              <div
                key={i}
                className="group rounded-2xl border border-white/[0.06] bg-zinc-950/40 p-5 hover:bg-zinc-900/40 hover:border-white/[0.12] transition-all hover:scale-[1.01] duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${c.color} shadow-sm`}>
                    <CharityIcon size={18} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14.5px] font-bold text-white truncate tracking-wide">{c.name}</h3>
                    <p className="text-[12.5px] text-zinc-500 mt-0.5">{c.cat}</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Total Raised</span>
                  <span className="text-[14px] font-bold text-emerald-400">{c.raised}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Prize Draws — Wallet Pass style widget ────────────────────────
const DRAW_TIERS = [
  { label: "Match 3", prize: "£500", numbers: [7, 14, 22], color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5", glow: "border-emerald-500/30" },
  { label: "Match 4", prize: "£2,000", numbers: [7, 14, 22, 31], color: "text-amber-400 border-amber-500/20 bg-amber-500/5", glow: "border-amber-500/30" },
  { label: "Match 5 — Jackpot", prize: "£10,000+", numbers: [7, 14, 22, 31, 38], color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5", glow: "border-indigo-500/30" },
];

function DrawsSection() {
  const [tab, setTab] = useState(2);

  return (
    <section id="draws" className="bg-[#020205] py-24 border-t border-white/[0.04] relative">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1120px] mx-auto px-5 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left info */}
          <div>
            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.12em] mb-3">
              Monthly Draws
            </p>
            <ScrollReveal
              baseOpacity={0.1}
              enableBlur
              baseRotation={1}
              blurStrength={4}
              containerClassName="my-0"
              textClassName="text-[clamp(28px,3.2vw,40px)] font-extrabold text-white leading-tight tracking-[-0.02em]"
            >
              Play golf. Win prizes. Every single month.
            </ScrollReveal>
            <ScrollReveal
              baseOpacity={0.2}
              enableBlur
              baseRotation={0}
              blurStrength={3}
              containerClassName="my-0 mt-4"
              textClassName="text-[15.5px] text-zinc-400 leading-relaxed font-normal"
            >
              Subscribers receive draw tickets automatically. Match 3, 4, or 5 numbers to claim prize tiers. Jackpots roll over monthly if not won.
            </ScrollReveal>

            <div className="mt-8 space-y-2">
              {DRAW_TIERS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setTab(i)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 ${
                    tab === i
                      ? "border-indigo-500/40 bg-indigo-500/5 shadow-[0_4px_20px_rgba(82,39,255,0.05)]"
                      : "border-white/[0.04] bg-zinc-950/20 hover:bg-zinc-900/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[14px] font-bold tracking-wide ${tab === i ? "text-indigo-400" : "text-zinc-500"}`}>
                      {t.label}
                    </span>
                    <span className={`text-[14.5px] font-extrabold ${tab === i ? "text-white" : "text-zinc-400"}`}>
                      {t.prize}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white text-black text-[13.5px] font-bold px-5 py-2.5 rounded-xl hover:bg-zinc-200 transition-all hover:scale-[1.02]"
              >
                <Trophy size={13} strokeWidth={2.5} />
                Enter next draw
              </Link>
            </div>
          </div>

          {/* Right — Apple Wallet Pass style ticket */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0c0a1a] to-[#040308] overflow-hidden shadow-2xl relative">
            {/* Holographic light reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03] pointer-events-none" />

            {/* Ticket Header */}
            <div className="px-6 py-5 border-b border-dashed border-white/[0.08] flex justify-between items-center relative">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Draw Period</p>
                <p className="text-[16px] font-extrabold text-white mt-1">June 2026</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Prize Category</p>
                <p className="text-[16px] font-extrabold text-indigo-400 mt-1">{DRAW_TIERS[tab].label}</p>
              </div>

              {/* Ticket side notches */}
              <div className="absolute left-0 bottom-0 w-3 h-6 bg-[#020205] rounded-r-full -translate-x-1.5 translate-y-3 border-r border-t border-b border-white/[0.08]" />
              <div className="absolute right-0 bottom-0 w-3 h-6 bg-[#020205] rounded-l-full translate-x-1.5 translate-y-3 border-l border-t border-b border-white/[0.08]" />
            </div>

            {/* Ticket Content */}
            <div className="p-6">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-4">Draw Numbers</p>
              <div className="flex gap-3 flex-wrap">
                {[7, 14, 22, 31, 38].map((n) => {
                  const isMatched = DRAW_TIERS[tab].numbers.includes(n);
                  return (
                    <div
                      key={n}
                      className={`w-11 h-11 rounded-full border flex items-center justify-center text-[15px] font-extrabold transition-all duration-300 ${
                        isMatched
                          ? "border-indigo-500/40 text-white bg-indigo-500/10 shadow-[0_0_15px_rgba(82,39,255,0.2)]"
                          : "border-white/[0.05] text-zinc-700 bg-white/[0.01]"
                      }`}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>

              {/* Stats card inside pass */}
              <div className="mt-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex justify-between items-center">
                  <p className="text-[12.5px] font-medium text-zinc-400">Match Target</p>
                  <p className="text-[16px] font-bold text-white">
                    {DRAW_TIERS[tab].numbers.length} / 5 numbers
                  </p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.04]">
                  <p className="text-[12.5px] font-medium text-zinc-400 font-sans">Est. Reward Pool</p>
                  <p className="text-[16px] font-extrabold text-indigo-400">{DRAW_TIERS[tab].prize}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
// ─── Pricing ─────────────────────────────────────────────────────────────────
function PricingSection({ user, loading }) {
  const [yearly, setYearly] = useState(false);

  const FREE_FEATURES = ["Browse charity profiles", "View public leaderboard", "Read the updates"];
  const PRO_FEATURES  = [
    "Unlimited score tracking",
    "Automatic WHS handicap calculation",
    "Monthly prize draw entries",
    "10%+ subscription charity share",
    "Jackpot rollover prize pool access",
    "Priority platform support",
  ];

  return (
    <section id="pricing" className="bg-[#020205] py-24 border-t border-white/[0.04]">
      <div className="max-w-[1120px] mx-auto px-5">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.12em] mb-3">
            Pricing
          </p>
          <h2 className="text-[clamp(28px,3.2vw,40px)] font-extrabold text-white leading-tight tracking-[-0.02em]">
            One simple membership.
          </h2>
          <p className="mt-3 text-[15.5px] text-zinc-500">
            No hidden extras. Change or cancel anytime.
          </p>

          {/* Apple Pill Switcher */}
          <div className="inline-flex items-center gap-0.5 mt-8 border border-white/[0.08] rounded-xl p-1 bg-white/[0.02]">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${
                !yearly ? "bg-white text-black shadow-md" : "text-zinc-500 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all flex items-center gap-1.5 ${
                yearly ? "bg-white text-black shadow-md" : "text-zinc-500 hover:text-white"
              }`}
            >
              Yearly
              <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-md font-semibold tracking-wide">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-[700px] mx-auto">
          {/* Visitor */}
          <div className="rounded-2xl border border-white/[0.06] bg-zinc-950/30 p-8 flex flex-col justify-between hover:border-white/[0.1] transition-all">
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-extrabold">Visitor</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-[42px] font-black text-white leading-none">£0</span>
                <span className="text-[14px] text-zinc-500 mb-1.5">/mo</span>
              </div>
              <p className="text-[13px] text-zinc-500 mt-3">Browse and follow without logging rounds.</p>
              <div className="mt-8 space-y-3">
                {FREE_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check size={14} className="text-zinc-700" strokeWidth={2.5} />
                    <span className="text-[13px] text-zinc-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            {!loading && user ? (
              <Link
                href="/dashboard"
                className="mt-8 block text-center text-[13.5px] font-bold border border-white/[0.08] text-white py-3 rounded-xl hover:bg-white/[0.02] transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="mt-8 block text-center text-[13.5px] font-bold border border-white/[0.08] text-white py-3 rounded-xl hover:bg-white/[0.02] transition-all"
              >
                Get Started Free
              </Link>
            )}
          </div>

          {/* Pro / Subscriber */}
          <div className="relative rounded-2xl border border-indigo-500/40 bg-zinc-950/40 p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(82,39,255,0.1)] hover:border-indigo-500/60 transition-all">
            <div className="absolute top-4 right-4 text-[10px] font-extrabold text-white bg-indigo-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Popular
            </div>
            <div>
              <p className="text-[11px] text-indigo-400 uppercase tracking-widest font-extrabold">Subscriber</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-[42px] font-black text-white leading-none">
                  {yearly ? "£10" : "£12"}
                </span>
                <span className="text-[14px] text-zinc-500 mb-1.5">/mo</span>
                {yearly && (
                  <span className="text-[11.5px] text-emerald-400 mb-1.5 ml-2 font-bold">
                    Save £24 /yr
                  </span>
                )}
              </div>
              <p className="text-[13px] text-zinc-400 mt-3">Full scoring updates, monthly draws, and charity support.</p>
              <div className="mt-8 space-y-3">
                {PRO_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <Check size={14} className="text-indigo-400" strokeWidth={2.5} />
                    <span className="text-[13px] text-zinc-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            {!loading && user ? (
              <Link
                href="/dashboard"
                className="mt-8 block text-center text-[13.5px] font-bold bg-white text-black py-3 rounded-xl hover:bg-zinc-200 transition-all hover:scale-[1.01] shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="mt-8 block text-center text-[13.5px] font-bold bg-white text-black py-3 rounded-xl hover:bg-zinc-200 transition-all hover:scale-[1.01] shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
              >
                Start 14-Day Free Trial
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Bottom CTA — Purple ambient glow background ─────────────────────────────
function BottomCTA({ user, loading }) {
  return (
    <section className="relative bg-[#020205] py-32 border-t border-white/[0.04] overflow-hidden">
      {/* Silk background configuration */}
      <Silk
        speed={5}
        scale={1}
        color="#5227FF"
        noiseIntensity={1.5}
        rotation={0}
        className="opacity-40 pointer-events-none"
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, rgba(2,2,5,0.85) 80%)",
        }}
      />

      <div className="relative z-10 text-center px-5 max-w-[600px] mx-auto flex flex-col items-center">
        <ScrollReveal
          baseOpacity={0.1}
          enableBlur
          baseRotation={0}
          blurStrength={5}
          containerClassName="my-0"
          textClassName="text-[clamp(36px,5.5vw,66px)] font-extrabold text-white tracking-[-0.03em] leading-[1.08]"
        >
          Take the short way.
        </ScrollReveal>
        <ScrollReveal
          baseOpacity={0.2}
          enableBlur
          baseRotation={0}
          blurStrength={3}
          containerClassName="my-0 mt-5 max-w-[400px]"
          textClassName="text-[15.5px] text-zinc-300"
        >
          Subscribe to CauseLoop and start tracking, winning.
        </ScrollReveal>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-9 w-full sm:w-auto">
          {!loading && user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black text-[14.5px] font-bold px-8 py-3.5 rounded-xl hover:bg-zinc-200 hover:scale-[1.02] transition-all shadow-[0_8px_30px_rgba(255,255,255,0.25)]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black text-[14px] font-bold px-6 py-3.5 rounded-xl hover:bg-zinc-200 transition-all hover:scale-[1.02] shadow-[0_8px_30px_rgba(82,39,255,0.2)]"
              >
                <Download size={14} strokeWidth={2.5} />
                Start Free Trial
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center text-[14px] text-zinc-400 hover:text-white transition-colors font-bold py-3.5"
              >
                Learn more <ArrowRight size={14} className="ml-1.5" />
              </Link>
            </>
          )}
        </div>
        <p className="mt-5 text-[12.5px] text-zinc-500">No card required · Instant 14-day access</p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const FOOTER = {
  Platform:   ["How It Works", "Score Tracker", "Monthly Draws", "Charity Partners", "Leaderboard"],
  Pricing:    ["Monthly Plan", "Yearly Plan", "Gift a Sub", "Team Plans", "FAQ"],
  Company:    ["About", "Blog", "Press", "Careers", "Contact"],
  Community:  ["Discord", "Twitter / X", "Instagram", "Newsletter", "Referrals"],
};

function Footer() {
  return (
    <footer className="bg-[#020205] border-t border-white/[0.04] py-16 relative">
      <div className="max-w-[1120px] mx-auto px-5 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo size={22} />
              <span className="text-white font-bold text-[15px] tracking-wide">CauseLoop</span>
            </Link>
            <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[220px]">
              Golf score tracking combined with monthly charity-driven prize draws.
            </p>
            <form className="mt-6 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-2 text-[13px] text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500/40 min-w-0"
              />
              <button
                type="submit"
                className="bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-white rounded-xl px-3.5 py-2 transition-all flex items-center justify-center shrink-0"
              >
                <ArrowRight size={13} />
              </button>
            </form>
          </div>

          {/* Navigation Links Columns */}
          {Object.entries(FOOTER).map(([cat, links]) => (
            <div key={cat}>
              <h4 className="text-[11.5px] text-zinc-400 font-extrabold uppercase tracking-[0.1em] mb-4">{cat}</h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-[13px] text-zinc-500 hover:text-white transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12.5px] text-zinc-600">© {new Date().getFullYear()} CauseLoop Ltd. All rights reserved.</p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <Link key={l} href="#" className="text-[12.5px] text-zinc-600 hover:text-zinc-400 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page Shell ──────────────────────────────────────────────────────────
export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    // Fetch initial user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="bg-[#020205] min-h-screen text-white font-sans selection:bg-indigo-500/25 selection:text-white antialiased">
      <Navbar user={user} loading={loading} />
      <Hero user={user} loading={loading} />
      <TimeSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CharitiesSection />
      <DrawsSection />
      <PricingSection user={user} loading={loading} />
      <BottomCTA user={user} loading={loading} />
      <Footer />
    </div>
  );
}
