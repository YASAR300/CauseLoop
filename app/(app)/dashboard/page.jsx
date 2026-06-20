"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Table,
  Terminal,
  Database,
  FolderOpen,
  Settings,
  Plus,
  Copy,
  Check,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  ArrowUpRight,
  Lock,
  Play,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  Server,
  Cpu,
  Bot,
  Key,
  ShieldCheck,
  Calendar,
  Layers,
  Heart,
  PlusCircle,
  SearchCode,
  FileText,
  CreditCard,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Logo component matching landing page style
function Logo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="dash-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5227FF" />
          <stop offset="100%" stopColor="#8644FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#dash-logo-grad)"
        fillRule="evenodd"
        d="M12 30.99V36L-.01 23.99l2.516-2.499zM17.01 36H12l12.011 12.01 2.506-2.505zm28.487-9.497L48 24 24 0l-2.503 2.503L30.98 12h-5.732l-6.62-6.614-2.506 2.503 4.122 4.122h-2.869v18.625H36V27.77l4.122 4.122 2.503-2.506L36 22.747v-5.732zM13.253 10.747l-2.503 2.506 2.686 2.686 2.503-2.506zm21.314 21.314-2.495 2.503 2.686 2.686 2.506-2.503zM7.878 16.121l-2.503 2.504L12 25.253v-5.012zM27.756 36h-5.009l6.628 6.625 2.503-2.503z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const [verifyingSubscription, setVerifyingSubscription] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // API credentials toggles
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);

  // Scores State (Table Editor)
  const [scores, setScores] = useState([
    { id: "1", course: "Pinehurst No. 2", date: "2026-06-18", strokes: 79, net: "Net +2", diff: 8.4 },
    { id: "2", course: "St Andrews (Old)", date: "2026-06-10", strokes: 82, net: "Net +5", diff: 11.2 },
    { id: "3", course: "Pebble Beach GL", date: "2026-05-28", strokes: 80, net: "Net +3", diff: 9.6 }
  ]);
  const [newCourse, setNewCourse] = useState("");
  const [newStrokes, setNewStrokes] = useState("");
  const [newDate, setNewDate] = useState("2026-06-20");
  const [showAddScoreModal, setShowAddScoreModal] = useState(false);

  // SQL Editor State
  const [selectedQuery, setSelectedQuery] = useState("select_draws");
  const [queryRunning, setQueryRunning] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  // Database Explorer (Charities schema)
  const [selectedSchemaTable, setSelectedSchemaTable] = useState("charities");

  // Storage Bucket Browser (Pricing plans)
  const [selectedBucketFile, setSelectedBucketFile] = useState(null);

  // Project Settings State
  const [projectName, setProjectName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (currentUser) {
        setUser(currentUser);
        setProjectName(`${currentUser.email?.split("@")[0]}'s Project`);
        
        // Fetch profile
        supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()
          .then(({ data: prof }) => {
            setProfile(prof || { role: "subscriber", charity_contribution_percentage: 10.00 });
            
            // Check query params for checkout=success
            const searchParams = new URLSearchParams(window.location.search);
            const isCheckoutSuccess = searchParams.get("checkout") === "success";

            // Fetch subscription
            supabase
              .from("subscriptions")
              .select("*")
              .eq("user_id", currentUser.id)
              .maybeSingle()
              .then(({ data: sub }) => {
                setSubscription(sub);

                if (isCheckoutSuccess) {
                  // If we don't have an active subscription yet, start immediate confirmation and polling
                  if (!sub || sub.status !== "active") {
                    setVerifyingSubscription(true);
                    setLoading(false); // Let dashboard load behind verification backdrop

                    const sessionId = searchParams.get("session_id");

                    const cleanAndComplete = (activeSub) => {
                      setSubscription(activeSub);
                      setVerifyingSubscription(false);
                      setShowSuccessModal(true);
                      // Clean up URL query params
                      const cleanUrl = window.location.pathname;
                      window.history.replaceState({}, document.title, cleanUrl);
                    };

                    let isCompleted = false;

                    const startPolling = () => {
                      if (isCompleted) return;
                      let attempts = 0;
                      const maxAttempts = 12; // 18 seconds total
                      const intervalId = setInterval(() => {
                        if (isCompleted) {
                          clearInterval(intervalId);
                          return;
                        }
                        attempts++;
                        supabase
                          .from("subscriptions")
                          .select("*")
                          .eq("user_id", currentUser.id)
                          .maybeSingle()
                          .then(({ data: freshSub }) => {
                            if (freshSub && freshSub.status === "active") {
                              isCompleted = true;
                              clearInterval(intervalId);
                              cleanAndComplete(freshSub);
                            } else if (attempts >= maxAttempts) {
                              clearInterval(intervalId);
                              setVerifyingSubscription(false);
                              setShowPendingModal(true);
                              const cleanUrl = window.location.pathname;
                              window.history.replaceState({}, document.title, cleanUrl);
                            }
                          });
                      }, 1500);
                    };

                    // Try immediate confirmation if session_id is available
                    if (sessionId) {
                      fetch(`/api/checkout/confirm?session_id=${sessionId}`)
                        .then((res) => res.json())
                        .then((data) => {
                          if (data && data.status === "active") {
                            isCompleted = true;
                            cleanAndComplete(data.subscription);
                          } else {
                            startPolling();
                          }
                        })
                        .catch((err) => {
                          console.error("Error confirming checkout session:", err);
                          startPolling();
                        });
                    } else {
                      startPolling();
                    }
                  } else {
                    // Already active, just show success modal
                    setShowSuccessModal(true);
                    setLoading(false);
                    // Clean up URL query params
                    const cleanUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);
                  }
                } else {
                  // Standard flow
                  // Auto-sweep expired subscriptions in client browser
                  if (sub && sub.status === "active" && new Date(sub.current_period_end) < new Date()) {
                    supabase
                      .from("subscriptions")
                      .update({ status: "lapsed" })
                      .eq("id", sub.id)
                      .then(() => {
                        router.push("/subscribe");
                      });
                  } else {
                    setLoading(false);
                  }
                }
              });
          });
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const handleCopyLink = (text = "https://wkchanfyajdivmuummsb.supabase.co") => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Add round logic
  const handleAddScoreSubmit = (e) => {
    e.preventDefault();
    if (!newCourse || !newStrokes) return;
    const strokesNum = parseInt(newStrokes, 10);
    const diffVal = parseFloat(((strokesNum - 72) * 1.13).toFixed(1));
    const newEntry = {
      id: (scores.length + 1).toString(),
      course: newCourse,
      date: newDate,
      strokes: strokesNum,
      net: strokesNum > 72 ? `Net +${strokesNum - 72}` : `Net -${72 - strokesNum}`,
      diff: diffVal
    };
    setScores([newEntry, ...scores]);
    setNewCourse("");
    setNewStrokes("");
    setShowAddScoreModal(false);
  };

  // Run SQL Query simulation
  const handleRunQuery = () => {
    setQueryRunning(true);
    setTimeout(() => {
      setQueryRunning(false);
      if (selectedQuery === "select_draws") {
        setQueryResult([
          { month: "June", year: 2026, draw_type: "five_match", logic_type: "random", status: "published", prize_pool_amount: "£10,250", jackpot_rollover_amount: "£8,000" },
          { month: "June", year: 2026, draw_type: "four_match", logic_type: "algorithmic", status: "simulated", prize_pool_amount: "£2,450", jackpot_rollover_amount: "£0" },
          { month: "May", year: 2026, draw_type: "five_match", logic_type: "random", status: "published", prize_pool_amount: "£9,800", jackpot_rollover_amount: "£6,500" }
        ]);
      } else {
        setQueryResult([
          { user_id: "usr_91238a", total_entries: 3, last_played: "2026-06-19" },
          { user_id: "usr_77219c", total_entries: 2, last_played: "2026-06-15" },
          { user_id: "usr_55610d", total_entries: 5, last_played: "2026-06-20" }
        ]);
      }
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#3ecf8e] border-t-transparent animate-spin" />
          <p className="text-[13px] text-zinc-400">Loading CauseLoop Studio...</p>
        </div>
      </div>
    );
  }

  const userEmail = user?.email || "tepo1744@gmail.com";
  const orgName = `${userEmail}'s Org`;

  return (
    <div className="h-screen bg-[#181818] text-[#e4e4e7] flex flex-col font-sans select-none overflow-hidden">
      
      {/* ── TOP NAV BAR (Supabase-Style) ── */}
      <header className="h-[46px] bg-[#111111] border-b border-[#222] flex items-center px-4 justify-between sticky top-0 z-40 text-white shrink-0">
        <div className="flex items-center gap-2">
          {/* CauseLoop Logo */}
          <Link href="/" className="flex items-center gap-2 mr-3 group">
            <Logo size={18} />
          </Link>

          <span className="text-[#333] text-lg font-light">/</span>

          {/* Org Selector */}
          <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#1a1a1e] rounded cursor-pointer transition-colors text-[12px] font-medium text-zinc-300">
            <span>{orgName}</span>
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider scale-90 ${
              profile?.role === "admin"
                ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400"
                : (subscription?.status === "active"
                  ? "bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 text-[#3ecf8e]"
                  : "bg-[#222] border border-[#333] text-zinc-400")
            }`}>
              {profile?.role === "admin" ? "Admin" : (subscription?.status === "active" ? "Pro" : "Free")}
            </span>
            <ChevronDown size={11} className="text-zinc-500" />
          </div>

          <span className="text-[#333] text-lg font-light">/</span>

          {/* Project Selector */}
          <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#1a1a1e] rounded cursor-pointer transition-colors text-[12px] font-medium text-zinc-300">
            <span>{projectName}</span>
            <ChevronDown size={11} className="text-zinc-500" />
          </div>

          <span className="text-[#333] text-lg font-light">/</span>

          {/* Branch Selector */}
          <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#1a1a1e] rounded cursor-pointer transition-colors text-[12px] font-medium text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]" />
            <span>main</span>
            <ChevronDown size={11} className="text-zinc-500" />
          </div>

          {/* Connect Button */}
          <button className="h-[24px] px-2.5 bg-[#3ecf8e]/10 hover:bg-[#3ecf8e]/20 border border-[#3ecf8e]/20 text-[#3ecf8e] text-[11px] font-bold rounded flex items-center gap-1 transition-all ml-2">
            <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            Connect
          </button>
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-400 hover:text-white bg-[#1e1e1e] border border-[#2e2e2e] px-2.5 py-0.5 rounded cursor-pointer transition-all">
            Feedback
          </span>

          {/* Search Box */}
          <div className="h-[24px] px-2.5 border border-[#2e2e2e] bg-[#141414] text-zinc-500 rounded flex items-center gap-3 text-[11.5px] cursor-pointer hover:border-zinc-700 transition-all">
            <Search size={11} />
            <span>Search...</span>
            <span className="text-[9px] bg-[#1a1a1c] px-1 rounded border border-[#2e2e2e] font-mono">Ctrl K</span>
          </div>

          <HelpCircle size={15} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />
          <Bell size={15} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />

          {/* User Profile Dropdown */}
          <div className="relative group cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5227FF] to-purple-600 border border-zinc-700 flex items-center justify-center font-bold text-white text-[10px] select-none shadow-sm">
              {userEmail[0].toUpperCase()}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#111111] ${
              subscription?.status === "active" ? "bg-[#3ecf8e]" : "bg-zinc-500"
            }`} />
            
            {/* Popover */}
            <div className="absolute right-0 mt-2 w-48 bg-[#141414] border border-[#2e2e2e] rounded-lg shadow-2xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="px-4 py-2 border-b border-zinc-900">
                <p className="text-[10px] text-zinc-500 truncate">Signed in as</p>
                <p className="text-[12px] font-semibold text-white truncate mt-0.5">{userEmail}</p>
              </div>
              {subscription?.status === "active" ? (
                <a
                  href="/api/portal"
                  className="w-full text-left px-4 py-2 text-[12px] text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center gap-2 border-b border-zinc-900/50"
                >
                  <CreditCard size={12} className="text-[#3ecf8e]" />
                  Manage Billing
                </a>
              ) : (
                <Link
                  href="/subscribe"
                  className="w-full text-left px-4 py-2 text-[12px] text-indigo-400 hover:text-indigo-300 hover:bg-zinc-900 transition-colors flex items-center gap-2 border-b border-zinc-900/50 font-bold"
                >
                  <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                  Upgrade to Pro
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-[12px] text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors flex items-center gap-2"
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTAINER ── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ── LEFT SIDEBAR (Supabase studio look) ── */}
        <aside className="w-[46px] bg-[#111111] border-r border-[#222] flex flex-col justify-between items-center py-4 shrink-0 z-30 overflow-hidden select-none">
          <div className="flex flex-col gap-1.5 w-full items-center">
            {[
              { id: "overview", label: "Project Overview", icon: Home },
              { id: "scores", label: "Table Editor", icon: Table },
              { id: "draws", label: "SQL Editor", icon: Terminal },
              { id: "charities", label: "Database Explorer", icon: Database },
              { id: "pricing", label: "Storage Browser", icon: FolderOpen },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-9 h-9 rounded flex items-center justify-center relative group transition-all ${
                    isActive
                      ? "text-[#3ecf8e] bg-[#1d2c25]"
                      : "text-zinc-400 hover:text-white hover:bg-[#1a1a1f]"
                  }`}
                >
                  {/* Left Active Marker */}
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#3ecf8e] rounded" />}
                  <Icon size={16} />
                  
                  {/* Label tooltip on hover */}
                  <span className="absolute left-12 px-2.5 py-1 bg-[#1c1c1e] text-[11px] text-white rounded border border-[#2e2e2e] shadow-xl font-medium tracking-wide whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-100 z-50">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Settings Link & Logout */}
          <div className="flex flex-col gap-1 w-full items-center">
            <button
              onClick={() => setActiveTab("settings")}
              title="Project Settings"
              className={`w-9 h-9 rounded flex items-center justify-center relative group transition-all ${
                activeTab === "settings"
                  ? "text-[#3ecf8e] bg-[#1d2c25]"
                  : "text-zinc-400 hover:text-white hover:bg-[#1a1a1f]"
              }`}
            >
              {activeTab === "settings" && <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#3ecf8e] rounded" />}
              <Settings size={16} />
              <span className="absolute left-12 px-2.5 py-1 bg-[#1c1c1e] text-[11px] text-white rounded border border-[#2e2e2e] shadow-xl font-medium tracking-wide whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-100 z-50">
                Project Settings
              </span>
            </button>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-9 h-9 rounded flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all group relative"
            >
              <LogOut size={16} />
              <span className="absolute left-12 px-2.5 py-1 bg-[#1c1c1e] text-[11px] text-white rounded border border-[#2e2e2e] shadow-xl font-medium tracking-wide whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-100 z-50">
                Sign Out
              </span>
            </button>
          </div>
        </aside>

        {/* ── MAIN WORKSPACE CONTENT ── */}
        <main className="flex-1 bg-[#181818] overflow-y-auto relative p-6 md:p-8 flex flex-col justify-start">

          {/* ============================================================ */}
          {/* TAB 1: PROJECT OVERVIEW                                      */}
          {/* ============================================================ */}
          {activeTab === "overview" && (
            <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-fadeInUp">
              
              {/* Header Title Grid Row */}
              <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6 pb-6 border-b border-[#222]">
                <div className="space-y-1.5">
                  <h1 className="text-[22px] font-bold text-white tracking-tight leading-tight">{projectName}</h1>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11.5px] text-zinc-400 font-mono select-text bg-[#111] border border-[#2e2e2e] px-2.5 py-0.5 rounded flex items-center gap-1.5">
                      https://wkchanfyajdivmuummsb.supabase.co
                    </span>
                    <button
                      onClick={() => handleCopyLink()}
                      className="text-zinc-500 hover:text-white p-1 rounded hover:bg-[#222] border border-[#2e2e2e] bg-[#1e1e1e] transition-all"
                      title="Copy Project URL"
                    >
                      {copied ? <Check size={12} className="text-[#3ecf8e]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Sub status blocks (Matches top block in screenshot) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 w-full lg:w-auto">
                  {[
                    { label: "Status", value: "Healthy", indicator: "bg-[#3ecf8e]" },
                    { label: "Compute", value: "NANO" },
                    { label: "Github", value: "No repository connected", textDim: true },
                    { label: "Recent Branch", value: "No branches", textDim: true },
                    { label: "Last Migration", value: "No migrations", textDim: true },
                    { label: "Last Backup", value: "No backups", textDim: true }
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#141414] border border-[#222] rounded-lg p-2.5 flex flex-col justify-between min-w-[100px] h-[64px]">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{stat.label}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        {stat.indicator && <span className={`w-1.5 h-1.5 rounded-full ${stat.indicator} animate-pulse`} />}
                        <span className={`text-[12px] font-bold truncate ${stat.textDim ? "text-zinc-500 font-medium" : "text-white"}`}>
                          {stat.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Overview Grid Layout (Split Left Content vs Right Server graphic) */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Left Columns (Get Connected & Total Requests) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Get Connected Grid Panel (Matches screenshot layout) */}
                  <div className="space-y-3">
                    <h3 className="text-[11px] uppercase tracking-wider font-bold text-zinc-500 flex items-center gap-1.5">
                      <Layers size={11} className="text-zinc-500" />
                      Get connected
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { title: "Framework", desc: "Use a client library", icon: Sparkles },
                        { title: "Server", desc: "Build APIs", icon: Server },
                        { title: "Direct", desc: "Connection string", icon: Terminal },
                        { title: "ORM", desc: "Third-party library", icon: Cpu },
                        { title: "MCP", desc: "Connect your agent", icon: Bot },
                        { title: "API Keys", desc: "Manage project keys", icon: Key }
                      ].map((item, i) => {
                        const IconComp = item.icon;
                        return (
                          <div
                            key={i}
                            className="bg-[#141414] border border-[#222] hover:border-zinc-700 rounded-lg p-4 flex items-start gap-3.5 cursor-pointer hover:bg-[#1c1c1f]/50 transition-all duration-150 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-[#2e2e2e] flex items-center justify-center text-zinc-400 group-hover:text-[#3ecf8e] group-hover:border-[#3ecf8e]/30 transition-colors shrink-0">
                              <IconComp size={15} />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <h4 className="text-[12.5px] font-bold text-white group-hover:text-[#3ecf8e] transition-colors">{item.title}</h4>
                              <p className="text-[11.5px] text-zinc-500 truncate">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 11 Total Requests Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
                        11 Total Requests
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 bg-[#141414] border border-[#222] px-2 py-0.5 rounded cursor-pointer hover:text-white hover:bg-[#1a1a1f] transition-all">
                        <span>Last 60 minutes</span>
                        <ChevronDown size={10} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { title: "Database Requests", val: "3", active: true, bars: [5, 20, 45, 95, 60, 40, 20, 10, 5, 0, 0, 0] },
                        { title: "Auth Requests", val: "8", active: true, bars: [10, 60, 85, 30, 70, 95, 40, 20, 15, 0, 0, 0] },
                        { title: "Storage Requests", val: "0", active: false, bars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
                        { title: "Realtime Requests", val: "0", active: false, bars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
                      ].map((item, i) => (
                        <div key={i} className="bg-[#141414] border border-[#222] rounded-lg p-4 flex flex-col justify-between h-[145px]">
                          <div>
                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold">{item.title}</p>
                            <p className="text-[20px] font-black text-white mt-0.5">{item.val}</p>
                          </div>
                          
                          {/* Dotted/Bar chart representation */}
                          <div className="h-[40px] flex items-end gap-1 pt-2">
                            {item.bars.map((bVal, idx) => (
                              <div
                                key={idx}
                                style={{ height: `${bVal || 6}%` }}
                                className={`flex-1 rounded-sm transition-all duration-200 ${
                                  bVal > 0 
                                    ? "bg-[#3ecf8e] hover:bg-[#58e0a3]" 
                                    : "bg-zinc-800/40"
                                }`}
                              />
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center text-[8.5px] text-zinc-600 font-mono mt-1 pt-1 border-t border-[#1e1e1e]">
                            <span>9:15pm</span>
                            <span>10:10pm</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column (Primary Database Map Node & Metrics) */}
                <div className="space-y-6">
                  
                  {/* Database Health Card & Dotted Grid */}
                  <div className="space-y-3">
                    <h3 className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
                      Primary Database Location
                    </h3>

                    {/* Dotted Graphic Panel */}
                    <div 
                      className="h-[224px] border border-[#222] rounded-xl flex items-center justify-center relative"
                      style={{
                        backgroundColor: "#111111",
                        backgroundImage: "radial-gradient(#2e2e33 1px, transparent 1px)",
                        backgroundSize: "16px 16px"
                      }}
                    >
                      {/* Grid Lines decorative overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                      
                      {/* Floating Database location node */}
                      <div className="relative bg-[#141414] border border-[#3ecf8e]/30 shadow-2xl p-4 rounded-xl max-w-[280px] w-full text-left space-y-3 z-10 animate-pulse-slow">
                        
                        <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#2e2e33]">
                          <div className="w-7 h-7 rounded-lg bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 flex items-center justify-center text-[#3ecf8e]">
                            <Database size={14} />
                          </div>
                          <div>
                            <h4 className="text-[12.5px] font-bold text-white">Primary Database</h4>
                            <p className="text-[11px] text-zinc-400">Singapore (ap-southeast-1)</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-[11px] font-mono text-zinc-400">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Tier:</span>
                            <span className="font-bold text-white">14g.nano</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Resources:</span>
                            <span className="text-[#3ecf8e] font-semibold">Healthy</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Metrics:</span>
                            <span>CPU 2% · Disk 14%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Active Conns:</span>
                            <span>0 / 60</span>
                          </div>
                        </div>

                        {/* Progress bars inside card */}
                        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden flex">
                          <div className="bg-[#3ecf8e] h-full" style={{ width: "2%" }} />
                          <div className="bg-[#5227FF] h-full" style={{ width: "14%" }} />
                        </div>
                      </div>

                      {/* Glowing Radar Target */}
                      <span className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-[#3ecf8e] rounded-full border border-white">
                        <span className="absolute -inset-2 bg-[#3ecf8e]/40 rounded-full animate-ping" />
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Advisor found no issues */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
                    Advisor found no issues
                  </h3>
                  <button className="text-[11px] text-zinc-400 hover:text-white bg-[#141414] border border-[#222] px-2.5 py-0.5 rounded cursor-pointer hover:bg-[#1a1a1f] transition-all">
                    Ask Assistant
                  </button>
                </div>

                <div className="bg-[#141414] border border-[#222] rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[90px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3ecf8e] animate-ping" />
                    <p className="text-[12px] font-bold text-zinc-400">No security or performance issues found</p>
                  </div>
                </div>
              </div>

              {/* Reports Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">
                    Reports
                  </h3>
                  <button className="text-[11px] text-zinc-400 hover:text-white bg-[#141414] border border-[#222] px-2.5 py-0.5 rounded cursor-pointer hover:bg-[#1a1a1f] transition-all flex items-center gap-1">
                    <Plus size={11} />
                    Add block
                  </button>
                </div>

                <div className="bg-[#141414] border border-dashed border-[#2e2e2e] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <p className="text-[12.5px] font-bold text-white">Build a custom report</p>
                  <p className="text-[11.5px] text-zinc-500 max-w-[280px] mt-1 mb-4 leading-relaxed">
                    Keep track of your most important metrics by creating customizable grids.
                  </p>
                  <button className="bg-[#242428] hover:bg-[#2d2d33] border border-[#2e2e33] text-zinc-200 text-[11.5px] font-bold px-3 py-1.5 rounded transition-all">
                    Add your first block +
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: TABLE EDITOR (Scores)                                 */}
          {/* ============================================================ */}
          {activeTab === "scores" && (
            <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-fadeInUp flex flex-col flex-1 h-full">
              
              <div className="flex justify-between items-center border-b border-[#222] pb-5 shrink-0">
                <div>
                  <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                    <Table size={18} className="text-[#3ecf8e]" />
                    Table Editor: <span className="text-zinc-400 font-mono text-[16px] bg-[#111] px-2 py-0.5 rounded border border-[#222]">public.scores</span>
                  </h1>
                  <p className="text-[12.5px] text-zinc-500 mt-1">Log rounds, check strokes net scores, and recalculate WHS differentials.</p>
                </div>
                <button 
                  onClick={() => setShowAddScoreModal(true)}
                  className="bg-[#3ecf8e] text-black hover:bg-[#32b37a] text-[12px] font-bold h-8 px-3 rounded flex items-center gap-1.5 transition-all"
                >
                  <Plus size={13} strokeWidth={2.5} /> Log Round
                </button>
              </div>

              {/* Spread-sheet style table view */}
              <div className="flex-grow bg-[#141414] border border-[#222] rounded-lg overflow-hidden flex flex-col shadow-2xl">
                {/* Table Header Filter options */}
                <div className="h-[40px] bg-[#111] border-b border-[#222] flex items-center px-4 justify-between text-[11.5px] text-zinc-400 shrink-0">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-white">public.scores</span>
                    <span className="text-zinc-600">|</span>
                    <button className="hover:text-white">Filter</button>
                    <button className="hover:text-white">Sort</button>
                    <button className="hover:text-white">Columns</button>
                  </div>
                  <div>
                    <span>{scores.length} rows</span>
                  </div>
                </div>

                {/* Table Layout */}
                <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                  <table className="w-full border-collapse text-left text-[12.5px] font-mono">
                    <thead>
                      <tr className="border-b border-[#222] bg-[#161616] text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        <th className="px-4 py-2 border-r border-[#222] w-[40px] text-center bg-[#111]">#</th>
                        <th className="px-5 py-2.5 border-r border-[#222]">id [uuid]</th>
                        <th className="px-5 py-2.5 border-r border-[#222]">course_name [text]</th>
                        <th className="px-5 py-2.5 border-r border-[#222]">play_date [date]</th>
                        <th className="px-5 py-2.5 border-r border-[#222]">strokes [int4]</th>
                        <th className="px-5 py-2.5 border-r border-[#222]">net_score [text]</th>
                        <th className="px-5 py-2.5">whs_diff [numeric]</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222] text-zinc-300">
                      {scores.map((s, index) => (
                        <tr key={s.id} className="hover:bg-[#1e1e1e] transition-colors group">
                          <td className="px-4 py-2 border-r border-[#222] text-center bg-[#111] text-zinc-600 font-sans">{index + 1}</td>
                          <td className="px-5 py-2.5 border-r border-[#222] text-[#3ecf8e] truncate max-w-[120px]">{s.id}</td>
                          <td className="px-5 py-2.5 border-r border-[#222] font-sans font-bold text-white">{s.course}</td>
                          <td className="px-5 py-2.5 border-r border-[#222] text-zinc-400">{s.date}</td>
                          <td className="px-5 py-2.5 border-r border-[#222] text-zinc-200 font-bold">{s.strokes}</td>
                          <td className="px-5 py-2.5 border-r border-[#222] text-emerald-400 font-semibold font-sans">{s.net}</td>
                          <td className="px-5 py-2.5 text-zinc-500">{s.diff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Round modal popup */}
              {showAddScoreModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-[#141414] border border-[#2e2e2e] rounded-xl max-w-[400px] w-full p-6 space-y-4 animate-scaleUp">
                    <h3 className="text-[16px] font-bold text-white">Log Golf Round</h3>
                    <p className="text-[12px] text-zinc-500">Insert a new row into database table public.scores</p>
                    
                    <form onSubmit={handleAddScoreSubmit} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11.5px] font-medium text-zinc-400">Course Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Augusta National"
                          value={newCourse}
                          onChange={(e) => setNewCourse(e.target.value)}
                          className="w-full h-9 px-3 bg-[#111] border border-[#2e2e2e] rounded text-[13px] text-white focus:outline-none focus:border-[#3ecf8e]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11.5px] font-medium text-zinc-400">Strokes Played</label>
                        <input
                          type="number"
                          required
                          min="30"
                          max="150"
                          placeholder="72"
                          value={newStrokes}
                          onChange={(e) => setNewStrokes(e.target.value)}
                          className="w-full h-9 px-3 bg-[#111] border border-[#2e2e2e] rounded text-[13px] text-white focus:outline-none focus:border-[#3ecf8e]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11.5px] font-medium text-zinc-400">Play Date</label>
                        <input
                          type="date"
                          required
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full h-9 px-3 bg-[#111] border border-[#2e2e2e] rounded text-[13px] text-white focus:outline-none focus:border-[#3ecf8e]"
                        />
                      </div>

                      <div className="flex gap-2.5 justify-end pt-3 text-[12.5px]">
                        <button
                          type="button"
                          onClick={() => setShowAddScoreModal(false)}
                          className="px-4 py-1.5 border border-[#2e2e2e] rounded text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#3ecf8e] text-black hover:bg-[#32b37a] font-bold rounded"
                        >
                          Insert Row
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: SQL EDITOR (Draws)                                    */}
          {/* ============================================================ */}
          {activeTab === "draws" && (
            <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-fadeInUp flex flex-col flex-1 h-full">
              
              <div className="flex justify-between items-center border-b border-[#222] pb-5 shrink-0">
                <div>
                  <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                    <Terminal size={18} className="text-[#3ecf8e]" />
                    SQL Editor: Prize Drawing Queries
                  </h1>
                  <p className="text-[12.5px] text-zinc-500 mt-1">Review active drawings, raffle entries, and rollovers using simulated raw queries.</p>
                </div>
              </div>

              {/* SQL Workspace Layout */}
              <div className="grid md:grid-cols-4 gap-4 flex-grow border border-[#222] rounded-lg overflow-hidden bg-[#141414] min-h-[380px] shadow-2xl">
                
                {/* Left query templates */}
                <div className="bg-[#111] border-r border-[#222] p-4 space-y-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold block">Saved Queries</span>
                  
                  <div className="space-y-1.5">
                    <button
                      onClick={() => { setSelectedQuery("select_draws"); setQueryResult(null); }}
                      className={`w-full text-left px-3 py-2 rounded text-[12px] font-mono transition-all truncate block ${
                        selectedQuery === "select_draws"
                          ? "bg-[#1d2c25] text-[#3ecf8e] border-l-2 border-[#3ecf8e]"
                          : "text-zinc-400 hover:text-white hover:bg-[#1a1a1f]"
                      }`}
                    >
                      SELECT * FROM draws;
                    </button>
                    <button
                      onClick={() => { setSelectedQuery("select_entries"); setQueryResult(null); }}
                      className={`w-full text-left px-3 py-2 rounded text-[12px] font-mono transition-all truncate block ${
                        selectedQuery === "select_entries"
                          ? "bg-[#1d2c25] text-[#3ecf8e] border-l-2 border-[#3ecf8e]"
                          : "text-zinc-400 hover:text-white hover:bg-[#1a1a1f]"
                      }`}
                    >
                      SELECT entries_by_user;
                    </button>
                  </div>
                </div>

                {/* Right Console editor */}
                <div className="md:col-span-3 flex flex-col p-5 space-y-4">
                  
                  {/* Console Header */}
                  <div className="flex justify-between items-center border-b border-[#2e2e33] pb-3.5">
                    <div className="text-[12px] font-mono text-zinc-400">
                      Query Console <span className="text-zinc-600">/</span> {selectedQuery === "select_draws" ? "active_draws.sql" : "user_draw_statistics.sql"}
                    </div>
                    <button
                      onClick={handleRunQuery}
                      disabled={queryRunning}
                      className="bg-[#3ecf8e] text-black hover:bg-[#32b37a] text-[11.5px] font-bold h-7 px-3 rounded flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Play size={10} fill="currentColor" />
                      {queryRunning ? "Executing..." : "Run Query"}
                    </button>
                  </div>

                  {/* SQL Syntax Highlighting Box */}
                  <div className="bg-[#111] border border-[#2e2e2e] rounded-lg p-4 font-mono text-[13px] text-[#3ecf8e] flex-grow select-text min-h-[120px]">
                    {selectedQuery === "select_draws" ? (
                      <div>
                        <span className="text-zinc-500">-- Fetch all active and simulated draws</span>
                        <br />
                        <span className="text-pink-500">SELECT</span> * <span className="text-pink-500">FROM</span> draws
                        <br />
                        <span className="text-pink-500">ORDER BY</span> year <span className="text-pink-500">DESC</span>, month <span className="text-pink-500">DESC</span>;
                      </div>
                    ) : (
                      <div>
                        <span className="text-zinc-500">-- Count draw entries grouped by user ID</span>
                        <br />
                        <span className="text-pink-500">SELECT</span> user_id, count(id) <span className="text-pink-500">as</span> total_entries, max(created_at) <span className="text-pink-500">as</span> last_played
                        <br />
                        <span className="text-pink-500">FROM</span> draw_entries
                        <br />
                        <span className="text-pink-500">GROUP BY</span> user_id
                        <br />
                        <span className="text-pink-500">LIMIT</span> <span className="text-blue-400">3</span>;
                      </div>
                    )}
                  </div>

                  {/* Results Pane */}
                  <div className="h-[180px] bg-[#111] border border-[#2e2e2e] rounded-lg p-3 overflow-y-auto flex flex-col font-mono text-[11.5px]">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold pb-2 border-b border-[#222] block shrink-0">
                      Query Results
                    </span>
                    
                    {queryRunning ? (
                      <div className="flex-grow flex items-center justify-center text-zinc-500">
                        <div className="w-4 h-4 rounded-full border border-[#3ecf8e] border-t-transparent animate-spin mr-2" />
                        Executing query plan...
                      </div>
                    ) : queryResult ? (
                      <table className="w-full text-left mt-2">
                        <thead>
                          <tr className="text-zinc-500 uppercase text-[10px] tracking-wider border-b border-[#222]">
                            {Object.keys(queryResult[0]).map((k) => (
                              <th key={k} className="py-1.5 px-2">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="text-zinc-300 divide-y divide-[#222]">
                          {queryResult.map((row, idx) => (
                            <tr key={idx} className="hover:bg-zinc-900/50">
                              {Object.values(row).map((v, i) => (
                                <td key={i} className="py-1.5 px-2">{v.toString()}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex-grow flex items-center justify-center text-zinc-600 italic">
                        Click &quot;Run Query&quot; to fetch relational database results
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: DATABASE EXPLORER (Charities)                         */}
          {/* ============================================================ */}
          {activeTab === "charities" && (
            <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-fadeInUp flex flex-col flex-1 h-full">
              
              <div className="flex justify-between items-center border-b border-[#222] pb-5 shrink-0">
                <div>
                  <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                    <Database size={18} className="text-[#3ecf8e]" />
                    Database Explorer: Schema tables
                  </h1>
                  <p className="text-[12.5px] text-zinc-500 mt-1">Explore relational schema, foreign key triggers, and rows inside public.charities.</p>
                </div>
              </div>

              {/* Schema layout */}
              <div className="grid md:grid-cols-4 gap-4 flex-grow border border-[#222] rounded-lg overflow-hidden bg-[#141414] min-h-[380px] shadow-2xl">
                
                {/* Left schema selection */}
                <div className="bg-[#111] border-r border-[#222] p-4 space-y-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold block">Tables</span>
                  
                  <div className="space-y-1">
                    {[
                      { name: "charities", count: "4 rows" },
                      { name: "profiles", count: "1 row" },
                      { name: "winners", count: "0 rows" },
                      { name: "subscriptions", count: "1 row" },
                      { name: "draw_entries", count: "3 rows" }
                    ].map((table) => (
                      <button
                        key={table.name}
                        onClick={() => setSelectedSchemaTable(table.name)}
                        className={`w-full flex justify-between items-center px-3 py-2 rounded text-[12.5px] transition-all font-medium ${
                          selectedSchemaTable === table.name
                            ? "bg-[#1d2c25] text-[#3ecf8e]"
                            : "text-zinc-400 hover:text-white hover:bg-[#1a1a1f]"
                        }`}
                      >
                        <span>{table.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{table.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Explorer detail */}
                <div className="md:col-span-3 p-5 flex flex-col space-y-5 overflow-y-auto">
                  
                  {/* Schema Columns list */}
                  <div className="space-y-2">
                    <h3 className="text-[13px] font-bold text-white font-mono uppercase tracking-wide">
                      Columns of public.{selectedSchemaTable}
                    </h3>
                    
                    <div className="bg-[#111] border border-[#2e2e2e] rounded-lg p-3 text-[12.5px] font-mono space-y-1.5 text-zinc-400">
                      {selectedSchemaTable === "charities" ? (
                        <>
                          <div className="flex justify-between border-b border-[#222] pb-1"><span className="text-white">id</span> <span className="text-[#3ecf8e]">uuid PRIMARY KEY</span></div>
                          <div className="flex justify-between border-b border-[#222] pb-1"><span className="text-white">name</span> <span className="text-[#3ecf8e]">text NOT NULL</span></div>
                          <div className="flex justify-between border-b border-[#222] pb-1"><span className="text-white">description</span> <span className="text-[#3ecf8e]">text</span></div>
                          <div className="flex justify-between border-b border-[#222] pb-1"><span className="text-white">is_featured</span> <span className="text-[#3ecf8e]">boolean DEFAULT false</span></div>
                          <div className="flex justify-between"><span className="text-white">created_at</span> <span className="text-[#3ecf8e]">timestamp with time zone</span></div>
                        </>
                      ) : selectedSchemaTable === "profiles" ? (
                        <>
                          <div className="flex justify-between border-b border-[#222] pb-1"><span className="text-white">id</span> <span className="text-[#3ecf8e]">uuid PRIMARY KEY (FK auth.users)</span></div>
                          <div className="flex justify-between border-b border-[#222] pb-1"><span className="text-white">role</span> <span className="text-[#3ecf8e]">user_role DEFAULT &apos;visitor&apos;</span></div>
                          <div className="flex justify-between border-b border-[#222] pb-1"><span className="text-white">full_name</span> <span className="text-[#3ecf8e]">text</span></div>
                          <div className="flex justify-between"><span className="text-white">charity_contribution_percentage</span> <span className="text-[#3ecf8e]">numeric DEFAULT 10.00</span></div>
                        </>
                      ) : (
                        <div className="text-zinc-500 italic text-center py-2">Schema view details loaded successfully</div>
                      )}
                    </div>
                  </div>

                  {/* Schema table contents */}
                  {selectedSchemaTable === "charities" && (
                    <div className="space-y-2">
                      <h3 className="text-[13px] font-bold text-white font-mono uppercase tracking-wide">
                        Table rows
                      </h3>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { name: "Golf for Good", cat: "Youth Sports", desc: "Providing golf kits and coaching to underprivileged children.", raised: "£12,400" },
                          { name: "British Red Cross", cat: "Humanitarian", desc: "Providing emergency relief support during global crises.", raised: "£8,200" },
                          { name: "Ocean Cleanup", cat: "Environment", desc: "Developing advanced systems to clean global ocean plastic.", raised: "£6,500" },
                          { name: "Mental Health UK", cat: "Wellbeing Support", desc: "Delivering crucial advisory services and mental health support.", raised: "£9,100" }
                        ].map((charity, i) => (
                          <div key={i} className="bg-[#111] border border-[#2e2e2e] rounded-lg p-4 flex flex-col justify-between min-h-[130px]">
                            <div>
                              <h4 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                                <Heart size={12} className="text-rose-500 fill-rose-500" />
                                {charity.name}
                              </h4>
                              <p className="text-[11.5px] text-zinc-500 mt-1 leading-relaxed">{charity.desc}</p>
                            </div>
                            <div className="flex justify-between items-center text-[11px] pt-2.5 border-t border-[#222] mt-3">
                              <span className="text-zinc-600">Total Contributions:</span>
                              <span className="font-bold text-[#3ecf8e]">{charity.raised}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSchemaTable !== "charities" && (
                    <div className="border border-dashed border-[#222] rounded-lg p-8 flex items-center justify-center text-zinc-500 text-[12px] italic">
                      Rows are active and managed via Supabase auth triggers.
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: STORAGE BROWSER (Pricing)                             */}
          {/* ============================================================ */}
          {activeTab === "pricing" && (
            <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-fadeInUp flex flex-col flex-1 h-full">
              
              <div className="flex justify-between items-center border-b border-[#222] pb-5 shrink-0">
                <div>
                  <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                    <FolderOpen size={18} className="text-[#3ecf8e]" />
                    Storage Browser: Buckets
                  </h1>
                  <p className="text-[12.5px] text-zinc-500 mt-1">Manage static subscription plan payloads and config files in bucket pricing-tiers.</p>
                </div>
              </div>

              {/* Storage Workspace */}
              <div className="grid md:grid-cols-4 gap-4 flex-grow border border-[#222] rounded-lg overflow-hidden bg-[#141414] min-h-[380px] shadow-2xl">
                
                {/* Left Buckets list */}
                <div className="bg-[#111] border-r border-[#222] p-4 space-y-4">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold block">Storage Buckets</span>
                  
                  <div className="space-y-1">
                    {[
                      { name: "pricing-tiers", size: "2 files" },
                      { name: "user-avatars", size: "0 files" },
                      { name: "proof-images", size: "0 files" }
                    ].map((bucket) => (
                      <button
                        key={bucket.name}
                        className="w-full flex justify-between items-center px-3 py-2 rounded bg-[#1d2c25] text-[#3ecf8e] text-[12.5px] transition-all font-medium"
                      >
                        <span>{bucket.name}</span>
                        <span className="text-[10.5px] text-zinc-500 font-mono">{bucket.size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Folder payload details */}
                <div className="md:col-span-3 p-5 flex flex-col space-y-4">
                  
                  <div className="flex justify-between items-center border-b border-[#222] pb-3 shrink-0">
                    <span className="text-[12.5px] font-mono text-zinc-400">pricing-tiers / *</span>
                  </div>

                  {/* List files in bucket */}
                  <div className="grid sm:grid-cols-2 gap-4 flex-grow">
                    
                    {/* File 1: free-visitor.json */}
                    <div 
                      onClick={() => setSelectedBucketFile("free")}
                      className={`border rounded-lg p-5 flex flex-col justify-between min-h-[180px] cursor-pointer transition-all ${
                        selectedBucketFile === "free" 
                          ? "bg-[#111] border-[#3ecf8e] shadow-[0_0_20px_rgba(62,207,142,0.05)]" 
                          : "bg-[#111] border-[#222] hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] bg-zinc-900 border border-[#2e2e2e] text-zinc-400 px-2 py-0.5 rounded font-mono">JSON</span>
                          <span className="text-[28px] font-black text-white leading-none">£0</span>
                        </div>
                        <h4 className="text-[14.5px] font-bold text-white mt-3.5">free-visitor.json</h4>
                        <p className="text-[12px] text-zinc-500 mt-1 leading-normal">
                          Read public updates, follow raffle summaries, and view global handicaps.
                        </p>
                      </div>
                      
                      <div className="text-[10.5px] text-zinc-500 border-t border-zinc-900 pt-2.5 mt-4">
                        Size: 1.2 KB | Updated: 2026-06-20
                      </div>
                    </div>

                    {/* File 2: pro-subscriber.json */}
                    <div 
                      onClick={() => setSelectedBucketFile("pro")}
                      className={`border rounded-lg p-5 flex flex-col justify-between min-h-[180px] cursor-pointer transition-all ${
                        selectedBucketFile === "pro" 
                          ? "bg-[#111] border-[#3ecf8e] shadow-[0_0_20px_rgba(62,207,142,0.05)]" 
                          : "bg-[#111] border-[#222] hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] bg-zinc-900 border border-[#2e2e2e] text-[#3ecf8e] px-2 py-0.5 rounded font-mono">JSON</span>
                          <span className="text-[28px] font-black text-white leading-none">£12</span>
                        </div>
                        <h4 className="text-[14.5px] font-bold text-white mt-3.5">pro-subscriber.json</h4>
                        <p className="text-[12px] text-zinc-500 mt-1 leading-normal">
                          Unlimited score index logging, monthly prize drawings, and 10%+ charity donations.
                        </p>
                      </div>

                      <div className="text-[10.5px] text-[#3ecf8e] font-semibold border-t border-zinc-900 pt-2.5 mt-4 flex justify-between">
                        <span>Size: 1.8 KB | Updated: 2026-06-20</span>
                        <span>[ACTIVE]</span>
                      </div>
                    </div>

                  </div>

                  {/* JSON payload preview */}
                  {selectedBucketFile && (
                    <div className="bg-[#111] border border-[#2e2e2e] rounded-lg p-4 font-mono text-[11.5px] text-zinc-400 select-text shrink-0">
                      <span className="text-zinc-600">{"// File Metadata view: "}{selectedBucketFile}-tier.json</span>
                      <pre className="mt-1.5 text-zinc-300">
                        {selectedBucketFile === "free" ? (
                          JSON.stringify({
                            tier: "free-visitor",
                            price: 0,
                            features: ["read-blogs", "view-leaderboards", "draw-summaries"],
                            active_connections: "0/1"
                          }, null, 2)
                        ) : (
                          JSON.stringify({
                            tier: "pro-subscriber",
                            price: 12,
                            features: ["unlimited-logging", "handicap-calculations", "monthly-draws", "charity-donations"],
                            charity_cut: "10%+",
                            active_connections: "1/1"
                          }, null, 2)
                        )}
                      </pre>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: PROJECT SETTINGS                                      */}
          {/* ============================================================ */}
          {activeTab === "settings" && (
            <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-fadeInUp">
              
              <div className="border-b border-[#222] pb-5">
                <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-2">
                  <Settings size={18} className="text-[#3ecf8e]" />
                  Project Settings
                </h1>
                <p className="text-[12.5px] text-zinc-500 mt-1">Configure project metadata, security variables, and API keys.</p>
              </div>

              {/* Form Settings */}
              <div className="bg-[#141414] border border-[#222] rounded-xl p-6 max-w-[600px] space-y-6 shadow-2xl">
                
                <div className="space-y-4">
                  <h3 className="text-[14px] font-bold text-white border-b border-[#222] pb-2">General Metadata</h3>
                  
                  {saveSuccess && (
                    <div className="bg-[#1d2c25] border border-[#3ecf8e]/30 text-[#3ecf8e] text-[12px] p-2.5 rounded font-medium">
                      Project settings updated successfully.
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[11.5px] font-medium text-zinc-400">Project Name</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full h-9 px-3 bg-[#111] border border-[#2e2e2e] rounded text-[13px] text-white focus:outline-none focus:border-[#3ecf8e]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11.5px] font-medium text-zinc-400">Database Role</label>
                    <input
                      type="text"
                      disabled
                      value={profile?.role || "subscriber"}
                      className="w-full h-9 px-3 bg-[#1c1c1f] border border-[#2e2e2e] rounded text-[13px] text-zinc-500 cursor-not-allowed capitalize"
                    />
                  </div>
                </div>

                {/* Subscription Billing */}
                <div className="space-y-4 pt-4 border-t border-[#222]">
                  <h3 className="text-[14px] font-bold text-white pb-1 flex items-center gap-1.5">
                    <CreditCard size={13} className="text-indigo-400" />
                    Subscription Billing
                  </h3>
                  
                  {subscription?.status === "active" ? (
                    <div className="space-y-3">
                      <div className="bg-[#1c2c25] border border-[#3ecf8e]/20 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#3ecf8e] animate-pulse" />
                            <h4 className="text-[13.5px] font-bold text-white capitalize">Active Pro Plan ({subscription?.plan_type})</h4>
                          </div>
                          <p className="text-[11.5px] text-zinc-400 mt-1">
                            Your billing cycle renews on <span className="font-semibold text-zinc-200">{subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}</span>.
                          </p>
                        </div>
                        <span className="text-[10px] bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                          Active
                        </span>
                      </div>
                      <p className="text-[12.5px] text-zinc-400">
                        Manage your subscription plan, view invoices, or cancel/update billing via the Stripe Customer Portal.
                      </p>
                      <a
                        href="/api/portal"
                        className="inline-flex items-center justify-center gap-1.5 bg-[#222] hover:bg-[#2d2d33] border border-[#2e2e2e] text-zinc-200 text-[12px] font-bold px-4 h-9 rounded transition-all"
                      >
                        Manage Billing & Invoices
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-indigo-950/20 border border-indigo-500/25 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <h4 className="text-[13.5px] font-bold text-white">Free Visitor Tier</h4>
                          </div>
                          <p className="text-[11.5px] text-zinc-400 mt-1">
                            Upgrade to Pro to unlock WHS handicap indexes, monthly drawing tickets, and active charity donations.
                          </p>
                        </div>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                          Inactive
                        </span>
                      </div>
                      <p className="text-[12.5px] text-zinc-400">
                        Select a monthly or discounted yearly pricing plan to upgrade your CauseLoop workspace.
                      </p>
                      <Link
                        href="/subscribe"
                        className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold px-4 h-9 rounded transition-all shadow-[0_4px_15px_rgba(79,70,229,0.2)]"
                      >
                        Upgrade to Pro
                        <Sparkles size={11} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* API Credentials */}
                <div className="space-y-4 pt-4 border-t border-[#222]">
                  <h3 className="text-[14px] font-bold text-white pb-1 flex items-center gap-1.5">
                    <Lock size={13} className="text-amber-500" />
                    API Credentials
                  </h3>
                  
                  {/* Anon Key */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11.5px] font-medium text-zinc-400">Project API anon Key (public)</label>
                      <button 
                        onClick={() => setShowAnonKey(!showAnonKey)}
                        className="text-[11px] text-zinc-500 hover:text-white"
                      >
                        {showAnonKey ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type={showAnonKey ? "text" : "password"}
                        readOnly
                        value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2hhbmZ5YWpkaXZtdXVtbXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg3MDc2MDAsImV4cCI6MjAzNDI4MzYwMH0"
                        className="w-full h-9 px-3 bg-[#111] border border-[#2e2e2e] rounded text-[11px] text-zinc-400 font-mono select-all focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyLink("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2hhbmZ5YWpkaXZtdXVtbXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg3MDc2MDAsImV4cCI6MjAzNDI4MzYwMH0")}
                        className="bg-[#1e1e1e] hover:bg-[#252528] border border-[#2e2e2e] text-white px-3 rounded flex items-center justify-center shrink-0 transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Service Role Key */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11.5px] font-medium text-zinc-400">Project service_role Key (secret)</label>
                      <button 
                        onClick={() => setShowServiceKey(!showServiceKey)}
                        className="text-[11px] text-zinc-500 hover:text-white"
                      >
                        {showServiceKey ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type={showServiceKey ? "text" : "password"}
                        readOnly
                        value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2hhbmZ5YWpkaXZtdXVtbXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODcwNzYwMCwiZXhwIjoyMDM0MjgzNjAwfQ"
                        className="w-full h-9 px-3 bg-[#111] border border-[#2e2e2e] rounded text-[11px] text-[#ff6b6b] font-mono select-all focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyLink("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2hhbmZ5YWpkaXZtdXVtbXNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODcwNzYwMCwiZXhwIjoyMDM0MjgzNjAwfQ")}
                        className="bg-[#1e1e1e] hover:bg-[#252528] border border-[#2e2e2e] text-white px-3 rounded flex items-center justify-center shrink-0 transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-[#222] text-[12.5px]">
                  <button
                    onClick={() => {
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2000);
                    }}
                    className="bg-[#3ecf8e] hover:bg-[#32b37a] text-black font-bold h-8 px-4 rounded transition-all"
                  >
                    Save Changes
                  </button>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* Subscription Verifying Overlay */}
      {verifyingSubscription && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-indigo-500/30 rounded-2xl max-w-[440px] w-full p-8 text-center space-y-6 shadow-[0_0_50px_rgba(82,39,255,0.15)] animate-fadeInUp">
            
            {/* Spinning logo/glow */}
            <div className="relative mx-auto w-16 h-16 bg-indigo-600/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center text-indigo-400">
              <div className="absolute inset-0 rounded-2xl border border-dashed border-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
              <svg width={28} height={28} viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="confirm-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5227FF" />
                    <stop offset="100%" stopColor="#8644FF" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#confirm-logo-grad)"
                  fillRule="evenodd"
                  d="M12 30.99V36L-.01 23.99l2.516-2.499zM17.01 36H12l12.011 12.01 2.506-2.505zm28.487-9.497L48 24 24 0l-2.503 2.503L30.98 12h-5.732l-6.62-6.614-2.506 2.503 4.122 4.122h-2.869v18.625H36V27.77l4.122 4.122 2.503-2.506L36 22.747v-5.732zM13.253 10.747l-2.503 2.506 2.686 2.686 2.503-2.506zm21.314 21.314-2.495 2.503 2.686 2.686 2.506-2.503zM7.878 16.121l-2.503 2.504L12 25.253v-5.012zM27.756 36h-5.009l6.628 6.625 2.503-2.503z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-[18px] font-bold text-white tracking-tight">Confirming Subscription</h3>
              <p className="text-[13px] text-zinc-400 max-w-[320px] mx-auto leading-relaxed">
                We are securing your membership with Stripe. This takes just a moment to verify...
              </p>
            </div>

            {/* Spinner and Status Indicator */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Awaiting Stripe Webhook</span>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#3ecf8e]/35 rounded-2xl max-w-[440px] w-full p-8 text-center space-y-6 shadow-[0_0_50px_rgba(62,207,142,0.15)] animate-fadeInUp">
            
            <div className="mx-auto w-16 h-16 bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 rounded-full flex items-center justify-center text-[#3ecf8e]">
              <Check size={32} strokeWidth={3} className="animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-[20px] font-bold text-white tracking-tight">Welcome to CauseLoop Pro!</h3>
              <p className="text-[13px] text-zinc-400 max-w-[320px] mx-auto leading-relaxed">
                Thank you for subscribing! Your account has been upgraded to Pro. You now have full access to CauseLoop Studio.
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-2.5 rounded-xl text-[13.5px] transition-all shadow-[0_4px_20px_rgba(255,255,255,0.08)]"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Subscription Pending Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-amber-500/30 rounded-2xl max-w-[440px] w-full p-8 text-center space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-fadeInUp">
            
            <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
              <HelpCircle size={32} strokeWidth={2} />
            </div>

            <div className="space-y-2">
              <h3 className="text-[18px] font-bold text-white tracking-tight">Payment Confirmation Pending</h3>
              <p className="text-[13px] text-zinc-400 max-w-[320px] mx-auto leading-relaxed">
                Stripe is taking a bit longer than usual to confirm your payment. Your account will automatically activate as soon as it completes.
              </p>
            </div>

            <button
              onClick={() => setShowPendingModal(false)}
              className="w-full bg-[#222] border border-[#2e2e2e] text-zinc-200 hover:bg-[#2d2d33] font-bold py-2.5 rounded-xl text-[13.5px] transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
