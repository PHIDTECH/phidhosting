"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { KeyRound, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <h1 className="font-heading text-xl font-bold text-red-600 mb-3">Invalid Reset Link</h1>
          <p className="text-slate-500 text-sm mb-6">
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Password reset failed.");
      } else {
        setDone(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 mx-auto mb-5">
            <CheckCircle2 className="h-7 w-7 text-accent-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Password Updated!</h1>
          <p className="text-slate-500 text-sm mb-6">
            Your password has been reset successfully. Redirecting you to sign in…
          </p>
          <Link href="/login">
            <Button className="w-full">Sign In Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 mx-auto mb-4">
            <KeyRound className="h-6 w-6 text-brand-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Set New Password</h1>
          <p className="text-slate-500 text-sm">
            Choose a strong password with at least 8 characters, including uppercase, lowercase and a number.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="New Password"
            type={showPass ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            suffix={
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <Input
            label="Confirm New Password"
            type={showPass ? "text" : "password"}
            placeholder="Repeat your new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Reset Password
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/login" className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
