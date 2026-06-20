import React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef(({ className, variant = "primary", size = "md", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-[0_4px_20px_0_rgba(16,185,129,0.25)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:scale-[1.01] hover:brightness-110":
            variant === "primary",
          "bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 shadow-lg":
            variant === "secondary",
          "bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-100":
            variant === "ghost",
          "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300":
            variant === "destructive",
        },
        {
          "px-4 py-2 text-sm": size === "sm",
          "px-6 py-3 text-base": size === "md",
          "px-8 py-4 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
});

Button.displayName = "Button";
