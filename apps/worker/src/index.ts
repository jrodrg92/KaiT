import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { PolicyEngine } from "@agentrail/policy-engine";
import {
  WalletManager,
  MockKMSProvider,
} from "@agentrail/wallet-core";
import { db } from "@agentrail/db";
import {
  transactions,
  agents,
  agentWallets,
  policies,
  auditLogs,
} from "@agentrail/db";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

/**
 * -----------------------------------
 * REDIS / BULLMQ CONNECTION
 * -----------------------------------
 */

const redisConnection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })
  : new IORedis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });


/**
 * -----------------------------------
 * SERVICES
 * -----------------------------------
 */

const policyEngine = new PolicyEngine();

const walletManager = new WalletManager(
  new MockKMSProvider()
);

/**
 * Signer Worker
 * Isolated environment for policy enforcement and transaction signing.
 */
const paymentWorker = new Worker(
  "payment-queue",
  async (job: Job) => {
    const { transactionId } = job.data;

    console.log(
      `[Worker] Starting job ${job.id} for transaction ${transactionId}`
    );

    /**
     * 1. Load transaction context
     */
    const [tx] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId));

    if (!tx || tx.status !== "pending") {
      console.warn(
        `[Worker] Transaction ${transactionId} not found or already processed. Skipping.`
      );
      return;
    }

    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, tx.agentId));

    if (!agent) {
      throw new Error(
        `Agent ${tx.agentId} not found for transaction ${tx.id}`
      );
    }

    const [wallet] = await db
      .select()
      .from(agentWallets)
      .where(eq(agentWallets.agentId, tx.agentId));

    if (!wallet) {
      throw new Error(
        `Wallet not found for agent ${tx.agentId}`
      );
    }

    const [policy] = await db
      .select()
      .from(policies)
      .where(eq(policies.agentId, tx.agentId));

    let budgetReserved = false;

    try {
      /**
       * 2. Policy Enforcement
       */
      const evaluation =
        policyEngine.evaluatePaymentPolicy(
          tx as any,
          policy as any,
          agent.status as any
        );

      if (evaluation.blocked) {
        await db
          .update(transactions)
          .set({
            status: "blocked",
            updatedAt: new Date(),
          })
          .where(eq(transactions.id, tx.id));

        await createAuditEntry(
          agent.orgId,
          agent.id,
          "payment.blocked",
          {
            reason: evaluation.reason,
            txId: tx.id,
          }
        );

        return {
          blocked: true,
          reason: evaluation.reason,
        };
      }

      /**
       * 3. Reserve Budget
       */
      await policyEngine.reserveBudget(
        tx as any,
        policy as any
      );

      budgetReserved = true;

      /**
       * 4. Update Status: Signing
       */
      await db
        .update(transactions)
        .set({
          status: "signed",
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, tx.id));

      /**
       * 5. Secure Signing
       *
       * Secret is decrypted inside WalletManager,
       * used in memory only, and never logged.
       */
      const signature =
        await walletManager.signPaymentTx(
          wallet.encryptedSecret,
          tx
        );

      /**
       * 6. Broadcast
       */
      await db
        .update(transactions)
        .set({
          status: "broadcasted",
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, tx.id));

      const txHash =
        await walletManager.broadcastPaymentTx(
          signature
        );

      /**
       * 7. Finalize
       */
      await db
        .update(transactions)
        .set({
          status: "confirmed",
          txHash,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, tx.id));

      await policyEngine.markBudgetSpent(tx as any);

      await createAuditEntry(
        agent.orgId,
        agent.id,
        "payment.approved",
        {
          txHash,
          amount: tx.amount,
          txId: tx.id,
        }
      );

      return {
        txHash,
      };
    } catch (error: any) {
      console.error(
        `[Worker] Transaction ${transactionId} failed: ${error.message}`
      );

      /**
       * Recovery:
       * Only release reserved budget if reserveBudget succeeded.
       */
      if (budgetReserved) {
        await policyEngine.releaseBudgetReservation(
          tx as any
        );
      }

      await db
        .update(transactions)
        .set({
          status: "failed",
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, tx.id));

      await createAuditEntry(
        agent.orgId,
        agent.id,
        "payment.failed",
        {
          error: error.message,
          txId: tx.id,
        }
      );

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    skipVersionCheck: true,
  }

);

/**
 * -----------------------------------
 * WORKER EVENTS
 * -----------------------------------
 */

paymentWorker.on("completed", (job) => {
  console.log(
    `[Worker] Job ${job.id} completed`
  );
});

paymentWorker.on("failed", (job, error) => {
  console.error(
    `[Worker] Job ${job?.id} failed: ${error.message}`
  );
});

/**
 * -----------------------------------
 * AUDIT LOG HELPER
 * -----------------------------------
 */

async function createAuditEntry(
  orgId: string,
  agentId: string,
  event: string,
  details: unknown
) {
  await db.insert(auditLogs).values({
    id: uuidv4(),
    orgId,
    agentId,
    actorId: agentId,
    event,
    details,
  } as any);
}

console.log(
  "🚀 AgentRail Signer Worker Operational"
);