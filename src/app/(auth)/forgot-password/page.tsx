"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 mx-auto mb-5">
            <CheckCircle2 className="h-7 w-7 text-accent-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Check your inbox</h1>
          <p className="text-slate-500 text-sm mb-6">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
            Check your spam folder if you don&apos;t see it.
          </p>
          <Link href="/login">
            <Button className="w-full" variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Button>
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
            <Mail className="h-6 w-6 text-brand-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Forgot your password?</h1>
          <p className="text-slate-500 text-sm">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Send Reset Link
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
