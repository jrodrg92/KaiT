import path from "node:path";
import dotenv from "dotenv";

// 1. LOAD ENVIRONMENT FIRST
const rootEnv = path.join(process.cwd(), ".env");
const pkgEnv = path.join(__dirname, "../../../.env");
dotenv.config({ path: rootEnv });
dotenv.config({ path: pkgEnv });
dotenv.config();

// 2. NOW REQUIRE MODULES THAT NEED ENV
const { db, transactions, auditLogs, agents, agentWallets, policies } = require("../../../packages/db/src/index");
const { eq, and } = require("drizzle-orm");
const { WalletManager } = require("@agentrail/wallet-core");
const { createKMSProvider } = require("@agentrail/kms");
const { runReconciliation } = require("./reconciliation");
const { WebhookService } = require("@agentrail/webhooks");
const { HeartbeatManager } = require("./heartbeat");
const { PolicyEngine } = require("@agentrail/policy-engine");
const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { v4: uuidv4 } = require("uuid");


const workerType = process.env.WORKER_TYPE || "all";


/**
 * START RECONCILIATION LOOP
 * Runs every 60 seconds to find and fix stuck transactions.
 */
if (workerType === "all" || workerType === "recon") {
  const reconHeartbeat = new HeartbeatManager("reconciliation-worker");
  reconHeartbeat.start();
  
  setInterval(() => {
    runReconciliation().catch((err) => console.error("[Reconciliation Loop Error]", err));
  }, 60000);
  console.log("🔄 [Worker] Reconciliation Loop Started");
}


const kmsProvider = createKMSProvider();
const webhookService = new WebhookService(process.env.REDIS_URL);
const walletManager = new WalletManager(kmsProvider);
const policyEngine = new PolicyEngine();

const redisConnection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false })
  : new IORedis({ host: "127.0.0.1", port: 6379, maxRetriesPerRequest: null, enableReadyCheck: false });

let paymentWorker: Worker | undefined;

if (workerType === "all" || workerType === "signer") {
  const signerHeartbeat = new HeartbeatManager("signer-worker");
  signerHeartbeat.start();

  paymentWorker = new Worker(
    "payment-queue",
    async (job: Job) => {
      const { transactionId } = job.data;
      console.log(`🚀 [Worker] Processing payment transaction: ${transactionId}`);
      await signerHeartbeat.pulse("busy", job.id);



    /**
     * 1. Load transaction context with row-level lock
     */
    const [tx] = await db.transaction(async (sqlTx) => {
      return await sqlTx
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId))
        .for("update");
    });

    if (!tx) {
      console.warn(`[Worker] Transaction ${transactionId} not found. Skipping.`);
      return;
    }

    // IDEMPOTENCY CHECK
    if (["broadcasted", "confirmed", "signed"].includes(tx.status)) {
      console.log(`[Worker] Transaction ${transactionId} already in state ${tx.status}. Skipping.`);
      return;
    }

    if (tx.status === "failed" || tx.status === "canceled") {
      console.warn(`[Worker] Transaction ${transactionId} is already terminal (${tx.status}).`);
      return;
    }

    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, tx.agentId));

    if (!agent) throw new Error(`Agent ${tx.agentId} not found`);

    const [wallet] = await db
      .select()
      .from(agentWallets)
      .where(eq(agentWallets.agentId, tx.agentId));

    if (!wallet) throw new Error(`Wallet not found for agent ${tx.agentId}`);

    const [policy] = await db
      .select()
      .from(policies)
      .where(eq(policies.agentId, tx.agentId));

    try {
      /**
       * 2. Final Policy Evaluation
       */
      const evaluation = policyEngine.evaluatePaymentPolicy(
        tx as any,
        policy as any,
        agent.status as any
      );

      if (evaluation.blocked) {
        throw new Error(`Policy violation: ${evaluation.reason}`);
      }

      /**
       * 3. Update Status: Signing
       */
      await db
        .update(transactions)
        .set({
          status: "signing",
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, tx.id));

      /**
       * 4. Secure Signing
       */
      const signature = await walletManager.signPaymentTx(
        {
          ciphertext: wallet.encryptedSecret,
          iv: wallet.iv,
          authTag: wallet.authTag,
          keyVersion: wallet.keyVersion,
        },
        tx
      );


      await db
        .update(transactions)
        .set({
          status: "signed",
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, tx.id));

      /**
       * 5. Broadcast
       */
      await db
        .update(transactions)
        .set({
          status: "broadcasted",
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, tx.id));

      const txHash = await walletManager.broadcastPaymentTx(signature);

      await webhookService.trigger(agent.orgId, "payment.broadcasted", {
        txId: tx.id,
        txHash,
        amount: tx.amount,
      }, tx.id);

      /**
       * 6. Finalize
       */
      await db
        .update(transactions)
        .set({
          status: "confirmed",
          txHash,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, tx.id));

      await policyEngine.markBudgetSpent(tx.id);

      await webhookService.trigger(agent.orgId, "payment.confirmed", {
        txId: tx.id,
        txHash,
        amount: tx.amount,
      }, tx.id);

      await createAuditEntry(agent.orgId, agent.id, "payment.confirmed", {
        txHash,
        amount: tx.amount,
        txId: tx.id,
      });

      return { txHash };
    } catch (error: any) {
      console.error(`[Worker] Transaction ${transactionId} failed: ${error.message}`);

      // RECOVERY LOGIC
      const [currentTx] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, tx.id));

      if (currentTx && !["broadcasted", "confirmed", "signed"].includes(currentTx.status)) {
        await policyEngine.releaseBudgetReservation(tx.agentId, tx.amount);
        await webhookService.trigger(agent.orgId, "budget.released", {
          agentId: agent.id,
          amount: tx.amount,
          txId: tx.id,
          reason: error.message,
        }, tx.id);
      }

      await db
        .update(transactions)
        .set({
          status: "failed",
          failureReason: error.message,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, tx.id));

      await webhookService.trigger(agent.orgId, "payment.failed", {
        txId: tx.id,
        error: error.message,
      }, tx.id);

      await createAuditEntry(agent.orgId, agent.id, "payment.failed", {
        error: error.message,
        txId: tx.id,
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    skipVersionCheck: true,
  }
 );

 paymentWorker.on("completed", (job) => {
   console.log(`✅ [Worker] Job completed: ${job.id}`);
 });


 paymentWorker.on("failed", (job, err) => {
   console.error(`❌ [Worker] Job failed: ${job?.id} - ${err.message}`);
 });

 console.log("🚀 AgentRail Signer Worker Operational");
}

if (workerType === "all" || workerType === "webhook") {
  const { startWebhookWorker } = require("./webhook-worker");
  startWebhookWorker().then(() => {
    console.log("🔗 [Worker] Webhook Delivery Worker Started");
  });
}


async function createAuditEntry(orgId: string, actorId: string, event: string, details: any) {
  await db.insert(auditLogs).values({
    id: uuidv4(),
    orgId,
    actorId,
    event,
    details,
    createdAt: new Date(),
  });
}