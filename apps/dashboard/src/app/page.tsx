"use client";

import React from "react";
import { Plus, Shield, Activity, Wallet, Key, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function OverviewPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Organization Overview</h1>
          <p className="text-gray-500">Monitoring 12 active autonomous agents across Kaspa Network.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
            Download Report
          </button>
          <button className="relative group overflow-hidden bg-white text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus className="w-5 h-5" />
            <span>Create Agent</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Balance" value="45,200 KAS" change="+12.5%" icon={<Wallet className="w-4 h-4" />} />
        <StatCard title="Monthly Spending" value="8,400 KAS" change="-2.1%" icon={<Activity className="w-4 h-4" />} />
        <StatCard title="Active Agents" value="12" change="0%" icon={<Shield className="w-4 h-4" />} />
        <StatCard title="API Requests" value="1.2M" change="+45%" icon={<Key className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Recent Transactions
              </h2>
              <button className="text-sm text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-1">
              <TransactionRow agent="ArbitrageBot_01" to="kaspa:qp32..." amount="1,200.00 KAS" status="confirmed" date="2m ago" />
              <TransactionRow agent="LiquidityManager" to="kaspa:qr88..." amount="45.50 KAS" status="confirmed" date="15m ago" />
              <TransactionRow agent="TradingAgent_X" to="kaspa:q001..." amount="2,000.00 KAS" status="failed" date="1h ago" />
              <TransactionRow agent="ArbitrageBot_01" to="kaspa:qp32..." amount="800.00 KAS" status="broadcasted" date="2h ago" />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/5 rounded-2xl p-6">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Current Plan</h3>
            <div className="mb-6">
              <div className="text-2xl font-bold mb-1">Developer Free</div>
              <div className="text-sm text-gray-500">1,240 / 10,000 free requests used</div>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full mb-6">
              <div className="bg-white h-full w-[12%] rounded-full shadow-[0_0_10px_white]" />
            </div>
            <button className="w-full bg-white text-black py-2.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">
              Upgrade to Pro
            </button>
          </div>

          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">System Health</h3>
            <div className="space-y-4">
              <HealthItem label="API Gateway" status="operational" />
              <HealthItem label="Signer Worker" status="operational" />
              <HealthItem label="Kaspa Node" status="degraded" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: any) {
  return (
    <div className="bg-[#111] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded",
          change.startsWith("+") ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"
        )}>
          {change}
        </span>
      </div>
      <div className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-1">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function TransactionRow({ agent, to, amount, status, date }: any) {
  return (
    <div className="grid grid-cols-4 items-center py-4 px-3 hover:bg-white/[0.02] rounded-xl transition-colors">
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{agent}</span>
        <span className="text-[10px] text-gray-500 font-mono">{date}</span>
      </div>
      <span className="text-xs text-gray-400 font-mono">{to}</span>
      <span className="text-sm font-bold text-right pr-8">{amount}</span>
      <div className="flex justify-end">
        <span className={cn(
          "text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-tighter",
          status === "confirmed" ? "bg-green-500/10 text-green-500" :
          status === "failed" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
        )}>
          {status}
        </span>
      </div>
    </div>
  );
}

function HealthItem({ label, status }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase text-gray-500">{status}</span>
        <div className={cn(
          "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
          status === "operational" ? "bg-green-500 shadow-green-500" : "bg-yellow-500 shadow-yellow-500"
        )} />
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
