"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export function CreateAgentModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-lg rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/20 via-white to-white/20" />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Deploy New Agent</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Agent Name</label>
            <input 
              type="text" 
              placeholder="e.g. Research-Agent-v1" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/60">Initial Budget (KAS)</label>
            <input 
              type="number" 
              placeholder="1000" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Daily Limit</label>
              <input 
                type="number" 
                placeholder="200" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Network</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-all appearance-none">
                <option>Kaspa Mainnet</option>
                <option>Kaspa Testnet</option>
              </select>
            </div>
          </div>

          <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all mt-4">
            Initialize Agent Rail
          </button>
        </form>
      </div>
    </div>
  );
}
