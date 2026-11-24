import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, prefix, suffix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="pointer-events-none absolute left-3 flex items-center text-slate-400">
              {prefix}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "block w-full rounded-lg border bg-white text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500",
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
              error ? "border-red-300 focus:border-red-400 focus:ring-red-400/20" : "border-slate-300",
              prefix ? "pl-10" : "pl-4",
              suffix ? "pr-10" : "pr-4",
              "py-2.5",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center text-slate-400">
              {suffix}
            </div>
          )}
        </div>
        {hint && !error && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
