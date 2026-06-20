"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Sparkles, Trophy, Heart, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const Silk = dynamic(() => import("@/components/ui/silk"), { ssr: false });

export default function SubscribePage() {
  const [yearly, setYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
    });
  }, []);

  const handleSubscribe = (plan) => {
    setLoadingPlan(plan);
    // Redirect to Checkout API GET route directly
    window.location.href = `/api/checkout?plan=${plan}`;
  };

  const PRO_FEATURES = [
    "Unlimited golf scorecard logging",
    "Real-time WHS handicap index calculations",
    "Monthly raffle draw ticket entries",
    "10%+ automated charity contributions",
    "Access to rollover jackpot prize pools",
    "Sleek developer studio project tabs"
  ];

  return (
    <div className="min-h-screen bg-[#030308] text-[#e4e4e7] flex flex-col font-sans select-none overflow-y-auto relative py-12 px-6">
      
      {/* Silk background shader background */}
      <Silk
        speed={3}
        scale={1.2}
        color="#6366f1"
        noiseIntensity={1.4}
        rotation={30}
        className="opacity-25 pointer-events-none absolute inset-0 z-0"
      />

      {/* Radial vignette and ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle 800px at 50% 50%, rgba(99, 102, 241, 0.08), transparent 80%), radial-gradient(ellipse 90% 80% at 50% 50%, transparent 20%, rgba(3, 3, 8, 0.6) 70%, #030308 100%)",
        }}
      />

      {/* Top Brand & Navigation */}
      <div className="max-w-[1000px] w-full mx-auto flex items-center justify-between mb-12 shrink-0 relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5227FF] to-[#8644FF] flex items-center justify-center shadow-[0_4px_20px_rgba(82,39,255,0.3)] group-hover:scale-105 transition-all">
            <svg width={16} height={16} viewBox="0 0 48 48" fill="none">
              <path
                fill="#ffffff"
                fillRule="evenodd"
                d="M12 30.99V36L-.01 23.99l2.516-2.499zM17.01 36H12l12.011 12.01 2.506-2.505zm28.487-9.497L48 24 24 0l-2.503 2.503L30.98 12h-5.732l-6.62-6.614-2.506 2.503 4.122 4.122h-2.869v18.625H36V27.77l4.122 4.122 2.503-2.506L36 22.747v-5.732zM13.253 10.747l-2.503 2.506 2.686 2.686 2.503-2.506zm21.314 21.314-2.495 2.503 2.686 2.686 2.506-2.503zM7.878 16.121l-2.503 2.504L12 25.253v-5.012zM27.756 36h-5.009l6.628 6.625 2.503-2.503z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-[16px] font-bold text-white tracking-wide group-hover:text-zinc-200 transition-colors">CauseLoop</span>
        </Link>
        
        <Link 
          href="/" 
          className="text-[12.5px] text-zinc-400 hover:text-white transition-all flex items-center gap-2 font-medium bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.05] rounded-xl px-4 py-2 backdrop-blur-md"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
      </div>

      {/* Main pricing comparison card view */}
      <div className="max-w-[1000px] w-full mx-auto space-y-10 flex-1 flex flex-col justify-center py-4 relative z-10">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
            <Sparkles size={11} className="animate-pulse" />
            <span className="text-[9.5px] font-extrabold uppercase tracking-widest">
              CauseLoop Pro
            </span>
          </div>
          
          <h1 className="text-[36px] md:text-[46px] font-black text-white tracking-tight leading-tight pt-1">
            Choose your billing plan
          </h1>
          <p className="text-[14.5px] text-zinc-400 max-w-[500px] mx-auto leading-relaxed">
            Gain full access to the CauseLoop WHS handicap engine, monthly draws, and support great charities with your active subscription.
          </p>

          {/* Monthly/Yearly toggle switcher */}
          <div className="inline-flex items-center gap-1 mt-6 border border-white/[0.08] rounded-xl p-1.5 bg-white/[0.02] backdrop-blur-md">
            <button
              onClick={() => setYearly(false)}
              className={`px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-300 ${
                !yearly 
                  ? "bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.15)] scale-100" 
                  : "text-zinc-400 hover:text-white scale-98"
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-300 flex items-center gap-1.5 ${
                yearly 
                  ? "bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.15)] scale-100" 
                  : "text-zinc-400 hover:text-white scale-98"
              }`}
            >
              Yearly billing
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wide transition-colors ${
                yearly ? "bg-indigo-600 text-white" : "bg-indigo-500/20 text-indigo-400"
              }`}>
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-[840px] mx-auto w-full pt-4">
          
          {/* Card 1: Monthly Plan */}
          <div 
            onClick={() => setYearly(false)}
            className={`border rounded-3xl p-8 flex flex-col justify-between h-[390px] cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
              !yearly 
                ? "border-indigo-500 bg-zinc-950/70 shadow-[0_0_50px_rgba(99,102,241,0.2)] scale-[1.02]" 
                : "border-white/[0.06] bg-zinc-950/20 hover:border-white/[0.15] hover:bg-zinc-950/30"
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      !yearly ? "bg-indigo-600/10 text-indigo-400" : "bg-zinc-900 text-zinc-500"
                    }`}>
                      <Heart size={15} />
                    </div>
                    <h3 className="text-[17px] font-extrabold text-white">Monthly Plan</h3>
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-1">Flexible month-to-month billing</p>
                </div>
                {!yearly && (
                  <span className="text-[9px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Selected
                  </span>
                )}
              </div>

              <div className="mt-8 flex items-end gap-1">
                <span className="text-[52px] font-black text-white leading-none tracking-tight">£12</span>
                <span className="text-[15px] text-zinc-500 mb-1.5 font-medium">/ month</span>
              </div>

              <p className="text-[13.5px] text-zinc-400 mt-6 leading-relaxed">
                Ideal if you prefer a rolling membership. Get full access to the WHS handicap engine and draw entries with the flexibility to cancel anytime.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSubscribe("monthly");
              }}
              disabled={loadingPlan !== null}
              className={`w-full py-3.5 rounded-2xl text-[14px] font-extrabold transition-all flex items-center justify-center gap-2 ${
                !yearly 
                  ? "bg-white text-black hover:bg-zinc-200 shadow-[0_4px_25px_rgba(255,255,255,0.08)] active:scale-[0.98]" 
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {loadingPlan === "monthly" ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
              ) : (
                "Subscribe Monthly"
              )}
            </button>
          </div>

          {/* Card 2: Yearly Membership */}
          <div 
            onClick={() => setYearly(true)}
            className={`border rounded-3xl p-8 flex flex-col justify-between h-[390px] cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
              yearly 
                ? "border-indigo-500 bg-zinc-950/70 shadow-[0_0_50px_rgba(99,102,241,0.2)] scale-[1.02]" 
                : "border-white/[0.06] bg-zinc-950/20 hover:border-white/[0.15] hover:bg-zinc-950/30"
            }`}
          >
            {/* popular banner overlay */}
            <div className="absolute top-4 right-4 text-[9px] font-extrabold text-[#3ecf8e] bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] animate-pulse" />
              Popular
            </div>

            <div>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      yearly ? "bg-[#3ecf8e]/10 text-[#3ecf8e]" : "bg-zinc-900 text-zinc-500"
                    }`}>
                      <Trophy size={15} />
                    </div>
                    <h3 className="text-[17px] font-extrabold text-white">Yearly Plan</h3>
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-1">Billed £120 annually</p>
                </div>
                {yearly && (
                  <span className="text-[9px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Selected
                  </span>
                )}
              </div>

              <div className="mt-8 flex items-end gap-1">
                <span className="text-[52px] font-black text-white leading-none tracking-tight">£10</span>
                <span className="text-[15px] text-zinc-500 mb-1.5 font-medium">/ month</span>
                <span className="text-[11.5px] text-emerald-400 mb-2.5 ml-2.5 font-bold font-mono">Save £24/yr</span>
              </div>

              <p className="text-[13.5px] text-zinc-400 mt-6 leading-relaxed">
                Save 17% compared to monthly. Keeps your WHS handicap active throughout the year and guarantees your ticket entries in 12 consecutive draws.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSubscribe("yearly");
              }}
              disabled={loadingPlan !== null}
              className={`w-full py-3.5 rounded-2xl text-[14px] font-extrabold transition-all flex items-center justify-center gap-2 ${
                yearly 
                  ? "bg-white text-black hover:bg-zinc-200 shadow-[0_4px_25px_rgba(255,255,255,0.08)] active:scale-[0.98]" 
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {loadingPlan === "yearly" ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
              ) : (
                "Subscribe Yearly"
              )}
            </button>
          </div>

        </div>

        {/* Premium feature list wrapper */}
        <div className="border border-white/[0.06] rounded-3xl p-8 bg-zinc-950/30 backdrop-blur-xl max-w-[840px] mx-auto w-full space-y-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[150px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <h4 className="text-[12.5px] font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-400" />
            Every subscription includes
          </h4>
          
          <div className="grid sm:grid-cols-2 gap-5 pt-1">
            {PRO_FEATURES.map((feat, i) => (
              <div key={i} className="flex items-start gap-3 text-[13.5px] text-zinc-300 group hover:text-white transition-colors">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-indigo-400/40 transition-colors">
                  <Check size={11} className="text-indigo-400" strokeWidth={3} />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
