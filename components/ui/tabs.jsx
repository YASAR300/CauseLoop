import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext(null);

export const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [localTab, setLocalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : localTab;
  const setActiveTab = onValueChange || setLocalTab;

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-slate-950/60 p-1 border border-slate-900/80 backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 focus-visible:outline-none",
        isActive
          ? "bg-slate-900 text-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/30",
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  
  return (
    <div
      className={cn(
        "mt-4 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-200",
        className
      )}
    >
      {children}
    </div>
  );
};
