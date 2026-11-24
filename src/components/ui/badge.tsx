import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-50 text-brand-700 ring-brand-600/20",
        secondary: "bg-slate-100 text-slate-700 ring-slate-600/20",
        success: "bg-green-50 text-green-700 ring-green-600/20",
        warning: "bg-orange-50 text-orange-700 ring-orange-600/20",
        danger: "bg-red-50 text-red-700 ring-red-600/20",
        info: "bg-blue-50 text-blue-700 ring-blue-600/20",
        outline: "bg-transparent text-slate-700 ring-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
