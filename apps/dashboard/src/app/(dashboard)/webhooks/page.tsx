"use client";

import React from "react";
import { 
  Plus, 
  Webhook, 
  ExternalLink, 
  Activity, 
  CheckCircle2, 
  XCircle,
  MoreHorizontal,
  RefreshCw,
  Settings2
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
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

const endpoints = [
  {
    id: "wh_01",
    url: "https://api.acme.com/webhooks/agentrail",
    status: "active",
    events: ["payment.confirmed", "agent.blocked"],
    successRate: "99.8%",
    lastDelivery: "2m ago",
  },
  {
    id: "wh_02",
    url: "https://hooks.slack.com/services/...",
    status: "failing",
    events: ["agent.error", "policy.violated"],
    successRate: "45.2%",
    lastDelivery: "1h ago",
  },
];

export default function WebhooksPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Webhooks" 
        description="Receive real-time notifications about agent activity and payment status."
      >
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Endpoint
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.map((ep) => (
                    <TableRow key={ep.id}>
                      <TableCell className="max-w-[300px]">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium truncate">{ep.url}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{ep.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={ep.status === "active" ? "success" : "destructive"}
                          className="capitalize gap-1"
                        >
                          {ep.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {ep.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ep.events.map(e => (
                            <span key={e} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                              {e}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-bold text-sm",
                            parseFloat(ep.successRate) > 90 ? "text-emerald-500" : "text-destructive"
                          )}>
                            {ep.successRate}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Delivery Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary/30 border border-border text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Delivered</p>
                  <p className="text-xl font-bold">14.2k</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Failed</p>
                  <p className="text-xl font-bold text-destructive">24</p>
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs gap-2">
                <RefreshCw className="w-3 h-3" />
                Retry Failed Deliveries
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Webhook Signing</CardTitle>
              <CardDescription className="text-[11px]">Secure your webhooks with signature verification.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Secret Key</span>
                  <Badge variant="outline" className="text-[10px] font-mono">whsec_••••••</Badge>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-xs text-primary">
                  View Signing Secret
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
