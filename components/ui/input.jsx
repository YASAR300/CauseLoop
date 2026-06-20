import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(({ className, type = "text", label, error, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all duration-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          {
            "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20": error,
          },
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-rose-400">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";
