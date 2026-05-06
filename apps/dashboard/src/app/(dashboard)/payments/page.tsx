"use client";

import React from "react";
import { 
  Search, 
  Filter, 
  Download,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
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
import { Badge } from "@/components/ui/badge";

const payments = [
  {
    id: "tx_01928374",
    agent: "ArbitrageBot_01",
    type: "outgoing",
    to: "kaspa:qp32...99ee",
    amount: "1,200.00 KAS",
    fee: "0.001 KAS",
    status: "confirmed",
    date: "2026-05-06 14:22:01",
    policy: "Auto-approved",
  },
  {
    id: "tx_01928375",
    agent: "LiquidityManager",
    type: "outgoing",
    to: "kaspa:qr88...44aa",
    amount: "45.50 KAS",
    fee: "0.001 KAS",
    status: "confirmed",
    date: "2026-05-06 14:15:30",
    policy: "Daily Limit Check",
  },
  {
    id: "tx_01928376",
    agent: "TradingAgent_X",
    type: "outgoing",
    to: "kaspa:q001...22bb",
    amount: "2,000.00 KAS",
    fee: "0.001 KAS",
    status: "failed",
    date: "2026-05-06 13:02:11",
    policy: "Max Tx Amount Block",
  },
  {
    id: "tx_01928377",
    agent: "ArbitrageBot_01",
    type: "outgoing",
    to: "kaspa:qp32...99ee",
    amount: "800.00 KAS",
    fee: "0.001 KAS",
    status: "broadcasted",
    date: "2026-05-06 12:45:00",
    policy: "Auto-approved",
  },
  {
    id: "tx_01928378",
    agent: "SettlementWorker",
    type: "outgoing",
    to: "kaspa:qz77...11cc",
    amount: "12.20 KAS",
    fee: "0.001 KAS",
    status: "confirmed",
    date: "2026-05-06 09:12:44",
    policy: "Allowlist Match",
  },
];

export default function PaymentsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Payment Ledger" 
        description="Audit all autonomous transactions executed by your agents on the Kaspa network."
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by TX ID, agent or address..." 
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Last 7 days
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">Payment ID</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Enforced Policy</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((tx) => (
                <TableRow key={tx.id} className="group">
                  <TableCell className="font-mono text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                    {tx.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center">
                        <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                      {tx.agent}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        tx.status === "confirmed" ? "success" : 
                        tx.status === "failed" ? "destructive" : "info"
                      }
                      className="capitalize gap-1.5"
                    >
                      {tx.status === "confirmed" ? <CheckCircle2 className="w-3 h-3" /> : 
                       tx.status === "failed" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      {tx.to}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {tx.amount}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border/50">
                      {tx.policy}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-[11px]">
                    {tx.date}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
