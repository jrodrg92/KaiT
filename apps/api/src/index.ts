import path from "node:path";
import dotenv from "dotenv";

// Load environment variables BEFORE any other imports
const rootEnv = path.join(process.cwd(), ".env");
const pkgEnv = path.join(__dirname, "../../../.env");

dotenv.config({ path: rootEnv });
dotenv.config({ path: pkgEnv });
dotenv.config();


// 2. NOW REQUIRE MODULES THAT NEED ENV
const { Hono } = require("hono");
const { logger: honoLogger } = require("hono/logger");
const { cors } = require("hono/cors");
const { z } = require("zod");
const { zValidator } = require("@hono/zod-validator");
const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const { v4: uuidv4 } = require("uuid");

/**
 * -----------------------------------
 * ENVIRONMENT VALIDATION
 * -----------------------------------
 */
if (!process.env.REDIS_URL) throw new Error("❌ REDIS_URL is required");

if ((process.env.LOCAL_KMS_MASTER_KEY?.length || 0) < 32) {
  console.warn("⚠️ [Security] LOCAL_KMS_MASTER_KEY is too short or missing. Using development defaults.");
}


const { db } = require("@agentrail/db");
const {
  agents,
  agentWallets,
  transactions,
  apiKeys,
  usageLogs,
  auditLogs,
  webhookEvents,
  workerHeartbeats,
} = require("@agentrail/db/schema");




const { eq, and, sql, lt, desc, gte } = require("drizzle-orm");

const {
  authMiddleware,
  AuthContext,
  generateApiKey,
  requireScope,
} = require("./auth");

const {
  WalletManager,
  MockKMSProvider,
} = require("@agentrail/wallet-core");

const { PolicyEngine } = require("@agentrail/policy-engine");
const { createKMSProvider } = require("@agentrail/kms");
const { WebhookService } = require("@agentrail/webhooks");


const kmsProvider = createKMSProvider();

const webhookService = new WebhookService(process.env.REDIS_URL);
const walletManager = new WalletManager(kmsProvider);
const policyEngine = new PolicyEngine();

const app = new Hono<{
  Variables: {
    auth: AuthContext;
  };
}>();

/**
 * -----------------------------------
 * PAGINATION & FILTERING UTILS
 * -----------------------------------
 */
const PaginationSchema = z.object({
  limit: z.string().optional().default("50").transform(Number).pipe(z.number().max(100)),
  offset: z.string().optional().default("0").transform(Number),
  status: z.string().optional(),
  agentId: z.string().uuid().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
});


type PaginationParams = z.infer<typeof PaginationSchema>;

function getPaginatedResponse<T>(data: T[], params: PaginationParams) {
  return {
    data,
    pagination: {
      limit: params.limit,
      offset: params.offset,
      hasMore: data.length >= params.limit,
    },
  };
}




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

const paymentQueue = new Queue("payment-queue", {
  connection: redisConnection,
  skipVersionCheck: true,
});

/**
 * -----------------------------------
 * MIDDLEWARE
 * -----------------------------------
 */


app.use("*", honoLogger());
app.use("*", cors());

/**
 * -----------------------------------
 * OBSERVABILITY & HEALTH
 * -----------------------------------
 */

app.get("/health", (c) => c.json({ status: "AgentRail API v1 Operational", timestamp: new Date().toISOString() }));

app.get("/health/db", async (c) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({ status: "healthy", service: "postgresql" });
  } catch (error) {
    return c.json({ status: "unhealthy", service: "postgresql", error: (error as Error).message }, 503);
  }
});

app.get("/health/redis", async (c) => {
  try {
    const status = await redisConnection.ping();
    return c.json({ status: "healthy", service: "redis", response: status });
  } catch (error) {
    return c.json({ status: "unhealthy", service: "redis", error: (error as Error).message }, 503);
  }
});

app.get("/health/workers", async (c) => {
  const heartbeats = await db.select().from(workerHeartbeats);
  const now = Date.now();
  const statuses = heartbeats.map(h => ({
    name: h.workerName,
    status: (now - h.lastSeenAt.getTime() < 120000) ? "healthy" : "missing",
    lastSeen: h.lastSeenAt,
  }));
  
  const allHealthy = statuses.every(s => s.status === "healthy");
  return c.json({ status: allHealthy ? "healthy" : "degraded", workers: statuses }, allHealthy ? 200 : 207);
});

app.get("/metrics", async (c) => {
  // Aggregate payment metrics
  const txStats = await db.select({ 
    status: transactions.status, 
    count: sql`count(*)` 
  }).from(transactions).groupBy(transactions.status);

  // Stuck payments (queued > 5m)
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
  const [stuckQueued] = await db.select({ count: sql`count(*)` })
    .from(transactions)
    .where(and(eq(transactions.status, "queued"), lt(transactions.createdAt, fiveMinsAgo)));

  // Webhook stats
  const webhookStats = await db.select({ 
    status: webhookEvents.status, 
    count: sql`count(*)` 
  }).from(webhookEvents).groupBy(webhookEvents.status);

  return c.json({
    payments: {
      byStatus: txStats,
      stuckQueued: stuckQueued.count,
    },
    webhooks: {
      byStatus: webhookStats,
    },
    timestamp: new Date().toISOString()
  });
});


/**
 * -----------------------------------
 * PRIVATE ROUTES
 * -----------------------------------
 */

app.use("/v1/*", authMiddleware);

/**
 * -----------------------------------
 * AGENTS
 * -----------------------------------
 */

app.post(
  "/v1/agents",
  zValidator(
    "json",
    z.object({
      name: z.string().min(3),
      metadata: z.record(z.any()).optional(),
    })
  ),
  async (c) => {
    const auth = c.get("auth");
    const { name, metadata } = c.req.valid("json");

    /**
     * 1. Generate secure wallet via KMS
     */
    const { address, encryptedKey } =
      await walletManager.createAgentWallet();

    /**
     * 2. Persist agent
     */
    const agentId = uuidv4();

    await db.transaction(async (tx) => {
      await tx.insert(agents).values({
        id: agentId,
        orgId: auth.orgId,
        name,
        status: "active",
        metadata,
      } as any);

      await tx.insert(agentWallets).values({
        agentId,
        address,
        encryptedSecret: encryptedKey.ciphertext,
        iv: encryptedKey.iv,
        authTag: encryptedKey.authTag,
        keyVersion: encryptedKey.keyVersion,
      });
    });


    return c.json(
      {
        id: agentId,
        address,
        status: "active",
      },
      201
    );
  }
);

app.get(
  "/v1/agents",
  zValidator("query", PaginationSchema),
  async (c) => {
    const auth = c.get("auth");
    const params = c.req.valid("query");

    let query = db
      .select()
      .from(agents)
      .where(eq(agents.orgId, auth.orgId))
      .limit(params.limit)
      .offset(params.offset)
      .orderBy(desc(agents.createdAt));

    if (params.createdAfter) {
      query = query.where(gte(agents.createdAt, new Date(params.createdAfter)));
    }
    if (params.createdBefore) {
      query = query.where(lt(agents.createdAt, new Date(params.createdBefore)));
    }

    const list = await query;
    return c.json(getPaginatedResponse(list, params));
  }
);


app.post("/v1/agents/:id/revoke", async (c) => {
  const auth = c.get("auth");
  const agentId = c.req.param("id");

  await db
    .update(agents)
    .set({
      status: "revoked",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(agents.id, agentId),
        eq(agents.orgId, auth.orgId)
      )
    );

  return c.json({
    status: "revoked",
  });
});

/**
 * -----------------------------------
 * PAYMENTS
 * -----------------------------------
 */

app.post(
  "/v1/payments",
  zValidator(
    "json",
    z.object({
      agentId: z.string().uuid(),
      toAddress: z.string(),
      amount: z.string(),
      idempotencyKey: z.string().min(1),
    })
  ),
  async (c) => {
    const auth = c.get("auth");
    const data = c.req.valid("json");

    /**
     * 1. PRE-FLIGHT CHECK
     */
    const [agent] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, data.agentId), eq(agents.orgId, auth.orgId)));

    if (!agent) return c.json({ error: "Agent not found" }, 404);
    if (agent.status !== "active") return c.json({ error: "Agent inactive" }, 403);

    const policyEngine = new PolicyEngine();
    const txId = uuidv4();

    try {
      /**
       * 2. ATOMIC DATABASE OPERATION
       */
      const result = await db.transaction(async (sqlTx) => {
        // A. IDEMPOTENCY CHECK
        const [newTx] = await sqlTx
          .insert(transactions)
          .values({
            id: txId,
            orgId: auth.orgId,
            agentId: data.agentId,
            idempotencyKey: data.idempotencyKey,
            toAddress: data.toAddress,
            amount: data.amount,
            status: "created",
          } as any)
          .onConflictDoNothing({ target: [transactions.orgId, transactions.idempotencyKey] })
          .returning();

        if (!newTx) {
          const [existingTx] = await sqlTx
            .select()
            .from(transactions)
            .where(
              and(
                eq(transactions.orgId, auth.orgId),
                eq(transactions.idempotencyKey, data.idempotencyKey)
              )
            );
          return { existing: true, tx: existingTx };
        }

        // B. ATOMIC BUDGET RESERVATION
        const reservation = await policyEngine.reserveBudget(agent.id, data.amount);
        if (!reservation.success) {
          throw new Error(reservation.reason || "POLICY_VIOLATION");
        }

        await webhookService.trigger(auth.orgId, "budget.reserved", {
          agentId: agent.id,
          amount: data.amount,
          txId,
        }, txId);

        // C. Update status to reserved
        await sqlTx
          .update(transactions)
          .set({ status: "budget_reserved" })
          .where(eq(transactions.id, txId));

        return { existing: false, tx: newTx };
      });

      if (result.existing) {
        return c.json(
          {
            id: result.tx?.id,
            status: result.tx?.status,
            message: "Existing transaction returned (idempotency)",
          },
          200
        );
      }

      /**
       * 3. QUEUE COORDINATION
       */
      await paymentQueue.add(
        "process-payment",
        { transactionId: txId },
        {
          jobId: data.idempotencyKey,
          attempts: 5,
          backoff: { type: "exponential", delay: 2000 },
        }
      );

      // Final state update
      await db.update(transactions)
        .set({ status: "queued" })
        .where(eq(transactions.id, txId));

      await webhookService.trigger(auth.orgId, "payment.queued", {
        agentId: data.agentId,
        amount: data.amount,
        txId,
      }, txId);

      return c.json(
        {
          id: txId,
          status: "queued",
          message: "Payment authorized and queued for signing",
        },
        202
      );
    } catch (error: any) {
      return c.json({ error: error.message || "Failed to process payment" }, 400);
    }
  }
);

app.get(
  "/v1/transactions",
  zValidator("query", PaginationSchema),
  async (c) => {
    const auth = c.get("auth");
    const params = c.req.valid("query");

    let query = db
      .select()
      .from(transactions)
      .where(eq(transactions.orgId, auth.orgId))
      .limit(params.limit)
      .offset(params.offset)
      .orderBy(desc(transactions.createdAt));

    if (params.status) {
      // @ts-ignore
      query = query.where(eq(transactions.status, params.status));
    }
    if (params.agentId) {
      query = query.where(eq(transactions.agentId, params.agentId));
    }
    if (params.createdAfter) {

      query = query.where(gte(transactions.createdAt, new Date(params.createdAfter)));
    }
    if (params.createdBefore) {
      query = query.where(lt(transactions.createdAt, new Date(params.createdBefore)));
    }

    const list = await query;
    return c.json(getPaginatedResponse(list, params));
  }
);


/**
 * -----------------------------------
 * API KEYS
 * -----------------------------------
 */

app.post(
  "/v1/api-keys",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      type: z.enum(["live", "test"]),
    })
  ),
  async (c) => {
    const auth = c.get("auth");

    const { name, type } =
      c.req.valid("json");

    const {
      rawKey,
      keyHash,
      keyPrefix,
    } = generateApiKey(
      auth.orgId,
      name,
      type
    );

    await db.insert(apiKeys).values({
      id: uuidv4(),
      orgId: auth.orgId,
      name,
      keyHash,
      keyPrefix,
      type,
      isActive: true,
    } as any);

    return c.json(
      {
        apiKey: rawKey,
        message:
          "Save this key now. It won't be shown again.",
      },
      201
    );
  }
);

/**
 * -----------------------------------
 * USAGE
 * -----------------------------------
 */

app.get("/v1/usage", async (c) => {
  const auth = c.get("auth");

  const logs = await db
    .select()
    .from(usageLogs)
    .where(eq(usageLogs.orgId, auth.orgId));

  return c.json({
    count: logs.length,
    limit: 1000,
  });
});

/**
 * -----------------------------------
 * ADMIN API (READ-ONLY)
 * -----------------------------------
 */

const admin = new Hono<{ Variables: { auth: AuthContext } }>();
admin.use("*", requireScope("admin:read"));

// Audit Logger Middleware for Admin
admin.use("*", async (c, next) => {
  const auth = c.get("auth") as AuthContext;
  await next();
  
  await db.insert(auditLogs).values({
    id: uuidv4(),
    orgId: auth.orgId,
    actorId: "admin",
    event: `admin.access.${c.req.path.replace("/admin/", "").replace(/\//g, ".")}`,
    details: {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
    },
  });
});

admin.get("/payments", zValidator("query", PaginationSchema), async (c) => {
  const params = c.req.valid("query");
  let query = db
    .select()
    .from(transactions)
    .limit(params.limit)
    .offset(params.offset)
    .orderBy(desc(transactions.createdAt));
  
  if (params.status) {
    // @ts-ignore
    query = query.where(eq(transactions.status, params.status));
  }

  if (params.agentId) {
    query = query.where(eq(transactions.agentId, params.agentId));
  }
  
  const results = await query;

  return c.json(getPaginatedResponse(results.map(tx => ({ ...tx, kaspaMetadata: undefined })), params));
});

admin.get("/payments/:id", async (c) => {
  const [tx] = await db.select().from(transactions).where(eq(transactions.id, c.req.param("id")));
  if (!tx) return c.json({ error: "Not found" }, 404);
  return c.json(tx);
});

admin.get("/workers", async (c) => {
  const heartbeats = await db.select().from(workerHeartbeats);
  return c.json(heartbeats);
});

admin.get("/webhooks/events", zValidator("query", PaginationSchema), async (c) => {
  const params = c.req.valid("query");
  let query = db
    .select()
    .from(webhookEvents)
    .limit(params.limit)
    .offset(params.offset)
    .orderBy(desc(webhookEvents.createdAt));
  
  if (params.status) {
    // @ts-ignore
    query = query.where(eq(webhookEvents.status, params.status));
  }

  const events = await query;
  return c.json(getPaginatedResponse(events, params));
});

admin.get("/audit-logs", zValidator("query", PaginationSchema), async (c) => {
  const params = c.req.valid("query");
  const logs = await db
    .select()
    .from(auditLogs)
    .limit(params.limit)
    .offset(params.offset)
    .orderBy(desc(auditLogs.createdAt));

  return c.json(getPaginatedResponse(logs, params));
});


app.route("/admin", admin);

/**
 * -----------------------------------
 * SERVER EXPORT
 * -----------------------------------
 */


const { serve } = require("@hono/node-server");

const port = 3001;
console.log(`🚂 AgentRail API v1 started on port ${port}`);

serve({
  fetch: app.fetch,
  port
});

export default app;