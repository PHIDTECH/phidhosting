"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Eye, EyeOff } from "lucide-react";

const ROLES = [
  { value: "ADMIN", label: "Administrator" },
  { value: "HOSTING_MANAGER", label: "Hosting Manager" },
  { value: "FINANCE", label: "Finance" },
  { value: "SUPPORT", label: "Support" },
];

const PERMISSIONS: { key: string; label: string }[] = [
  { key: "customers.view", label: "View customers" },
  { key: "customers.edit", label: "Edit customers" },
  { key: "domains.view", label: "View domains" },
  { key: "domains.manage", label: "Manage domains" },
  { key: "hosting.view", label: "View hosting" },
  { key: "hosting.manage", label: "Manage hosting" },
  { key: "email.view", label: "View email" },
  { key: "email.manage", label: "Manage email" },
  { key: "finance.view", label: "View finance" },
  { key: "finance.manage", label: "Manage finance" },
  { key: "support.view", label: "View support" },
  { key: "support.reply", label: "Reply to tickets" },
  { key: "servers.view", label: "View servers" },
  { key: "servers.manage", label: "Manage servers" },
  { key: "audit.view", label: "View audit logs" },
  { key: "settings.manage", label: "Manage settings" },
];

export function AddStaffForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "SUPPORT" });
  const [perms, setPerms] = useState<string[]>([]);

  const togglePerm = (key: string) =>
    setPerms((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, permissions: perms }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create staff account.");
      } else {
        setForm({ name: "", email: "", phone: "", password: "", role: "SUPPORT" });
        setPerms([]);
        setOpen(false);
        router.refresh();
      }
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Add Staff
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-brand-600" /> Add Staff Member
          </CardTitle>
          <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
            Cancel
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+255..."
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <Input
              label="Password"
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              suffix={
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Extra permissions <span className="font-normal text-slate-400">(optional — role defaults apply otherwise)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {PERMISSIONS.map((p) => (
                <label key={p.key} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perms.includes(p.key)}
                    onChange={() => togglePerm(p.key)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Create Staff Account</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
