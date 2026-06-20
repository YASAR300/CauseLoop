import React from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800/65 bg-slate-950/40 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden",
        className
      )}
      {...props}
    />
  );
};

export const CardHeader = ({ className, ...props }) => {
  return <div className={cn("flex flex-col space-y-2 pb-4", className)} {...props} />;
};

export const CardTitle = ({ className, ...props }) => {
  return (
    <h3 className={cn("text-xl font-bold tracking-tight text-slate-100", className)} {...props} />
  );
};

export const CardDescription = ({ className, ...props }) => {
  return <p className={cn("text-sm text-slate-400", className)} {...props} />;
};

export const CardContent = ({ className, ...props }) => {
  return <div className={cn("pt-2", className)} {...props} />;
};

export const CardFooter = ({ className, ...props }) => {
  return <div className={cn("flex items-center pt-4 border-t border-slate-900", className)} {...props} />;
};
