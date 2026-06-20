"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Heart, DollarSign, ArrowUpRight, HelpCircle, CheckCircle2, ChevronLeft, Calendar, MapPin, Loader2, Image } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CharityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const charityId = params.id;

  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Donation form state
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState("25");
  const [donationEmail, setDonationEmail] = useState("");
  const [donatingLoading, setDonatingLoading] = useState(false);
  const [donationError, setDonationError] = useState("");

  useEffect(() => {
    if (!charityId) return;

    const loadCharity = async () => {
      try {
        const res = await fetch(`/api/charities?id=${charityId}`);
        if (res.ok) {
          const data = await res.json();
          setCharity(data.charity || null);
        }
      } catch (err) {
        console.error("Error loading charity details:", err);
      }
      setLoading(false);
    };

    loadCharity();
  }, [charityId]);

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
          charityId: charity.id,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#8644FF] animate-spin" />
          <p className="text-[13px] text-zinc-400">Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center text-white font-sans text-center">
        <div className="space-y-4">
          <h2 className="text-[20px] font-bold">Charity Partner Not Found</h2>
          <p className="text-[13px] text-zinc-400">The charity profile requested does not exist or has been removed.</p>
          <Link href="/charities" className="inline-flex items-center gap-1 text-[#8644FF] hover:underline font-bold">
            <ChevronLeft size={14} /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const images = charity.image_urls || [];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-200 font-sans relative overflow-x-hidden">
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#8644FF]/5 rounded-full blur-[120px] pointer-events-none" />

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

      {/* Main Details content */}
      <main className="max-w-[1000px] mx-auto px-6 py-12 md:py-16 space-y-10">
        
        {/* Back Link */}
        <Link href="/charities" className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-zinc-500 hover:text-white transition-colors">
          <ChevronLeft size={15} /> Back to Partners Directory
        </Link>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          
          {/* Left image gallery & spotlight */}
          <div className="md:col-span-2 space-y-4">
            
            <div className="aspect-square bg-[#0e0e12] border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative">
              {images.length > 0 ? (
                <img 
                  src={images[activeImageIdx]} 
                  alt={charity.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-rose-500">
                  <Heart size={48} className="animate-pulse" />
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIdx === i ? "border-[#8644FF]" : "border-zinc-900 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
          </div>

          {/* Right Description profile */}
          <div className="md:col-span-3 space-y-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8644FF] font-black uppercase tracking-widest bg-[#8644FF]/10 border border-[#8644FF]/25 px-3 py-1 rounded-full">
                  Verified partner
                </span>
                {charity.is_featured && (
                  <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/25 px-3 py-1 rounded-full">
                    Featured Cause
                  </span>
                )}
              </div>
              <h1 className="text-[28px] md:text-[36px] font-black tracking-tight text-white leading-tight">{charity.name}</h1>
            </div>

            <div className="space-y-4">
              <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">Mission Statement</h3>
              <p className="text-[13.5px] text-zinc-400 leading-relaxed font-medium whitespace-pre-line">{charity.description}</p>
            </div>

            {/* Upcoming Events formatted list */}
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <h3 className="text-[14px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar size={15} className="text-[#8644FF]" />
                Upcoming Campaigns & Golf Days
              </h3>

              {charity.upcoming_events && charity.upcoming_events.length > 0 ? (
                <div className="grid gap-3">
                  {charity.upcoming_events.map((ev, i) => (
                    <div key={i} className="bg-[#0e0e12] border border-zinc-900 p-4.5 rounded-2xl flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center font-mono text-[#8644FF] shrink-0">
                        <span className="text-[11px] font-black leading-none">{ev.date.split("-")[2]}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">{new Date(ev.date).toLocaleString('en', {month: 'short'})}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[13px] font-bold text-white leading-snug">{ev.name}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {ev.date}</span>
                          <span className="flex items-center gap-1"><MapPin size={10} /> {ev.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-zinc-500 italic">No upcoming events scheduled at this moment.</p>
              )}
            </div>

            {/* Direct Donation CTA */}
            <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-[11px] text-zinc-500">Global Donations Impact</p>
                <p className="text-[14px] font-extrabold text-white">Total raised: <span className="text-emerald-400">£1,420</span></p>
              </div>

              <button
                onClick={() => setShowDonateModal(true)}
                className="h-10 px-6 bg-[#8644FF] hover:bg-[#7232e0] text-white text-[13px] font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-lg w-full sm:w-auto"
              >
                <DollarSign size={15} />
                Make direct one-off donation
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* One-off Donation Popover Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e12] border border-zinc-900 rounded-3xl max-w-[420px] w-full p-6.5 space-y-5 animate-scaleUp">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block">One-off Donation</span>
                <h3 className="text-[16.5px] font-black text-white mt-1">Support {charity.name}</h3>
                <p className="text-[12px] text-zinc-500">100% of this contribution is processed directly to the cause.</p>
              </div>
              <button 
                onClick={() => {
                  setShowDonateModal(false);
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
                  onClick={() => setShowDonateModal(false)}
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
