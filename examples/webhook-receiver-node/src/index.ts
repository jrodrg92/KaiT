import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createHmac } from "node:crypto";
import "dotenv/config";

const app = new Hono();

// Simple in-memory deduplication for demo
const processedEventIds = new Set<string>();

/**
 * UTILITY: Verify Signature
 */
function verifySignature(payload: string, signature: string, timestamp: string, secret: string): boolean {
  const dataToSign = `${timestamp}.${payload}`;
  const expectedSignature = createHmac("sha256", secret).update(dataToSign).digest("hex");
  return expectedSignature === signature;
}

app.post("/webhooks/agentrail", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("X-AgentRail-Signature");
  const timestamp = c.req.header("X-AgentRail-Timestamp");
  const eventId = c.req.header("X-AgentRail-Event-Id");
  const secret = process.env.WEBHOOK_SECRET;

  console.log(`\n📥 Received Webhook: ${eventId}`);

  // 1. Check Mandatory Headers
  if (!signature || !timestamp || !eventId || !secret) {
    console.error("❌ Missing security headers or WEBHOOK_SECRET not configured");
    return c.json({ error: "Unauthorized" }, 401);
  }

  // 2. Timestamp Validation (Replay Attack Protection)
  const now = Math.floor(Date.now() / 1000);
  const receivedTimestamp = parseInt(timestamp);
  const drift = Math.abs(now - (receivedTimestamp / 1000));
  
  if (drift > 300) { // 5 minutes tolerance
    console.error(`❌ Timestamp drift too high: ${drift}s`);
    return c.json({ error: "Timestamp expired" }, 401);
  }

  // 3. Signature Verification
  const isValid = verifySignature(rawBody, signature, timestamp, secret);
  if (!isValid) {
    console.error("❌ Invalid signature");
    return c.json({ error: "Invalid signature" }, 401);
  }

  // 4. Deduplication
  if (processedEventIds.has(eventId)) {
    console.warn(`⚠️ Already processed event ${eventId}. Ignoring.`);
    return c.json({ status: "duplicate" }, 200);
  }

  // 5. Process Payload
  try {
    const payload = JSON.parse(rawBody);
    processedEventIds.add(eventId);

    console.log(`✅ Verified: ${payload.type}`);
    console.log(`   ID: ${payload.id}`);
    console.log(`   Payment ID: ${payload.data?.txId || "N/A"}`);
    console.log(`   Status: ${payload.data?.status || "N/A"}`);

    // Business Logic Here...
    
    return c.json({ status: "success", received: eventId }, 200);
  } catch (error) {
    console.error("❌ Failed to parse payload:", error);
    return c.json({ error: "Invalid JSON" }, 400);
  }
});

const port = 4000;
console.log(`🚀 AgentRail Webhook Receiver listening on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
