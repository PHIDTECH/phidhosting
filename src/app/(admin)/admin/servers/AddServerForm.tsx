"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export function AddServerForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    kind: "hosting" as "hosting" | "mail",
    name: "",
    hostname: "",
    ipAddress: "",
    apiUrl: "",
    username: "",
    status: "ACTIVE",
    isSandbox: true,
    maxAccounts: "",
    notes: "",
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxAccounts: form.maxAccounts ? Number(form.maxAccounts) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add server.");
      } else {
        setForm({ kind: "hosting", name: "", hostname: "", ipAddress: "", apiUrl: "", username: "", status: "ACTIVE", isSandbox: true, maxAccounts: "", notes: "" });
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
        Add Server
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Add Server</CardTitle>
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
          <div className="flex gap-2">
            {(["hosting", "mail"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => set("kind", k)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  form.kind === k
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {k === "hosting" ? "WHM / cPanel" : "Mailcow"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Server name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <Input label="Hostname" placeholder="srv1.phidhosting.com" value={form.hostname} onChange={(e) => set("hostname", e.target.value)} required />
            {form.kind === "hosting" && (
              <>
                <Input label="IP address" value={form.ipAddress} onChange={(e) => set("ipAddress", e.target.value)} />
                <Input label="WHM username" placeholder="root" value={form.username} onChange={(e) => set("username", e.target.value)} />
              </>
            )}
            <Input label="API URL" placeholder={form.kind === "hosting" ? "https://srv1:2087" : "https://mail.example.com"} value={form.apiUrl} onChange={(e) => set("apiUrl", e.target.value)} />
            {form.kind === "hosting" && (
              <Input label="Max accounts" type="number" min={1} value={form.maxAccounts} onChange={(e) => set("maxAccounts", e.target.value)} />
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={form.isSandbox} onChange={(e) => set("isSandbox", e.target.checked)} className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Sandbox mode (no live provisioning on this server)
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={inputCls} />
          </div>

          <p className="text-xs text-slate-400">
            API secrets are not stored here — set {form.kind === "hosting" ? "WHM_API_TOKEN" : "MAILCOW_API_KEY"} in the server&apos;s .env file.
          </p>

          <div className="flex gap-3">
            <Button type="submit" loading={loading}>Add Server</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
