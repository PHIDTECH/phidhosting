"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", website: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      router.push("/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrong =
    form.password.length >= 8 &&
    /[A-Z]/.test(form.password) &&
    /[0-9]/.test(form.password);

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
          <p className="text-slate-500 text-sm">Start hosting with PHIDHOSTING today</p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            autoComplete="name"
          />
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
            autoComplete="email"
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="0744 741 874 or +255744741874"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            required
            autoComplete="tel"
          />
          {/* Honeypot: hidden from real users, bots fill it */}
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />
          <div>
            <Input
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              autoComplete="new-password"
              suffix={
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {form.password && (
              <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${passwordStrong ? "text-green-600" : "text-slate-400"}`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {passwordStrong ? "Strong password" : "Min. 8 characters with uppercase & number"}
              </div>
            )}
          </div>
          <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
            <UserPlus className="h-4 w-4" />
            Create Account
          </Button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-5 leading-relaxed">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
        </p>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
