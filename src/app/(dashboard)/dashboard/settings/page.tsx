"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, RefreshCw, CheckCircle2, Shield } from "lucide-react";
import type { Metadata } from "next";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    renewalReminders: true,
    invoiceAlerts: true,
    marketingEmails: false,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setLoading(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your account preferences.
        </p>
      </div>

      {saved && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Preferences saved successfully.
        </div>
      )}

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-brand-600" /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "emailNotifications" as const, label: "Email notifications", desc: "Receive important account notifications via email" },
            { key: "renewalReminders" as const, label: "Renewal reminders", desc: "Get reminded before your services expire" },
            { key: "invoiceAlerts" as const, label: "Invoice alerts", desc: "Receive alerts when new invoices are generated" },
            { key: "marketingEmails" as const, label: "Marketing emails", desc: "Promotional offers and product updates" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                onClick={() => toggle(key)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                  prefs[key] ? "bg-brand-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    prefs[key] ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Auto-renew */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-brand-600" /> Auto-Renewal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Auto-renewal settings are managed per service. Visit your{" "}
            <a href="/dashboard/domains" className="text-brand-600 hover:underline">Domains</a>,{" "}
            <a href="/dashboard/hosting" className="text-brand-600 hover:underline">Hosting</a>, or{" "}
            <a href="/dashboard/email" className="text-brand-600 hover:underline">Email</a>{" "}
            pages to toggle auto-renewal for individual services.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-600" /> Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            To change your password, visit your{" "}
            <a href="/dashboard/profile" className="text-brand-600 hover:underline">Profile page</a>.
          </p>
        </CardContent>
      </Card>

      <Button onClick={save} loading={loading}>Save Preferences</Button>
    </div>
  );
}
