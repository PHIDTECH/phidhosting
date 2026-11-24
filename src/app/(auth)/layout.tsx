import React from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex justify-center py-8">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-navy-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <span className="text-white text-xs font-bold">PH</span>
          </div>
          PHIDHOSTING
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </div>
      <div className="text-center py-6 text-xs text-slate-400">
        © {new Date().getFullYear()} PHIDHOSTING. All rights reserved.
      </div>
    </div>
  );
}
