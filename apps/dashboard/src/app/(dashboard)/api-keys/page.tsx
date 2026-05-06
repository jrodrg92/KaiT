"use client";

import React from "react";
import { 
  Plus, 
  Key, 
  Copy, 
  Trash2, 
  RefreshCcw,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle
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

const apiKeys = [
  {
    id: "ak_live_82374...9283",
    name: "Production Primary",
    env: "Production",
    scope: "full_access",
    lastUsed: "2m ago",
    createdAt: "2026-04-12",
  },
  {
    id: "ak_live_11223...5566",
    name: "Worker Instance B",
    env: "Production",
    scope: "read_only",
    lastUsed: "1h ago",
    createdAt: "2026-05-01",
  },
  {
    id: "ak_test_99887...4433",
    name: "Staging Test",
    env: "Testnet",
    scope: "full_access",
    lastUsed: "Never",
    createdAt: "2026-05-05",
  },
];

export default function APIKeysPage() {
  const [showKey, setShowKey] = React.useState<string | null>(null);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="API Keys" 
        description="Authenticate your agents and services with AgentRail API using secure keys."
      >
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Key
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Name</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col gap-1">
                          <span>{key.name}</span>
                          <div className="flex items-center gap-2 group">
                            <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">
                              {showKey === key.id ? key.id : "ak_••••••••••••••••"}
                            </span>
                            <button 
                              onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              {showKey === key.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.env === "Production" ? "outline" : "secondary"} className="text-[10px] uppercase">
                          {key.env}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-[11px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                          {key.scope}
                        </code>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{key.lastUsed}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <RefreshCcw className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-3.5 h-3.5" />
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
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-500 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                Security Warning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your API keys carry significant privileges. Never share them or commit them to source control.
              </p>
              <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
                <li>Rotate keys every 90 days</li>
                <li>Use read-only scopes when possible</li>
                <li>Separate Production and Testnet keys</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-3 text-xs text-muted-foreground hover:text-primary">
                <Key className="w-4 h-4" />
                API Documentation
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-xs text-muted-foreground hover:text-primary">
                <Shield className="w-4 h-4" />
                Security Best Practices
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
