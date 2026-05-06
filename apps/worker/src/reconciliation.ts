import path from "node:path";
import dotenv from "dotenv";

// Load from monorepo root
dotenv.config({ path: path.join(__dirname, "../../../.env") });
dotenv.config();

import { db, transactions, auditLogs } from "../../../packages/db/src/index";

import { eq, and, or, lt, sql, ne, inArray } from "drizzle-orm";
import { WalletManager } from "@agentrail/wallet-core";
import { createKMSProvider } from "@agentrail/kms";
import { PolicyEngine } from "@agentrail/policy-engine";
import { WebhookService } from "@agentrail/webhooks";
import { v4 as uuidv4 } from "uuid";
import { HeartbeatManager } from "./heartbeat";

const kmsProvider = createKMSProvider();
let walletManager: WalletManager;
let policyEngine: PolicyEngine;
let heartbeat: HeartbeatManager;
let webhookService: WebhookService;

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes for stuck states

/**
 * RECONCILIATION WORKER

 * Periodically checks for transactions in intermediate states and reconciles with the blockchain.
 */
export async function runReconciliation() {
  if (!heartbeat) {
    const kmsProvider = createKMSProvider();
    webhookService = new WebhookService(process.env.REDIS_URL);
    walletManager = new WalletManager(kmsProvider);
    policyEngine = new PolicyEngine();
    heartbeat = new HeartbeatManager("reconciliation-worker");
    heartbeat.start();
  }

  console.log("🔍 [Reconciliation] Starting scan for intermediate transactions...");
  await heartbeat.pulse("busy");


  // 1. Fetch transactions in non-terminal states
  const pendingTxs = await db
    .select()
    .from(transactions)
    .where(
      inArray(transactions.status, ["queued", "signing", "signed", "broadcasted"])
    );

  console.log(`🔍 [Reconciliation] Found ${pendingTxs.length} transactions to check.`);

  for (const tx of pendingTxs) {
    try {
      await db.transaction(async (sqlTx) => {
        // Lock the row
        const [lockedTx] = await sqlTx
          .select()
          .from(transactions)
          .where(eq(transactions.id, tx.id))
          .for("update", { skipLocked: true });

        if (!lockedTx) return;

        const now = new Date();
        const age = now.getTime() - new Date(lockedTx.updatedAt).getTime();

        // 2. CASE: Broadcasted - Check Network
        if (lockedTx.status === "broadcasted") {
          if (!lockedTx.txHash) {
            console.error(`[Reconciliation] TX ${lockedTx.id} in broadcasted state but NO txHash!`);
            return;
          }

          const networkInfo = await walletManager.getTxInfo(lockedTx.txHash);
          
          if (networkInfo?.confirmed) {
            console.log(`✅ [Reconciliation] TX ${lockedTx.id} confirmed on chain!`);
            await sqlTx
              .update(transactions)
              .set({
                status: "confirmed",
                confirmedAt: now,
                kaspaBlockHash: networkInfo.blockHash,
                kaspaMetadata: networkInfo.metadata,
                lastCheckedAt: now,
                checkCount: lockedTx.checkCount + 1,
                updatedAt: now,
              })
              .where(eq(transactions.id, lockedTx.id));

            await webhookService.trigger(lockedTx.orgId, "payment.confirmed", {
              txId: lockedTx.id,
              txHash: lockedTx.txHash,
              amount: lockedTx.amount,
            }, lockedTx.id);

            await createAuditEntry(sqlTx, lockedTx.orgId, lockedTx.agentId, "payment.reconciled.confirmed", {
              txId: lockedTx.id,
              txHash: lockedTx.txHash,
            });
          } else {
            console.log(`⏳ [Reconciliation] TX ${lockedTx.id} still pending on chain.`);
            await sqlTx
              .update(transactions)
              .set({
                lastCheckedAt: now,
                checkCount: lockedTx.checkCount + 1,
                updatedAt: now,
              })
              .where(eq(transactions.id, lockedTx.id));
          }
        } 
        
        // 3. CASE: Stuck in Queued/Signing/Signed - Handle Timeouts
        else if (age > TIMEOUT_MS) {
          console.warn(`⚠️ [Reconciliation] TX ${lockedTx.id} stuck in ${lockedTx.status} for ${Math.round(age/1000)}s. Failing...`);
          
          // Before failing, we MUST release the budget because it was never broadcasted
          await policyEngine.releaseBudgetReservation(lockedTx.agentId, lockedTx.amount);

          await webhookService.trigger(lockedTx.orgId, "budget.released", {
            agentId: lockedTx.agentId,
            amount: lockedTx.amount,
            txId: lockedTx.id,
            reason: "timeout_stuck_state",
          }, lockedTx.id);

          await sqlTx
            .update(transactions)
            .set({
              status: "failed",
              failureReason: `Reconciliation timeout: Stuck in ${lockedTx.status} for too long.`,
              failedAt: now,
              updatedAt: now,
            })
            .where(eq(transactions.id, lockedTx.id));

          await webhookService.trigger(lockedTx.orgId, "payment.failed", {
            txId: lockedTx.id,
            reason: "timeout_stuck_state",
          }, lockedTx.id);

          await createAuditEntry(sqlTx, lockedTx.orgId, lockedTx.agentId, "payment.reconciled.failed", {
            txId: lockedTx.id,
            reason: "timeout_stuck_state",
          });
        }
      });
    } catch (error: any) {
      console.error(`❌ [Reconciliation] Error processing TX ${tx.id}:`, error.message);
    }
  }
  
  await heartbeat.pulse("idle");
}

async function createAuditEntry(sqlTx: any, orgId: string, actorId: string, event: string, details: any) {
  await sqlTx.insert(auditLogs).values({
    id: uuidv4(),
    orgId,
    actorId,
    event,
    details,
    createdAt: new Date(),
  });
}
