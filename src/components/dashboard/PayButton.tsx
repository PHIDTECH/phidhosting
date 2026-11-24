"use client";
import React, { useState } from "react";
import { CreditCard } from "lucide-react";

interface Props {
  invoiceId: string;
  label?: string;
}

export function PayButton({ invoiceId, label = "Pay now" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/selcom/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json() as { paymentUrl?: string; error?: string };
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      // Dev fallback — active only when the payment gateway isn't configured
      const dev = await fetch("/api/payments/dev-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      if (dev.ok) {
        window.location.reload();
        return;
      }
      setError(data.error || "Could not start payment. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handlePay}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-60 border border-brand-700 rounded px-3 py-1.5 transition-colors"
      >
        <CreditCard className="h-3.5 w-3.5" />
        {loading ? "Opening…" : label}
      </button>
      {error && <p className="text-xs text-red-500 max-w-[14rem] text-right">{error}</p>}
    </div>
  );
}
