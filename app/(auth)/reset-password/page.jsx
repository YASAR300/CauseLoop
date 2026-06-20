"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Target, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    console.log("Reset password placeholder for:", email);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.08),rgba(255,255,255,0))]">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center">
              <Target className="h-4 w-4 text-black stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold text-white">CauseLoop</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              We will send you a link to reset your account password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex items-start gap-2 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Reset link sent!</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Check your email inbox for instructions to set your new password.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" variant="primary" className="w-full mt-2">
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <div className="text-xs text-slate-400">
              Remember your password?{" "}
              <Link href="/login" className="text-emerald-400 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
