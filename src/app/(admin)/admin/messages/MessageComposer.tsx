"use client";
import React, { useState } from "react";
import { Send, Users, User } from "lucide-react";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

interface Props {
  customers: Customer[];
  sentById: string;
}

export function MessageComposer({ customers, sentById }: Props) {
  const [mode, setMode] = useState<"single" | "all">("single");
  const [recipientId, setRecipientId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (mode === "single" && !recipientId) return;

    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          recipientId: mode === "single" ? recipientId : undefined,
          message: message.trim(),
          sentById,
        }),
      });
      const data = await res.json() as { success?: boolean; sent?: number; error?: string };
      if (!res.ok) {
        setResult({ ok: false, msg: data.error || "Send failed." });
      } else {
        setResult({ ok: true, msg: mode === "all" ? `Sent to ${data.sent} customers.` : "Message sent." });
        setMessage("");
        setRecipientId("");
      }
    } catch {
      setResult({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setSending(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === recipientId);

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Compose SMS</h3>
        <p className="text-xs text-slate-400">Sent via Beem Africa. Requires BEEM_API_KEY in .env</p>
      </div>

      <form onSubmit={handleSend} className="p-5 space-y-4">
        {/* Mode selector */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-sm font-medium transition-colors ${
              mode === "single"
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="h-3.5 w-3.5" /> Single customer
          </button>
          <button
            type="button"
            onClick={() => setMode("all")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-sm font-medium transition-colors ${
              mode === "all"
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Users className="h-3.5 w-3.5" /> All customers
          </button>
        </div>

        {/* Recipient picker */}
        {mode === "single" && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Select customer
            </label>
            <select
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              required={mode === "single"}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            >
              <option value="">— Choose customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} disabled={!c.phone}>
                  {c.name ?? c.email}
                  {c.phone ? ` · ${c.phone}` : " · (no phone)"}
                </option>
              ))}
            </select>
            {selectedCustomer && !selectedCustomer.phone && (
              <p className="text-xs text-orange-500 mt-1">This customer has no phone number on file.</p>
            )}
            {selectedCustomer?.phone && (
              <p className="text-xs text-slate-400 mt-1">Will send to: {selectedCustomer.phone}</p>
            )}
          </div>
        )}

        {mode === "all" && (
          <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            Will send to <strong>{customers.filter((c) => c.phone).length}</strong> customers with phone numbers registered.
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            maxLength={612}
            placeholder="Type your message here..."
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 resize-none"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-400">
              {charCount}/612 chars · {smsCount} SMS part{smsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-md px-3 py-2 text-sm ${result.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {result.msg}
          </div>
        )}

        <button
          type="submit"
          disabled={sending || !message.trim() || (mode === "single" && (!recipientId || !selectedCustomer?.phone))}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending…" : "Send SMS"}
        </button>
      </form>
    </div>
  );
}
