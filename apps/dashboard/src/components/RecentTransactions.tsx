import { Transaction } from "@agentrail/types";
import { CheckCircle2, Clock, XCircle, ArrowUpRight } from "lucide-react";

export function RecentTransactions({ transactions }: { transactions: any[] }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-xl font-bold">Transaction History</h2>
        <button className="text-sm text-white/40 hover:text-white transition-all">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/30 text-xs uppercase tracking-widest border-b border-white/5">
              <th className="px-6 py-4 font-medium">Agent</th>
              <th className="px-6 py-4 font-medium">Target Address</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/[0.02] transition-all group">
                <td className="px-6 py-4">
                  <span className="font-medium text-white/80">{tx.agentName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-xs text-white/40">{tx.toAddress.slice(0, 10)}...{tx.toAddress.slice(-8)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold">{tx.amount} KAS</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-white/30">{tx.time}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    CONFIRMED: "bg-green-500/10 text-green-500 border-green-500/20",
    PENDING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
    REJECTED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  }[status] || "bg-white/10 text-white/60 border-white/20";

  const Icon = {
    CONFIRMED: CheckCircle2,
    PENDING: Clock,
    FAILED: XCircle,
    REJECTED: XCircle,
  }[status] || Clock;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles}`}>
      <Icon className="w-3 h-3" />
      {status}
    </div>
  );
}
