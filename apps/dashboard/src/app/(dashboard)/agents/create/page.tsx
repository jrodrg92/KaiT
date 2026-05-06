"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Check, 
  Wallet, 
   Activity,
  ShieldCheck, 
  Zap, 
  Key,
  ChevronRight,
  Info
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

const steps = [
  { id: "identity", title: "Identity", icon: Zap },
  { id: "wallet", title: "Wallet", icon: Wallet },
  { id: "limits", title: "Budget Limits", icon: Activity },
  { id: "policies", title: "Policies", icon: ShieldCheck },
  { id: "review", title: "Review", icon: Check },
];

export default function CreateAgentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Simulate creation
      router.push("/agents");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/agents">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between">
          {steps.map((step, idx) => (
            <div 
              key={step.id} 
              className={cn(
                "flex flex-col items-center gap-2 relative z-10",
                idx <= currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                idx < currentStep ? "bg-primary border-primary text-primary-foreground" :
                idx === currentStep ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(112,199,166,0.3)]" :
                "border-border bg-secondary/50"
              )}>
                {idx < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider">{step.title}</span>
              
              {idx < steps.length - 1 && (
                <div className={cn(
                  "absolute h-[2px] w-[calc(100%*2.5)] left-[calc(100%-10px)] top-5 -z-10",
                  idx < currentStep ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-border/50 shadow-xl overflow-hidden">
          <CardContent className="p-10">
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Agent Identity</h2>
                  <p className="text-sm text-muted-foreground">Define how your agent will be identified in the platform.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agent Name</Label>
                    <Input id="name" placeholder="e.g. TradingBot_Alpha" />
                    <p className="text-[10px] text-muted-foreground">Use a unique name to easily track this agent.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <textarea 
                      id="description" 
                      className="flex min-h-[80px] w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="What is this agent's purpose?"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Wallet Infrastructure</h2>
                  <p className="text-sm text-muted-foreground">Every agent needs a dedicated Kaspa wallet for autonomous payments.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Zap className="w-5 h-5" />
                      </div>
                      <Badge variant="success">Recommended</Badge>
                    </div>
                    <h3 className="font-bold mb-1">Managed Wallet</h3>
                    <p className="text-xs text-muted-foreground">AgentRail handles key management securely via HSM/KMS. Best for autonomy.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-secondary/20 cursor-not-allowed opacity-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                        <Key className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-bold mb-1">Self-Custody</h3>
                    <p className="text-xs text-muted-foreground">Sign transactions externally via API/Webhooks. (Coming soon)</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 flex gap-3">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">A new Kaspa address will be generated for this agent. You will need to fund it after creation.</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Spending Limits</h2>
                  <p className="text-sm text-muted-foreground">Control risk by setting clear boundaries for your agent.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="daily">Daily Budget (KAS)</Label>
                    <div className="relative">
                      <Input id="daily" type="number" placeholder="1000" className="pr-12" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">KAS</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly">Monthly Budget (KAS)</Label>
                    <div className="relative">
                      <Input id="monthly" type="number" placeholder="25000" className="pr-12" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">KAS</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTx">Max per Transaction (KAS)</Label>
                  <div className="relative">
                    <Input id="maxTx" type="number" placeholder="100" className="pr-12" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">KAS</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Transactions exceeding this amount will be automatically blocked.</p>
                </div>
              </div>
            )}

            {currentStep >= 3 && (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">Ready to Launch</h2>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Everything is set. Your agent will be initialized with a managed wallet and the defined spending policies.
                </p>
              </div>
            )}
          </CardContent>
          <div className="bg-secondary/30 p-6 border-t border-border flex justify-between">
            <Button 
              variant="ghost" 
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button 
              onClick={nextStep}
              className="gap-2"
            >
              {currentStep === steps.length - 1 ? "Launch Agent" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
