"use client";

import React from "react";
import { 
  Plus, 
  ArrowUpRight, 
  Wallet, 
  Activity, 
  ShieldCheck, 
  Key,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


export default function OverviewPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Organization Overview" 
        description="Monitoring 12 active autonomous agents across Kaspa Network."
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Agent
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Balance" 
          value="45,200.50 KAS" 
          description="Across 12 agent wallets"
          change={{ value: "+12.5%", trend: "up" }}
          icon={<Wallet className="w-4 h-4" />}
        />
        <MetricCard 
          title="Active Agents" 
          value="12" 
          description="2 currently spending"
          change={{ value: "+2", trend: "up" }}
          icon={<Activity className="w-4 h-4" />}
        />
        <MetricCard 
          title="Daily Spending" 
          value="840.00 KAS" 
          description="Last 24 hours"
          change={{ value: "-2.1%", trend: "down" }}
          icon={<ArrowUpRight className="w-4 h-4" />}
        />
        <MetricCard 
          title="Policy Enforcement" 
          value="100%" 
          description="No blocks in 24h"
          change={{ value: "Stable", trend: "neutral" }}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest transactions across all autonomous agents.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1">
                View all <ExternalLink className="w-3 h-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TransactionRow 
                    agent="ArbitrageBot_01" 
                    status="confirmed" 
                    to="kaspa:qp32...99ee" 
                    amount="1,200.00 KAS" 
                    time="2m ago" 
                  />
                  <TransactionRow 
                    agent="LiquidityManager" 
                    status="confirmed" 
                    to="kaspa:qr88...44aa" 
                    amount="45.50 KAS" 
                    time="15m ago" 
                  />
                  <TransactionRow 
                    agent="TradingAgent_X" 
                    status="failed" 
                    to="kaspa:q001...22bb" 
                    amount="2,000.00 KAS" 
                    time="1h ago" 
                  />
                  <TransactionRow 
                    agent="ArbitrageBot_01" 
                    status="broadcasted" 
                    to="kaspa:qp32...99ee" 
                    amount="800.00 KAS" 
                    time="2h ago" 
                  />
                  <TransactionRow 
                    agent="SettlementWorker" 
                    status="confirmed" 
                    to="kaspa:qz77...11cc" 
                    amount="12.20 KAS" 
                    time="5h ago" 
                  />
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  API Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Requests (24h)</span>
                    <span className="font-mono">1.2M / 5M</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[24%]" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Rate limit: 500 req/s</span>
                    <span>Usage: 24%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <HealthItem label="API Gateway" status="operational" />
                <HealthItem label="Signer Workers" status="operational" />
                <HealthItem label="Kaspa RPC Node" status="degraded" />
              </CardContent>
            </Card>
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Active Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-2xl font-bold">Pro Scale</div>
                <div className="text-sm text-muted-foreground">$249 / month</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Usage this month</span>
                  <span>78%</span>
                </div>
                <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[78%] shadow-[0_0_8px_rgba(112,199,166,0.5)]" />
                </div>
              </div>

              <Button className="w-full" variant="outline">
                Manage Subscription
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Security Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[13px] font-medium text-amber-500">Policy Update Needed</p>
                  <p className="text-[12px] text-muted-foreground">ArbitrageBot_01 is approaching its daily budget limit.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[13px] font-medium text-emerald-500">Keys Rotated</p>
                  <p className="text-[12px] text-muted-foreground">Successfully rotated 2 API keys for Production environment.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function TransactionRow({ agent, status, to, amount, time }: any) {
  return (
    <TableRow>
      <TableCell className="font-medium">{agent}</TableCell>
      <TableCell>
        <Badge 
          variant={
            status === "confirmed" ? "success" : 
            status === "failed" ? "destructive" : "info"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-muted-foreground text-xs">{to}</TableCell>
      <TableCell className="text-right font-mono font-bold">{amount}</TableCell>
      <TableCell className="text-right text-muted-foreground text-xs">{time}</TableCell>
    </TableRow>
  );
}

function HealthItem({ label, status }: { label: string; status: "operational" | "degraded" | "down" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-tighter",
          status === "operational" ? "text-emerald-500" : 
          status === "degraded" ? "text-amber-500" : "text-destructive"
        )}>
          {status}
        </span>
        <div className={cn(
          "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
          status === "operational" ? "bg-emerald-500 shadow-emerald-500" : 
          status === "degraded" ? "bg-amber-500 shadow-amber-500" : "bg-destructive shadow-destructive"
        )} />
      </div>
    </div>
  );
}

