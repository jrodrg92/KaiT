"use client";

import React from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowRight,
  Wallet,
  Activity,
  ShieldAlert
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AgentStatusBadge, type AgentStatus } from "@/components/agents/status-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";


const agents = [
  {
    id: "agent_01",
    name: "ArbitrageBot_01",
    status: "spending" as AgentStatus,
    wallet: "kaspa:qp32...99ee",
    budget: "10,000 KAS",
    spent24h: "1,200.50 KAS",
    lastActivity: "2m ago",
  },
  {
    id: "agent_02",
    name: "LiquidityManager",
    status: "active" as AgentStatus,
    wallet: "kaspa:qr88...44aa",
    budget: "5,000 KAS",
    spent24h: "45.50 KAS",
    lastActivity: "15m ago",
  },
  {
    id: "agent_03",
    name: "TradingAgent_X",
    status: "blocked" as AgentStatus,
    wallet: "kaspa:q001...22bb",
    budget: "2,000 KAS",
    spent24h: "0.00 KAS",
    lastActivity: "1h ago",
  },
  {
    id: "agent_04",
    name: "SettlementWorker",
    status: "paused" as AgentStatus,
    wallet: "kaspa:qz77...11cc",
    budget: "1,000 KAS",
    spent24h: "12.20 KAS",
    lastActivity: "5h ago",
  },
  {
    id: "agent_05",
    name: "YieldOptimizer",
    status: "error" as AgentStatus,
    wallet: "kaspa:qyy2...88dd",
    budget: "25,000 KAS",
    spent24h: "0.00 KAS",
    lastActivity: "1d ago",
  },
];

export default function AgentsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Autonomous Agents" 
        description="Manage your fleet of AI agents, their wallets, and spending limits."
      >
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Agent
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search agents by name or wallet..." 
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <div className="h-4 w-px bg-border mx-2" />
          <p className="text-xs text-muted-foreground">
            Showing <span className="text-foreground font-medium">{agents.length}</span> agents
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px]">Agent Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Daily Budget</TableHead>
                <TableHead>Spent (24h)</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id} className="group cursor-pointer">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Activity className="w-4 h-4" />
                      </div>
                      {agent.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AgentStatusBadge status={agent.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      <Wallet className="w-3 h-3" />
                      {agent.wallet}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{agent.budget}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{agent.spent24h}</span>
                      <div className="w-24 h-1 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            parseFloat(agent.spent24h) > 1000 ? "bg-amber-500" : "bg-primary"
                          )} 
                          style={{ width: `${Math.min((parseFloat(agent.spent24h) / parseFloat(agent.budget)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{agent.lastActivity}</TableCell>
                  <TableCell>
                    <Link href={`/agents/${agent.id}`}>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {agents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
            <Activity className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium">No agents found</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              You haven't created any autonomous agents yet. Get started by creating your first one.
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Agent
          </Button>
        </div>
      )}
    </div>
  );
}
