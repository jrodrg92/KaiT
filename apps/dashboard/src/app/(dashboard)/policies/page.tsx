"use client";

import React from "react";
import { 
  Plus, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  Lock,
  Globe,
  Clock,
  Settings2,
  AlertCircle
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const policies = [
  {
    id: "pol_01",
    name: "Max Transaction Amount",
    description: "Blocks any single payment exceeding the specified limit.",
    type: "Constraint",
    value: "2,500 KAS",
    status: "active",
    enforcements: 12,
  },
  {
    id: "pol_02",
    name: "Destination Allowlist",
    description: "Only allows payments to pre-approved Kaspa addresses.",
    type: "Filter",
    value: "5 Addresses",
    status: "active",
    enforcements: 145,
  },
  {
    id: "pol_03",
    name: "Daily Velocity Limit",
    description: "Caps the number of transactions an agent can make in 24h.",
    type: "Velocity",
    value: "50 tx/day",
    status: "active",
    enforcements: 0,
  },
  {
    id: "pol_04",
    name: "Required Approval",
    description: "Requires manual human approval for any tx over 5,000 KAS.",
    type: "Workflow",
    value: "> 5,000 KAS",
    status: "inactive",
    enforcements: 0,
  },
];

export default function PoliciesPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Security Policies" 
        description="Define guardrails and automated security rules for your autonomous agents."
      >
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Policy
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <Card key={policy.id} className="group hover:border-primary/30 transition-all cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  policy.status === "active" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <Badge variant={policy.status === "active" ? "success" : "secondary"} className="text-[10px] uppercase">
                  {policy.status}
                </Badge>
              </div>
              <CardTitle className="text-base group-hover:text-primary transition-colors">{policy.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2 min-h-[32px]">
                {policy.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-y border-border/50">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Constraint</span>
                  <span className="text-sm font-mono font-bold">{policy.value}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Enforced <span className="text-foreground font-medium">{policy.enforcements}</span> times</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed border-2 flex flex-col items-center justify-center p-8 text-center space-y-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary">
            <Plus className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">Add Custom Policy</h3>
            <p className="text-xs text-muted-foreground">Implement your own logic and guardrails.</p>
          </div>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold">Global Safety Switch</h3>
            <p className="text-sm text-muted-foreground">Immediately pause all autonomous payments across all agents in case of an emergency.</p>
          </div>
          <Button variant="destructive" className="gap-2 font-bold uppercase tracking-wider text-xs">
            <Lock className="w-4 h-4" />
            Panic Button
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
