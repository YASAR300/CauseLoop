"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Target, Github, Chrome, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    
    const searchParams = new URLSearchParams(window.location.search);
    const nextPath = searchParams.get("redirect") || "/dashboard";
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex text-white font-sans">
      {/* LEFT PANEL - Form Content */}
      <div className="w-full md:w-[42%] flex flex-col justify-between p-8 bg-[#121212] border-r border-[#222]">
        {/* Top Brand Link */}
        <Link href="/" className="flex items-center gap-2 mb-8 shrink-0">
          <svg width={22} height={22} viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="login-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5227FF" />
                <stop offset="100%" stopColor="#8644FF" />
              </linearGradient>
            </defs>
            <path
              fill="url(#login-logo-grad)"
              fillRule="evenodd"
              d="M12 30.99V36L-.01 23.99l2.516-2.499zM17.01 36H12l12.011 12.01 2.506-2.505zm28.487-9.497L48 24 24 0l-2.503 2.503L30.98 12h-5.732l-6.62-6.614-2.506 2.503 4.122 4.122h-2.869v18.625H36V27.77l4.122 4.122 2.503-2.506L36 22.747v-5.732zM13.253 10.747l-2.503 2.506 2.686 2.686 2.503-2.506zm21.314 21.314-2.495 2.503 2.686 2.686 2.506-2.503zM7.878 16.121l-2.503 2.504L12 25.253v-5.012zM27.756 36h-5.009l6.628 6.625 2.503-2.503z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-[15px] font-bold text-white tracking-wide">CauseLoop</span>
        </Link>

        {/* Center Form */}
        <div className="max-w-[340px] w-full mx-auto my-auto py-10 flex flex-col justify-center">
          <h1 className="text-[26px] font-bold tracking-tight text-white leading-tight">Welcome back</h1>
          <p className="text-[13px] text-zinc-500 mt-1.5">Sign in to your CauseLoop account</p>

          {/* Social OAuth Buttons */}
          <div className="mt-6 space-y-2">
            <button
              onClick={() => handleOAuthLogin("github")}
              disabled={loading}
              className="w-full h-10 border border-[#2e2e2e] bg-[#1a1a1a] hover:bg-[#242424] text-[13.5px] font-medium rounded-lg flex items-center justify-center gap-2.5 transition-all text-zinc-200"
            >
              <Github size={16} />
              Continue with GitHub
            </button>
            <button
              onClick={() => handleOAuthLogin("google")}
              disabled={loading}
              className="w-full h-10 border border-[#2e2e2e] bg-[#1a1a1a] hover:bg-[#242424] text-[13.5px] font-medium rounded-lg flex items-center justify-center gap-2.5 transition-all text-zinc-200"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" className="fill-current text-zinc-200">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.535 0-6.403-2.868-6.403-6.403s2.868-6.403 6.403-6.403c1.583 0 3.022.58 4.14 1.536l3.078-3.078C19.347 2.457 15.996 1.15 12.24 1.15 6.012 1.15.932 6.23 1.932 12.458c0 6.228 5.08 11.308 11.308 11.308 6.388 0 10.638-4.484 10.638-10.82 0-.693-.06-1.39-.18-2.072H12.24z" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Separator */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-[#222]"></div>
            <span className="flex-shrink mx-4 text-[11px] font-mono uppercase tracking-wider text-zinc-600">or</span>
            <div className="flex-grow border-t border-[#222]"></div>
          </div>

          {/* Standard Form */}
          {error && <p className="text-red-500 text-[12px] mb-3 text-center bg-red-500/10 py-1.5 px-3 border border-red-500/20 rounded-md">{error}</p>}
          
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-medium text-zinc-400">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full h-10 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-[13.5px] text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[12.5px] font-medium text-zinc-400">Password</label>
                <Link href="/reset-password" className="text-[11.5px] text-zinc-500 hover:text-white transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full h-10 px-3 bg-[#161616] border border-[#2a2a2a] rounded-lg text-[13.5px] text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 bg-white text-black hover:bg-zinc-200 font-bold text-[13.5px] rounded-lg flex items-center justify-center transition-all shadow-[0_4px_15px_rgba(255,255,255,0.06)]"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Redirection link */}
          <div className="text-center mt-6">
            <p className="text-[12.5px] text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-indigo-400 hover:underline font-semibold ml-0.5">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Footer Text */}
        <div className="text-[11px] text-zinc-600 tracking-wide mt-8 shrink-0">
          By continuing, you agree to CauseLoop&apos;s{" "}
          <Link href="#" className="underline hover:text-zinc-400">Terms of Service</Link> and{" "}
          <Link href="#" className="underline hover:text-zinc-400">Privacy Policy</Link>.
        </div>
      </div>

      {/* RIGHT PANEL - Quote Testimonial */}
      <div className="hidden md:flex md:w-[58%] flex-col justify-between p-16 bg-[#0e0e0e] border-l border-[#1a1a1a] relative overflow-hidden">
        {/* Subtle background decoration grid */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Top Right Docs Link */}
        <div className="self-end z-10">
          <Link
            href="#"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-zinc-400 border border-zinc-800 rounded-lg px-3 py-1.5 hover:text-white hover:border-zinc-600 transition-all bg-zinc-950/40"
          >
            Documentation
          </Link>
        </div>

        {/* Testimonial Quote */}
        <div className="max-w-[480px] my-auto relative z-10">
          {/* Quote Mark */}
          <span className="absolute -top-12 -left-6 text-[140px] font-serif font-bold text-zinc-900 leading-none pointer-events-none select-none">
            “
          </span>
          <p className="text-[20px] font-medium leading-relaxed text-zinc-300 relative z-10">
            Using CauseLoop I&apos;m really pleased on the WHS handicap engine (and prize draw rollover systems). Despite being a bit dubious about playing prize draws initially, I have to say I really don&apos;t miss anything. The whole experience feels very robust, secure, and helps real charities.
          </p>
          {/* Author info */}
          <div className="mt-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-zinc-800 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-sm text-sm">
              PR
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">@PaoloRicciuti</p>
              <p className="text-[11.5px] text-zinc-600">Verified Golfer & Donor</p>
            </div>
          </div>
        </div>

        {/* Bottom empty space alignment */}
        <div className="h-6 shrink-0" />
      </div>
    </div>
  );
}
