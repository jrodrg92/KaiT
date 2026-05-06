"use client";

import React from "react";
import { Wallet, Plus, ArrowUpRight, Copy, ExternalLink, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
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

const wallets = [
  {
    id: "w_01",
    name: "Primary Agent Treasury",
    address: "kaspa:qp32...99ee",
    balance: "125,400.00 KAS",
    agents: 4,
    status: "active",
  },
  {
    id: "w_02",
    name: "Secondary Ops Wallet",
    address: "kaspa:qr88...44aa",
    balance: "12,200.50 KAS",
    agents: 2,
    status: "active",
  },
];

export default function WalletsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Wallet Infrastructure" 
        description="Manage the Kaspa wallets assigned to your agents and monitor their balances."
      >
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Wallet
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Active Agents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      {w.address}
                      <button className="hover:text-primary transition-colors"><Copy className="w-3 h-3" /></button>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{w.balance}</TableCell>
                  <TableCell>{w.agents} agents</TableCell>
                  <TableCell><Badge variant="success">Active</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
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
