"use client";

import React from "react";
import { 
  BarChart3, 
  CreditCard, 
  ArrowUpRight, 
  Download,
  CheckCircle2,
  Zap,
  Globe,
  Database,
  ShieldCheck
} from "lucide-react";
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

export default function UsageBillingPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Usage & Billing" 
        description="Monitor your infrastructure consumption and manage your subscription plan."
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Download Invoices
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest text-primary">Current Plan</CardTitle>
            <div className="pt-2">
              <h3 className="text-3xl font-bold">Pro Scale</h3>
              <p className="text-sm text-muted-foreground">$249 / month</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full mt-4">Manage Subscription</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Technical Consumption</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">API Requests</span>
                <span className="font-bold">1.2M / 5M</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[24%]" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Managed Wallets</span>
                <span className="font-bold">12 / 50</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[24%]" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Webhook Events</span>
                <span className="font-bold">84k / 500k</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[16%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>View and download your past monthly statements.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">INV-2026-004</TableCell>
                    <TableCell>May 1, 2026</TableCell>
                    <TableCell className="font-bold">$249.00</TableCell>
                    <TableCell><Badge variant="success">Paid</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 gap-2">
                        <Download className="w-3 h-3" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">INV-2026-003</TableCell>
                    <TableCell>Apr 1, 2026</TableCell>
                    <TableCell className="font-bold">$249.00</TableCell>
                    <TableCell><Badge variant="success">Paid</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 gap-2">
                        <Download className="w-3 h-3" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/20">
                <div className="w-10 h-10 rounded bg-background flex items-center justify-center border border-border">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 12/28</p>
                </div>
                <Badge variant="outline">Default</Badge>
              </div>
              <Button variant="ghost" className="w-full text-xs text-primary">Update Payment Method</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Included Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Advanced Policy Engine</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>HSM Key Management</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>99.9% API Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span>Priority Developer Support</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
