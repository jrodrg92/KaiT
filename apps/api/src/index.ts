import { Hono } from "hono";
import { logger as honoLogger } from "hono/logger";
import { cors } from "hono/cors";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

import { db } from "@agentrail/db";
import {
  agents,
  agentWallets,
  transactions,
  apiKeys,
  usageLogs,
  auditLogs,
} from "@agentrail/db";

import { eq, and } from "drizzle-orm";

import {
  authMiddleware,
  AuthContext,
  generateApiKey,
} from "./auth";

import {
  WalletManager,
  MockKMSProvider,
} from "@agentrail/wallet-core";

const app = new Hono<{
  Variables: {
    auth: AuthContext;
  };
}>();

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
 * SERVICES
 * -----------------------------------
 */

const walletManager = new WalletManager(
  new MockKMSProvider()
);

/**
 * -----------------------------------
 * MIDDLEWARE
 * -----------------------------------
 */

app.use("*", honoLogger());
app.use("*", cors());

/**
 * -----------------------------------
 * HEALTH CHECK
 * -----------------------------------
 */

app.get("/health", (c) =>
  c.json({
    status: "AgentRail API v1 Operational",
  })
);

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
     * 1. Generate secure wallet
     */
    const { address, encryptedSecret } =
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
        encryptedSecret,
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

app.get("/v1/agents", async (c) => {
  const auth = c.get("auth");

  const list = await db
    .select()
    .from(agents)
    .where(eq(agents.orgId, auth.orgId));

  return c.json(list);
});

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
      idempotencyKey: z.string().optional(),
    })
  ),
  async (c) => {
    const auth = c.get("auth");
    const data = c.req.valid("json");

    /**
     * Verify ownership
     */
    const [agent] = await db
      .select()
      .from(agents)
      .where(
        and(
          eq(agents.id, data.agentId),
          eq(agents.orgId, auth.orgId)
        )
      );

    if (!agent) {
      return c.json(
        {
          error: "Agent not found or unauthorized",
        },
        404
      );
    }

    if (agent.status !== "active") {
      return c.json(
        {
          error: "Agent is not active",
        },
        403
      );
    }

    /**
     * Create transaction
     */
    const txId = uuidv4();

    await db.insert(transactions).values({
      id: txId,
      agentId: data.agentId,
      toAddress: data.toAddress,
      amount: data.amount,
      status: "pending",
    } as any);

    /**
     * Queue payment
     */
    await paymentQueue.add(
      "process-payment",
      {
        transactionId: txId,
      },
      {
        jobId: data.idempotencyKey || txId,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );

    return c.json(
      {
        id: txId,
        status: "pending",
        message:
          "Transaction queued for signing",
      },
      202
    );
  }
);

app.get("/v1/transactions", async () => {
  const txs = await db
    .select()
    .from(transactions)
    .limit(50);

  return Response.json(txs);
});

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
 * SERVER EXPORT
 * -----------------------------------
 */

console.log(
  "🚂 AgentRail API v1 started on port 3001"
);

export default {
  port: 3001,
  fetch: app.fetch,
};