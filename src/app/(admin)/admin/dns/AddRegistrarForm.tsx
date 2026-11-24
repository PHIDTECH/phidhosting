"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export function AddRegistrarForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "api",
    apiEndpoint: "",
    isActive: true,
    isSandbox: true,
    supportsTransfer: true,
    supportsDns: false,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add registrar.");
      } else {
        setForm({ name: "", slug: "", type: "api", apiEndpoint: "", isActive: true, isSandbox: true, supportsTransfer: true, supportsDns: false, notes: "" });
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
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4" />
        Add Registrar
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Add Registrar</CardTitle>
          <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
            Cancel
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Registrar name" placeholder="Spaceship" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input label="Slug" placeholder="spaceship" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase() }))} required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={inputCls}>
                <option value="api">API (automated)</option>
                <option value="manual">Manual</option>
                <option value="registry">Registry direct</option>
              </select>
            </div>
            <Input label="API endpoint" placeholder="https://api.spaceship.dev" value={form.apiEndpoint} onChange={(e) => setForm((p) => ({ ...p, apiEndpoint: e.target.value }))} />
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { key: "isActive" as const, label: "Active" },
              { key: "isSandbox" as const, label: "Sandbox mode" },
              { key: "supportsTransfer" as const, label: "Supports transfers" },
              { key: "supportsDns" as const, label: "Supports DNS management" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                {label}
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} className={inputCls} />
          </div>

          <p className="text-xs text-slate-400">
            Registrar API credentials live in .env (e.g. SPACESHIP_API_KEY / SPACESHIP_API_SECRET).
          </p>

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Add Registrar</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
