"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardPlaceholder } from "@/components/dashboard/placeholder";
import { Target, Trophy, Heart, Calendar, ArrowUpRight, Plus, LogOut, Settings, Award } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Dashboard Header */}
      <header className="border-b border-slate-900 bg-slate-950/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center">
                <Target className="h-4 w-4 text-black stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CauseLoop</span>
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              Dashboard
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-emerald-400 border border-slate-700">
                G
              </div>
              <span className="hidden sm:inline font-medium">Golfer Guest</span>
            </div>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Logout">
                <LogOut className="h-4 w-4 text-slate-400 hover:text-slate-100" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Shell */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome, Golfer</h1>
            <p className="text-sm text-slate-400 mt-1">
              Track your scores, view active raffles, and see how much you have raised for charity.
            </p>
          </div>
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Log Round
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:border-emerald-500/25 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                Handicap Index
              </CardDescription>
              <Award className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-100">14.2</div>
              <p className="text-xs text-slate-500 mt-1">-0.4 from last round</p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/25 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                Rounds Played
              </CardDescription>
              <Calendar className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-100">18</div>
              <p className="text-xs text-slate-500 mt-1">8 rounds this month</p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/25 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                Charity Raised
              </CardDescription>
              <Heart className="h-4 w-4 text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-100">$45.00</div>
              <p className="text-xs text-slate-500 mt-1">Supporting red cross</p>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/25 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">
                Active Entries
              </CardDescription>
              <Trophy className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-100">3 Tickets</div>
              <p className="text-xs text-slate-500 mt-1">Next draw in 12 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab System for detailed content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="draws">Charity Draws</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest tracked golf rounds and draws.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-900">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <Target className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">Pinehurst No. 2</p>
                          <p className="text-xs text-slate-500">June 18, 2026 • 18 Holes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-100">79 Strokes</p>
                        <p className="text-xs text-emerald-400">Net +2 (Handicap diff 8.4)</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-900">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                          <Heart className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">Monthly Donation</p>
                          <p className="text-xs text-slate-500">June 01, 2026 • Subscription contribution</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-100">$15.00</p>
                        <p className="text-xs text-slate-400">To Golf for Good</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Prize Draw</CardTitle>
                    <CardDescription>Charity partner and prizes for June.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex flex-col justify-between p-4 overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-3">
                        <Trophy className="h-10 w-10 text-amber-500/20 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          This Month&apos;s Draw
                        </span>
                        <h4 className="text-lg font-bold text-slate-100 mt-2">
                          Titleist TSR3 Driver
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-900 pt-3">
                        <span>Draw Date: June 30</span>
                        <span className="text-emerald-400 font-semibold">Value: $599</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <CardTitle>Score History</CardTitle>
                <CardDescription>Full log of your golf scorecards.</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardPlaceholder />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draws">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Raffle Drawings</CardTitle>
                <CardDescription>Explore active and past prize draws, plus charity profiles.</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardPlaceholder />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your subscription tiers and profile data.</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardPlaceholder />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
