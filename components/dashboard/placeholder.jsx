import React from "react";

export const DashboardPlaceholder = () => {
  return (
    <div className="text-center p-8 border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/20 backdrop-blur-sm">
      <h3 className="text-base font-bold text-slate-200">Dashboard UI Component Placeholder</h3>
      <p className="text-xs text-slate-400 mt-2">
        This directory is reserved for authenticated dashboard tabs, stats graphs, score trackers, and raffle draws.
      </p>
    </div>
  );
};
