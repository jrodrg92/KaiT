"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, 
  Activity, 
  Wallet, 
  Key, 
  Settings, 
  LayoutDashboard, 
  Users, 
  CreditCard,
  History,
  Webhook
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Agents", icon: Users, href: "/dashboard/agents" },
  { name: "Payments", icon: Wallet, href: "/dashboard/payments" },
  { name: "API Keys", icon: Key, href: "/dashboard/api-keys" },
  { name: "Webhooks", icon: Webhook, href: "/dashboard/webhooks" },
  { name: "Audit Logs", icon: History, href: "/dashboard/audit" },
  { name: "Billing", icon: CreditCard, href: "/dashboard/billing" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-white/5 bg-[#050505] flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <Shield className="text-black w-5 h-5" />
        </div>
        <span className="font-bold tracking-tight text-white">AgentRail</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-white/10 text-white shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.1)]" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 text-gray-500 text-sm">
          <Settings className="w-4 h-4" />
          Settings
        </div>
      </div>
    </div>
  );
}
