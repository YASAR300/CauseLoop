import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl transition-all duration-300 z-10 animate-in fade-in zoom-in-95 duration-150",
          className
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-slate-100 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-800"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        {title && (
          <h3 className="text-lg font-bold text-slate-100 mb-4 pr-6 leading-tight">
            {title}
          </h3>
        )}

        {/* Body */}
        <div className="text-sm text-slate-300 leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
