"use client";

import React from "react";
import { 
  ArrowLeft, 
  Settings, 
  Wallet, 
  Activity, 
  ShieldCheck, 
  History, 
  Zap,
  Copy,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  Trash2
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AgentStatusBadge, type AgentStatus } from "@/components/agents/status-badge";
import { MetricCard } from "@/components/dashboard/metric-card";


import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Mock agent data
  const agent = {
    id,
    name: "ArbitrageBot_01",
    status: "spending" as AgentStatus,
    wallet: "kaspa:qp32v9v6t9r9x9p9y9z9w9q9e9r9t9y9u9i9o9p9",
    balance: "4,250.00 KAS",
    budget: "10,000.00 KAS",
    spent24h: "1,200.50 KAS",
    totalSpent: "145,200 KAS",
    createdAt: "May 12, 2026",
    environment: "Production",
    description: "High-frequency arbitrage bot operating across Kaspa dex pools.",
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/agents">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Agents
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
            <AgentStatusBadge status={agent.status} />
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
              {agent.environment}
            </Badge>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-border">
              <Wallet className="w-4 h-4" />
              <span className="font-mono">{agent.wallet}</span>
              <button className="hover:text-primary transition-colors ml-1">
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Created on <span className="text-foreground">{agent.createdAt}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <PauseCircle className="w-4 h-4" />
            Pause Agent
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <Button size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Wallet Balance" 
          value={agent.balance} 
          description="Available for spending"
          icon={<Wallet className="w-4 h-4" />}
        />
        <MetricCard 
          title="Daily Budget" 
          value={agent.budget} 
          description="Current allocation"
          icon={<Activity className="w-4 h-4" />}
        />
        <MetricCard 
          title="Spent (24h)" 
          value={agent.spent24h} 
          description="12% of daily limit"
          change={{ value: "+5.2%", trend: "up" }}
          icon={<Zap className="w-4 h-4" />}
        />
        <MetricCard 
          title="Total Lifetime Spend" 
          value={agent.totalSpent} 
          description="Since creation"
          icon={<History className="w-4 h-4" />}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-8">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="wallet" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 py-2">
            Wallet
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 py-2">
            Payments
          </TabsTrigger>
          <TabsTrigger value="policies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 py-2">
            Policies
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none px-0 py-2">
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest events and automated payments executed by this agent.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ArrowLeft className="w-3 h-3 text-emerald-500 rotate-135" />
                            <span>Payment</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="success">Confirmed</Badge></TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">To: kaspa:qr88...44aa</TableCell>
                        <TableCell className="text-right font-bold">120.00 KAS</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">2m ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-primary" />
                            <span>Policy Check</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary">Passed</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">Daily Limit Check (1,200.50/10,000)</TableCell>
                        <TableCell className="text-right font-bold">-</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">2m ago</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-blue-500" />
                            <span>API Call</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary">200 OK</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">GET /api/v1/agents/{id}/status</TableCell>
                        <TableCell className="text-right font-bold">-</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">15m ago</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Budget Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Daily Spend</span>
                      <span className="font-medium">1,200.50 / 10,000 KAS</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[12%]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Monthly Spend</span>
                      <span className="font-medium">45,200 / 100,000 KAS</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-[45%]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium">Max Tx Amount</span>
                        <span className="text-[10px] text-muted-foreground">2,500 KAS</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase border-emerald-500/20 text-emerald-500 bg-emerald-500/5">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium">Allowlist ONLY</span>
                        <span className="text-[10px] text-muted-foreground">5 destinations</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase border-emerald-500/20 text-emerald-500 bg-emerald-500/5">Active</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-4 text-xs text-muted-foreground hover:text-primary">
                    Manage all policies
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
