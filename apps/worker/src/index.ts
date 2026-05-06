import { Worker, Job } from "bullmq";
import { PolicyEngine } from "@agentrail/policy-engine";
import { WalletManager, MockKMSProvider } from "@agentrail/wallet-core";
import { db } from "@agentrail/db";
import { transactions, agents, agentWallets, policies, auditLogs } from "@agentrail/db";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const policyEngine = new PolicyEngine();
const walletManager = new WalletManager(new MockKMSProvider());

/**
 * Signer Worker
 * Isolated environment for policy enforcement and transaction signing.
 */
const paymentWorker = new Worker("payment-queue", async (job: Job) => {
  const { transactionId } = job.data;
  
  console.log(`[Worker] Starting job ${job.id} for transaction ${transactionId}`);

  // 1. Load context with atomicity
  const [tx] = await db.select().from(transactions).where(eq(transactions.id, transactionId));
  if (!tx || tx.status !== "pending") {
    console.warn(`[Worker] Transaction ${transactionId} not found or already processed. Skipping.`);
    return;
  }

  const [agent] = await db.select().from(agents).where(eq(agents.id, tx.agentId));
  const [wallet] = await db.select().from(agentWallets).where(eq(agentWallets.agentId, tx.agentId));
  const [policy] = await db.select().from(policies).where(eq(policies.agentId, tx.agentId));

  try {
    // 2. Policy Enforcement (Critical Path)
    const evaluation = policyEngine.evaluatePaymentPolicy(tx as any, policy as any, agent.status as any);
    
    if (evaluation.blocked) {
      await db.update(transactions).set({ status: "blocked", updatedAt: new Date() }).where(eq(transactions.id, tx.id));
      await createAuditEntry(agent.orgId, agent.id, "payment.blocked", { reason: evaluation.reason, txId: tx.id });
      throw new Error(`Execution Blocked: ${evaluation.reason}`);
    }

    // 3. Reserve Budget (Logical Lock)
    await policyEngine.reserveBudget(tx as any, policy as any);

    // 4. Update Status: Signing
    await db.update(transactions).set({ status: "signed", updatedAt: new Date() }).where(eq(transactions.id, tx.id));

    // 5. Secure Signing (In-Memory ONLY)
    // Secret is decrypted, used, and the variable goes out of scope for GC
    const signature = await walletManager.signPaymentTx(wallet.encryptedSecret, tx);
    
    // 6. Broadcast
    await db.update(transactions).set({ status: "broadcasted", updatedAt: new Date() }).where(eq(transactions.id, tx.id));
    const txHash = await walletManager.broadcastPaymentTx(signature);

    // 7. Finalize
    await db.update(transactions).set({ 
      status: "confirmed", 
      txHash, 
      updatedAt: new Date() 
    }).where(eq(transactions.id, tx.id));

    await policyEngine.markBudgetSpent(tx as any);
    await createAuditEntry(agent.orgId, agent.id, "payment.approved", { txHash, amount: tx.amount });

    return { txHash };

  } catch (error: any) {
    console.error(`[Worker] Transaction ${transactionId} failed: ${error.message}`);
    
    // Recovery: Release budget if it was reserved but broadcast failed
    if (tx.status !== "confirmed") {
      await policyEngine.releaseBudgetReservation(tx as any);
      await db.update(transactions).set({ status: "failed", updatedAt: new Date() }).where(eq(transactions.id, tx.id));
      await createAuditEntry(agent.orgId, agent.id || "", "payment.failed", { error: error.message, txId: tx.id });
    }
    
    throw error; // Let BullMQ handle retries if safe
  }
}, {
  connection: process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  concurrency: 5, // Limit parallel signing to prevent nonce issues
});

/**
 * Helper: Immutable Audit Entry
 */
async function createAuditEntry(orgId: string, agentId: string, event: string, details: any) {
  await db.insert(auditLogs).values({
    id: uuidv4(),
    orgId,
    agentId,
    actorId: agentId, // The agent itself is the actor
    event,
    details,
  } as any);
}

console.log("🚀 AgentRail Signer Worker Operational");
