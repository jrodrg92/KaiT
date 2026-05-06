"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bot, 
  Wallet, 
  ArrowLeftRight, 
  ShieldCheck, 
  Key, 
  Webhook, 
  FileText, 
  BarChart3, 
  CreditCard, 
  Settings,
  ChevronDown,
  Globe,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Platform",
    items: [
      { name: "Overview", href: "/", icon: LayoutDashboard },
      { name: "Agents", href: "/agents", icon: Bot },
      { name: "Wallets", href: "/wallets", icon: Wallet },
      { name: "Payments", href: "/payments", icon: ArrowLeftRight },
    ],
  },
  {
    title: "Control",
    items: [
      { name: "Policies", href: "/policies", icon: ShieldCheck },
      { name: "API Keys", href: "/api-keys", icon: Key },
      { name: "Webhooks", href: "/webhooks", icon: Webhook },
      { name: "Audit Logs", href: "/audit-logs", icon: FileText },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "Usage", href: "/usage", icon: BarChart3 },
      { name: "Billing", href: "/billing", icon: CreditCard },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 hidden lg:flex">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <Terminal className="w-5 h-5" />
          </div>
          <span>AgentRail</span>
        </Link>
      </div>

      <div className="px-4 mb-4">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm hover:bg-secondary transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-medium">Production</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-8">
        {navigation.map((group) => (
          <div key={group.title}>
            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-all",
                      isActive 
                        ? "bg-accent text-foreground border border-border/50 shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        <div className="flex items-center justify-between px-2 py-1.5 bg-secondary/30 rounded-md text-[11px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="w-3 h-3" />
            <span>Kaspa Mainnet</span>
          </div>
          <span className="text-primary font-mono font-bold">84.2 BPS</span>
        </div>
        
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold border border-border">
            JK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Javier Rodriguez</p>
            <p className="text-xs text-muted-foreground truncate">Acme Corp</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
