import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AgentStatus = "active" | "paused" | "spending" | "blocked" | "error";

interface AgentStatusBadgeProps {
  status: AgentStatus;
  className?: string;
}

export function AgentStatusBadge({ status, className }: AgentStatusBadgeProps) {
  const variants: Record<AgentStatus, { label: string; variant: any }> = {
    active: { label: "Active", variant: "success" },
    paused: { label: "Paused", variant: "secondary" },
    spending: { label: "Spending", variant: "info" },
    blocked: { label: "Policy Blocked", variant: "warning" },
    error: { label: "Error", variant: "destructive" },
  };

  const { label, variant } = variants[status];

  return (
    <Badge variant={variant} className={cn("capitalize gap-1.5 px-2 py-0.5", className)}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
        status === "spending" ? "bg-blue-500 animate-pulse" :
        status === "blocked" ? "bg-amber-500" :
        status === "error" ? "bg-destructive" : "bg-muted-foreground"
      )} />
      {label}
    </Badge>
  );
}
