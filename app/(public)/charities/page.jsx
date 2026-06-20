"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Search, DollarSign, ArrowUpRight, HelpCircle, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function CharitiesDirectoryInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // One-off donation modal state
  const [donatingCharity, setDonatingCharity] = useState(null);
  const [donationAmount, setDonationAmount] = useState("25");
  const [donationEmail, setDonationEmail] = useState("");
  const [donatingLoading, setDonatingLoading] = useState(false);
  const [donationError, setDonationError] = useState("");

  // Donation success states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successCharityName, setSuccessCharityName] = useState("");
  const [successAmount, setSuccessAmount] = useState("");

  useEffect(() => {
    // Check if redirect query has donation success
    const donation = searchParams.get("donation");
    const charity = searchParams.get("charity");
    const amount = searchParams.get("amount");

    if (donation === "success" && charity && amount) {
      setSuccessCharityName(charity);
      setSuccessAmount(amount);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
      
      // Clean query params
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    const loadCharities = async () => {
      try {
        const res = await fetch("/api/charities");
        if (res.ok) {
          const data = await res.json();
          setCharities(data.charities || []);
        }
      } catch (err) {
        console.error("Error loading charities:", err);
      }
      setLoading(false);
    };

    loadCharities();
  }, [searchParams]);

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setDonationError("");

    const amt = parseFloat(donationAmount);
    if (isNaN(amt) || amt <= 1) {
      setDonationError("Please enter a donation amount greater than £1.");
      return;
    }

    setDonatingLoading(true);

    try {
      const res = await fetch("/api/checkout/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charityId: donatingCharity.id,
          amount: amt,
          email: donationEmail || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setDonationError(data.error || "Failed to start donation session.");
        setDonatingLoading(false);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      setDonationError("Server connection failed.");
      setDonatingLoading(false);
    }
  };

  const getCategoryFromCharityName = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("green") || lower.includes("ocean")) return "Environment";
    if (lower.includes("red") || lower.includes("scramble")) return "Humanitarian";
    if (lower.includes("mental") || lower.includes("wellbeing")) return "Wellbeing";
    return "Youth Sports";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#8644FF] animate-spin" />
          <p className="text-[13px] text-zinc-400">Loading CauseLoop Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-200 font-sans relative overflow-x-hidden">
      
      {/* Background radial glowing effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#8644FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 px-5 py-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl shadow-[0_10px_35px_rgba(16,185,129,0.15)] flex items-center gap-3.5 z-50 animate-fadeInUp">
          <CheckCircle2 className="text-emerald-400 w-5 h-5 shrink-0" />
          <div>
            <h4 className="text-[13.5px] font-bold text-white">Thank you for your support!</h4>
            <p className="text-[12px] text-emerald-400/80 mt-0.5">Donation of £{successAmount} to {successCharityName} was successful.</p>
          </div>
        </div>
      )}

      {/* Header bar */}
      <nav className="h-[64px] bg-[#0c0c0e]/80 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-40 flex items-center px-6 md:px-12 justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width={22} height={22} viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="nav-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5227FF" />
                <stop offset="100%" stopColor="#8644FF" />
              </linearGradient>
            </defs>
            <path
              fill="url(#nav-logo-grad)"
              fillRule="evenodd"
              d="M12 30.99V36L-.01 23.99l2.516-2.499zM17.01 36H12l12.011 12.01 2.506-2.505zm28.487-9.497L48 24 24 0l-2.503 2.503L30.98 12h-5.732l-6.62-6.614-2.506 2.503 4.122 4.122h-2.869v18.625H36V27.77l4.122 4.122 2.503-2.506L36 22.747v-5.732zM13.253 10.747l-2.503 2.506 2.686 2.686 2.503-2.506zm21.314 21.314-2.495 2.503 2.686 2.686 2.506-2.503zM7.878 16.121l-2.503 2.504L12 25.253v-5.012zM27.756 36h-5.009l6.628 6.625 2.503-2.503z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-extrabold text-[15.5px] text-white tracking-wide">CauseLoop</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/charities" className="text-[12.5px] font-bold text-white border-b-2 border-[#8644FF] pb-1">Charities</Link>
          <Link href="/subscribe" className="text-[12.5px] font-medium text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          <Link href="/dashboard" className="h-8.5 px-4 bg-[#8644FF] hover:bg-[#7232e0] text-white text-[12px] font-bold rounded-xl flex items-center justify-center transition-all shadow-md">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Directory Title / Search layout */}
      <header className="max-w-[1000px] mx-auto px-6 pt-12 md:pt-16 pb-8 space-y-6 text-center">
        <div className="space-y-2">
          <span className="text-[11px] text-[#8644FF] font-black uppercase tracking-widest bg-[#8644FF]/10 border border-[#8644FF]/25 px-3 py-1 rounded-full">
            Directory partners
          </span>
          <h1 className="text-[32px] md:text-[42px] font-black tracking-tight text-white leading-none pt-2">
            Support Verified Charities
          </h1>
          <p className="text-[14px] text-zinc-400 max-w-[500px] mx-auto leading-relaxed pt-1">
            Choose a partner organization to support. Set your contribution slice or make direct one-off donations without subscription ties.
          </p>
        </div>

        {/* Directory Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0e0e12] border border-zinc-900 rounded-2xl p-4 max-w-2xl mx-auto shadow-2xl">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search directory causes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-zinc-950 border border-zinc-900 focus:border-[#8644FF] rounded-xl text-[13px] text-white focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {["All", "Featured", "Environment", "Humanitarian", "Wellbeing"].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedFilter(tag)}
                className={`px-3 py-1 rounded-full text-[11.5px] font-bold transition-all border ${
                  selectedFilter === tag
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-500"
                    : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Directory Grid */}
      <section className="max-w-[1000px] mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {charities
            .filter((c) => {
              const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    c.description.toLowerCase().includes(searchQuery.toLowerCase());
              const cat = getCategoryFromCharityName(c.name);
              const matchesFilter = selectedFilter === "All" ||
                                    (selectedFilter === "Featured" && c.is_featured) ||
                                    (selectedFilter === "Environment" && cat === "Environment") ||
                                    (selectedFilter === "Humanitarian" && cat === "Humanitarian") ||
                                    (selectedFilter === "Wellbeing" && cat === "Wellbeing");
              return matchesSearch && matchesFilter;
            })
            .map((c) => {
              const cat = getCategoryFromCharityName(c.name);
              return (
                <div key={c.id} className="bg-[#0e0e12] border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-800 transition-all shadow-xl group">
                  
                  <div className="space-y-4">
                    {/* Image Header */}
                    <div className="flex items-start gap-4">
                      {c.image_urls && c.image_urls.length > 0 ? (
                        <img 
                          src={c.image_urls[0]} 
                          alt={c.name} 
                          className="w-16 h-16 rounded-2xl object-cover border border-zinc-900 shadow-md shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-rose-500 shrink-0">
                          <Heart size={26} />
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-[16px] font-black text-white leading-snug">{c.name}</h3>
                          {c.is_featured && (
                            <span className="text-[8.5px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wide">
                              Spotlight
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">{cat}</span>
                      </div>
                    </div>

                    <p className="text-[12.5px] text-zinc-400 leading-relaxed font-medium">
                      {c.description.length > 140 ? `${c.description.substring(0, 140)}...` : c.description}
                    </p>
                  </div>

                  <div className="pt-5 border-t border-zinc-900 mt-6 flex items-center justify-between">
                    <Link 
                      href={`/charities/${c.id}`}
                      className="text-[12px] font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      View Profile <ChevronRight size={14} />
                    </Link>

                    <button
                      onClick={() => setDonatingCharity(c)}
                      className="h-8.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-[12px] font-bold rounded-xl flex items-center gap-1 transition-all"
                    >
                      <DollarSign size={13} className="text-emerald-400" />
                      One-off Donate
                    </button>
                  </div>

                </div>
              );
            })}
        </div>
      </section>

      {/* One-off Donation Popover Modal */}
      {donatingCharity && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e12] border border-zinc-900 rounded-3xl max-w-[420px] w-full p-6.5 space-y-5 animate-scaleUp">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">One-off Donation</span>
                <h3 className="text-[16.5px] font-black text-white mt-1">Support {donatingCharity.name}</h3>
                <p className="text-[12px] text-zinc-500">100% of this contribution is processed directly to the cause.</p>
              </div>
              <button 
                onClick={() => {
                  setDonatingCharity(null);
                  setDonationError("");
                }}
                className="text-zinc-500 hover:text-white text-[20px] font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {donationError && (
              <p className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[12px] leading-relaxed text-center font-medium">
                {donationError}
              </p>
            )}

            <form onSubmit={handleDonateSubmit} className="space-y-4 text-[12.5px]">
              
              {/* Stepped Numeric Input / Quick presets */}
              <div className="space-y-2">
                <label className="font-bold text-zinc-400 block">Select Donation Amount (GBP)</label>
                
                <div className="grid grid-cols-4 gap-2">
                  {["10", "25", "50", "100"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDonationAmount(preset)}
                      className={`h-8.5 rounded-xl border text-[12px] font-extrabold transition-all ${
                        donationAmount === preset
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      £{preset}
                    </button>
                  ))}
                </div>

                <div className="relative mt-2">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="number"
                    min="2"
                    required
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Custom amount (e.g. 75)"
                    className="w-full h-10 pl-9 pr-4 bg-zinc-950 border border-zinc-900 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Guest email (optional) */}
              <div className="space-y-1.5">
                <label className="font-medium text-zinc-400 block">Email Address (For Receipt)</label>
                <input
                  type="email"
                  value={donationEmail}
                  onChange={(e) => setDonationEmail(e.target.value)}
                  placeholder="donor@example.com (optional)"
                  className="w-full h-10 px-3.5 bg-zinc-950 border border-zinc-900 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setDonatingCharity(null)}
                  className="px-4 py-2 border border-zinc-900 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={donatingLoading}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg disabled:opacity-50"
                >
                  {donatingLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      Checkout Donation (£{donationAmount})
                      <ArrowUpRight size={13} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default function PublicCharitiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070709] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#8644FF] animate-spin" />
          <p className="text-[13px] text-zinc-400">Loading CauseLoop Directory...</p>
        </div>
      </div>
    }>
      <CharitiesDirectoryInner />
    </Suspense>
  );
}
