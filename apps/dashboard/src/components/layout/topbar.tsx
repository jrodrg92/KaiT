"use client";

import React from "react";
import { Search, Bell, Command } from "lucide-react";
import { cn } from "@/lib/utils";

export function Topbar() {
  return (
    <header className="h-14 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search agents, payments, keys..." 
            className="w-full bg-secondary/50 border border-border rounded-lg py-1.5 pl-10 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-accent px-1.5 py-0.5 rounded border border-border">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </button>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">Org:</span>
          <button className="hover:text-primary transition-colors">AgentRail Demo</button>
        </div>
      </div>
    </header>
  );
}
