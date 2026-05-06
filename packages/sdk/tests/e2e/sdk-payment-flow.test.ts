import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { AgentRail, InsufficientBudgetError, PolicyViolationError } from "../../src/client";
import { db, transactions, agents, organizations, apiKeys, policies, webhookEvents } from "@agentrail/db";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * E2E TEST: SDK PAYMENT FLOW
 * This test validates the entire infrastructure from the perspective of an external developer.
 * It assumes the AgentRail API and Workers are running in the background.
 */
describe("E2E: SDK Payment Flow", () => {
  const TEST_ORG_ID = "00000000-0000-0000-0000-000000000000";
  const BASE_URL = "http://localhost:3001";
  let apiKey: string;
  let client: AgentRail;
  let testAgentId: string;

  beforeAll(async () => {
    console.log("🏗️ Seeding E2E test data...");
    
    // 1. Ensure test org exists
    await db.insert(organizations).values({ id: TEST_ORG_ID, name: "E2E Test Org" } as any).onConflictDoNothing();

    // 2. Create a test API Key
    const crypto = require("node:crypto");
    const rawKey = `ar_test_${uuidv4().substring(0, 8)}`;
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    
    apiKey = rawKey;
    await db.insert(apiKeys).values({
      id: uuidv4(),
      orgId: TEST_ORG_ID,
      name: "E2E Test Key",
      keyHash: keyHash,
      keyPrefix: "ar_test",
      type: "test",
      isActive: true,
    } as any);

    // 3. Create a test Agent
    testAgentId = uuidv4();
    await db.insert(agents).values({
      id: testAgentId,
      orgId: TEST_ORG_ID,
      name: "E2E Bot",
      status: "active",
    } as any);


    // 4. Create a Policy with 1000 KAS limit
    await db.insert(policies).values({
      id: uuidv4(),
      agentId: testAgentId,
      dailyLimit: "1000",
      monthlyLimit: "5000",
      spentDaily: "0",
      spentMonthly: "0",
      isActive: true,
    } as any);

    client = new AgentRail({ apiKey, baseUrl: BASE_URL });
  });

  afterAll(async () => {
    console.log("🧹 Cleaning up E2E data...");
    // Cleanup transactions and events for this org
    await db.delete(webhookEvents).where(eq(webhookEvents.orgId, TEST_ORG_ID));
    await db.delete(transactions).where(eq(transactions.orgId, TEST_ORG_ID));
    // Keep org/agent/policy to avoid cascading complexity, or clean them too
  });

  /**
   * TEST 1: SUCCESSFUL FLOW
   */
  it("should process a successful payment from creation to confirmation", async () => {
    const idempotencyKey = client.idempotency.generate();
    const amount = "50";

    // 1. Create Payment
    const payment = await client.payments.create({
      agentId: testAgentId,
      toAddress: "kaspa:qr8888888888888888888888888888888888888888",
      amount,
      idempotencyKey,
    });

    expect(payment.id).toBeDefined();
    expect(payment.status).toBe("queued"); // Initially queued

    // 2. Poll for terminal state (confirmed)
    let finalTx: any = null;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000));
      finalTx = await client.payments.get(payment.id);
      if (finalTx.status === "confirmed") break;
    }

    expect(finalTx.status).toBe("confirmed");
    expect(finalTx.txHash).toBeDefined();

    // 3. Verify Webhook Event Generation (via DB check for E2E validation)
    const events = await db.select().from(webhookEvents).where(eq(webhookEvents.paymentId, payment.id));
    expect(events.some(e => e.type === "payment.confirmed")).toBe(true);
  });

  /**
   * TEST 2: IDEMPOTENCY
   */
  it("should return the same payment and not create a new one on duplicate idempotencyKey", async () => {
    const idempotencyKey = client.idempotency.generate();
    
    // First call
    const payment1 = await client.payments.create({
      agentId: testAgentId,
      toAddress: "kaspa:qr...",
      amount: "10",
      idempotencyKey,
    });

    // Second call with same key
    const payment2 = await client.payments.create({
      agentId: testAgentId,
      toAddress: "kaspa:qr...",
      amount: "10",
      idempotencyKey,
    });

    expect(payment1.id).toBe(payment2.id);
    
    // Verify only one record in DB
    const txCount = await db.select().from(transactions).where(eq(transactions.idempotencyKey, idempotencyKey));
    expect(txCount).toHaveLength(1);
  });

  /**
   * TEST 3: BUDGET EXCEEDED
   */
  it("should throw InsufficientBudgetError when limit is exceeded", async () => {
    const idempotencyKey = client.idempotency.generate();
    
    await expect(client.payments.create({
      agentId: testAgentId,
      toAddress: "kaspa:qr...",
      amount: "99999", // Way above 1000 limit
      idempotencyKey,
    })).rejects.toThrow(InsufficientBudgetError);
  });

  /**
   * TEST 4: POLICY DENIED (AGENT REVOKED)
   */
  it("should throw PolicyViolationError when agent is revoked", async () => {
    // Revoke agent
    await db.update(agents).set({ status: "revoked" }).where(eq(agents.id, testAgentId));

    const idempotencyKey = client.idempotency.generate();
    
    await expect(client.payments.create({
      agentId: testAgentId,
      toAddress: "kaspa:qr...",
      amount: "5",
      idempotencyKey,
    })).rejects.toThrow(PolicyViolationError);

    // Restore agent status
    await db.update(agents).set({ status: "active" }).where(eq(agents.id, testAgentId));
  });
});
