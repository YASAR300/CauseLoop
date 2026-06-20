"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Trophy, HelpCircle, Heart, Target, Sparkles, Mail, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))]">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Target className="h-5 w-5 text-black stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Cause<span className="text-emerald-400">Loop</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-semibold px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400">
            Vercel Ready
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto text-center py-12 md:py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-6 animate-pulse">
          <Sparkles className="h-3 w-3" />
          Coming Soon
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white max-w-3xl">
          Track Your Golf Game. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
            Support Great Causes.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          CauseLoop is a subscription-based golf score tracking platform combined with a monthly
          charity-driven prize draw system. Track your progress, compete in draws, and make an impact.
        </p>

        {/* Input Form */}
        <div className="mt-10 w-full max-w-md">
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-semibold">{"You're on the list! We'll keep you updated."}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  className="bg-slate-950/70 border-slate-800"
                />
              </div>
              <Button type="submit" variant="primary" className="h-[46px] sm:h-auto">
                <Mail className="h-4 w-4 mr-2" />
                Notify Me
              </Button>
            </form>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <Card className="hover:border-emerald-500/30 transition-all duration-300">
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 mb-2">
                <Target className="h-6 w-6" />
              </div>
              <CardTitle>Score Tracking</CardTitle>
              <CardDescription>
                Clean, intuitive dashboards to log rounds, calculate handicap dynamics, and review performance stats.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-emerald-500/30 transition-all duration-300">
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 mb-2">
                <Heart className="h-6 w-6" />
              </div>
              <CardTitle>Charity Support</CardTitle>
              <CardDescription>
                A portion of every subscription goes directly to verified charity partners, making every putt count.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-emerald-500/30 transition-all duration-300">
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 mb-2">
                <Trophy className="h-6 w-6" />
              </div>
              <CardTitle>Monthly Draws</CardTitle>
              <CardDescription>
                Subscribers are automatically entered into premium prize drawings each month, from golf gear to dream trips.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <span>© {new Date().getFullYear()} CauseLoop. All rights reserved.</span>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
