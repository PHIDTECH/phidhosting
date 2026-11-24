"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, ShieldCheck, Loader2 } from "lucide-react";

interface Price { billingPeriod: string; price: number; currency: string }
interface Pkg { id: string; name: string; shortDescription?: string | null; pricing: Price[] }
interface DomainInfo { domain: string; registrationPrice?: number; currency?: string; available?: boolean }

const PERIOD_LABEL: Record<string, string> = {
  MONTHLY: "Monthly",
  ANNUALLY: "Annually",
  BIENNIALLY: "Every 2 years",
};

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // hosting | email | domain
  const planId = searchParams.get("plan");
  const domainList = (searchParams.get("domains") ?? "").split(",").map((d) => d.trim()).filter(Boolean);

  const [sessionChecked, setSessionChecked] = useState(false);
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [domainInfos, setDomainInfos] = useState<DomainInfo[]>([]);
  const [domain, setDomain] = useState("");
  const [period, setPeriod] = useState("ANNUALLY");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth gate — preserve this checkout URL through login
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (!s?.user) {
          const url = `/checkout?${searchParams.toString()}`;
          router.replace(`/login?callbackUrl=${encodeURIComponent(url)}`);
        } else {
          setSessionChecked(true);
        }
      })
      .catch(() => router.replace("/login"));
  }, [router, searchParams]);

  // Load selected package or domain pricing
  useEffect(() => {
    if (!sessionChecked) return;
    (async () => {
      try {
        if (type === "domain" && domainList.length > 0) {
          const infos = await Promise.all(
            domainList.map((d) =>
              fetch(`/api/domains/check?domain=${encodeURIComponent(d)}`).then((r) => r.json())
            )
          );
          setDomainInfos(infos);
        } else if ((type === "hosting" || type === "email") && planId) {
          const res = await fetch(`/api/packages/${type === "hosting" ? "hosting" : "email"}`);
          const data = await res.json();
          const found = (data.packages ?? []).find((p: Pkg) => p.id === planId);
          setPkg(found ?? null);
        }
      } finally {
        setPageLoading(false);
      }
    })();
  }, [sessionChecked, type, planId, domainList]);

  const items = useMemo(() => {
    if (type === "domain") {
      return domainInfos
        .filter((d) => d.available && d.registrationPrice)
        .map((d) => ({ label: `${d.domain} — 1 year registration`, price: d.registrationPrice! }));
    }
    if (pkg) {
      const price = pkg.pricing.find((p) => p.billingPeriod === period);
      return price ? [{ label: `${pkg.name} — ${domain || "your domain"} (${PERIOD_LABEL[period] ?? period})`, price: price.price }] : [];
    }
    return [];
  }, [type, domainInfos, pkg, period, domain]);

  const total = items.reduce((s, i) => s + i.price, 0);
  const currency = type === "domain"
    ? domainInfos[0]?.currency ?? "USD"
    : pkg?.pricing.find((p) => p.billingPeriod === period)?.currency ?? "USD";

  const canSubmit =
    items.length > 0 && !loading &&
    (type === "domain" || domain.trim().length >= 4);

  const handleOrder = async () => {
    setError("");
    setLoading(true);
    try {
      const orderItems =
        type === "domain"
          ? domainInfos.filter((d) => d.available).map((d) => ({ type: "DOMAIN", domain: d.domain }))
          : [{ type: type === "hosting" ? "HOSTING" : "EMAIL", packageId: planId, domain: domain.trim().toLowerCase(), billingPeriod: period }];

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: orderItems }),
      });
      const order = await res.json();
      if (!res.ok) {
        setError(order.error || "Could not create order.");
        return;
      }

      // Try Selcom first; fall back to dev payment when gateway isn't configured
      const pay = await fetch("/api/payments/selcom/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: order.invoiceId }),
      });
      const payData = await pay.json();
      if (pay.ok && payData.paymentUrl) {
        window.location.href = payData.paymentUrl;
        return;
      }

      const dev = await fetch("/api/payments/dev-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: order.invoiceId }),
      });
      if (dev.ok) {
        router.push("/dashboard/invoices?payment=success");
        return;
      }

      router.push("/dashboard/invoices");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionChecked || pageLoading) {
    return (
      <div className="container py-24 text-center">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="container max-w-2xl">
        <h1 className="font-heading text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-brand-600" /> Checkout
        </h1>
        <p className="text-sm text-slate-500 mb-6">Review your order and complete payment.</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        )}

        {type !== "domain" && pkg && (
          <Card className="mb-4">
            <CardContent className="p-5 space-y-4">
              <Input
                label="Domain name"
                placeholder="yourcompany.co.tz"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                hint="The domain this service will be attached to. You can register a new one or use an existing domain."
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Billing period</label>
                <div className="flex gap-2">
                  {pkg.pricing.map((p) => (
                    <button
                      key={p.billingPeriod}
                      type="button"
                      onClick={() => setPeriod(p.billingPeriod)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        period === p.billingPeriod
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {PERIOD_LABEL[p.billingPeriod] ?? p.billingPeriod} — {p.currency} {p.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            {items.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">
                Nothing to check out.{" "}
                <Link href="/hosting" className="text-brand-600 hover:underline">Browse plans</Link>
              </p>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {items.map((i) => (
                    <div key={i.label} className="flex justify-between py-3 text-sm">
                      <span className="text-slate-700">{i.label}</span>
                      <span className="font-medium text-slate-900">{currency} {i.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 mt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900">{currency} {total.toFixed(2)}</span>
                </div>

                <Button onClick={handleOrder} loading={loading} className="w-full mt-5" size="lg">
                  Place Order & Pay
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-3">
                  <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout — services activate automatically after payment.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutInner />
    </Suspense>
  );
}
