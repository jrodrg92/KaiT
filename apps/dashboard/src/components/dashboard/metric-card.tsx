import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, description, change, icon, className }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden group hover:border-primary/20 transition-all", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {change && (
            <div className={cn(
              "flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded",
              change.trend === "up" ? "text-emerald-500 bg-emerald-500/10" : 
              change.trend === "down" ? "text-red-500 bg-red-500/10" : "text-muted-foreground bg-muted"
            )}>
              {change.trend === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
              {change.trend === "down" && <TrendingDown className="w-3 h-3 mr-1" />}
              {change.value}
            </div>
          )}
          {description && (
            <p className="text-[11px] text-muted-foreground truncate">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
