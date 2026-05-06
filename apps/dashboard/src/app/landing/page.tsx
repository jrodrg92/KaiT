"use client";

import React from "react";
import { 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Globe,
  Database,
  Lock,
  ChevronRight,
  Github
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050607] text-white selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#050607]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Terminal className="w-5 h-5" />
            </div>
            <span>AgentRail</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#docs" className="hover:text-foreground transition-colors">Documentation</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/">
              <Button size="sm" className="rounded-full px-5">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 to-transparent blur-[120px] -z-10 opacity-30" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] -z-10 opacity-20" />
        
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
            <Zap className="w-3 h-3" />
            Autonomous Payment Infrastructure
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Programmable <span className="text-primary">Money Rails</span> for AI Agents.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            The first developer platform for autonomous AI agent wallet management and spending policies on Kaspa. Secure, fast, and 100% programmable.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link href="/">
              <Button size="lg" className="rounded-full h-14 px-8 text-base gap-2 font-bold group shadow-[0_0_20px_rgba(112,199,166,0.3)]">
                Launch Console
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-base gap-2 bg-white/5">
              <Github className="w-5 h-5" />
              View on GitHub
            </Button>
          </div>

          {/* Console Preview Image Placeholer */}
          <div className="pt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#080A0D] p-2 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#050607] via-transparent to-transparent z-10" />
              <div className="bg-[#0B0E12] rounded-xl overflow-hidden border border-white/5 aspect-video flex items-center justify-center relative">
                 {/* Visual content placeholder - this would be a screenshot in a real app */}
                 <div className="flex flex-col items-center gap-4">
                    <Terminal className="w-16 h-16 text-primary/20" />
                    <p className="text-muted-foreground font-mono text-sm">AgentRail Dashboard Preview</p>
                 </div>
                 {/* Decorative code lines */}
                 <div className="absolute left-6 top-6 space-y-2 opacity-20 hidden md:block">
                    <div className="w-48 h-2 bg-primary/40 rounded-full" />
                    <div className="w-32 h-2 bg-primary/20 rounded-full" />
                    <div className="w-40 h-2 bg-primary/30 rounded-full" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-[#080A0D]/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for the future of AI commerce.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Infrastructure that bridges the gap between Large Language Models and real-world financial settlement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Cpu className="w-6 h-6" />}
              title="Agent-Managed Wallets"
              description="Each agent gets a dedicated, non-custodial wallet secured by HSM and KMS infrastructure."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Granular Policy Engine"
              description="Define spending limits, velocity caps, and allowlists that are enforced at the network level."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Kaspa Speed"
              description="Leverage the fastest PoW network for sub-second transaction broadcast and high throughput."
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6" />}
              title="Secure Key Management"
              description="Enterprise-grade security with multi-party computation and policy-bound signing."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6" />}
              title="Universal Connectors"
              description="Seamlessly integrate with OpenAI, Anthropic, and LangChain via our developer-first API."
            />
            <FeatureCard 
              icon={<Database className="w-6 h-6" />}
              title="Compliance-Ready"
              description="Full audit logs, reporting, and webhook notifications for every autonomous payment."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="max-w-5xl mx-auto px-6 text-center space-y-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to build autonomous agents that can pay for themselves?</h2>
          <div className="flex items-center justify-center gap-6">
             <Link href="/">
              <Button size="lg" className="rounded-full px-10 h-14 font-bold text-lg">
                Get Started Now
              </Button>
             </Link>
          </div>
          <p className="text-muted-foreground text-sm font-mono italic">
            Join the Kaspa AI ecosystem today.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 font-bold text-lg opacity-50">
            <Terminal className="w-4 h-4" />
            <span>AgentRail</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">Discord</a>
          </div>
          <p className="text-xs text-muted-foreground opacity-50">
            © 2026 AgentRail Infrastructure. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl border border-white/5 bg-[#0B0E12] hover:border-primary/20 hover:bg-primary/[0.02] transition-all group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
