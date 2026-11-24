"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    token ? "loading" : "idle"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(d.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("An unexpected error occurred.");
      });
  }, [token]);

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 mx-auto mb-5">
            <Mail className="h-7 w-7 text-brand-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Check Your Email</h1>
          <p className="text-slate-500 text-sm mb-6">
            We've sent a verification link to your email address. Click the link in the email to verify your account.
          </p>
          <Link href="/login">
            <Button className="w-full">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Verifying your email address…</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 mx-auto mb-5">
            <CheckCircle2 className="h-7 w-7 text-accent-600" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Email Verified!</h1>
          <p className="text-slate-500 text-sm mb-6">
            Your email address has been verified. You can now sign in to your account.
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
      <div className="card p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mx-auto mb-5">
          <XCircle className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Verification Failed</h1>
        <p className="text-slate-500 text-sm mb-6">
          {message || "This verification link is invalid or has expired."}
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login">
            <Button className="w-full">Go to Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-full">Create New Account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
