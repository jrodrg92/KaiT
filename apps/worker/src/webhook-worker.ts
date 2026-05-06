import path from "node:path";
import dotenv from "dotenv";

// Load from monorepo root
dotenv.config({ path: path.join(__dirname, "../../../.env") });
dotenv.config();

import { Worker, Job } from "bullmq";

import axios from "axios";
import IORedis from "ioredis";
import { db, webhookEvents, webhookEndpoints } from "@agentrail/db";
import { eq } from "drizzle-orm";
import { signWebhookPayload, isPrivateIp } from "@agentrail/webhooks";
import { HeartbeatManager } from "./heartbeat";

export async function startWebhookWorker() {
  const heartbeat = new HeartbeatManager("webhook-worker");
  heartbeat.start();

  const redisConnection = process.env.REDIS_URL
    ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false })
    : new IORedis({ host: "127.0.0.1", port: 6379, maxRetriesPerRequest: null, enableReadyCheck: false });

  return new Worker(
    "webhook-delivery",
    async (job: Job) => {

    const { eventId } = job.data;
    
    // 1. Fetch Event & Endpoint
    const [event] = await db.select().from(webhookEvents).where(eq(webhookEvents.id, eventId));
    if (!event || event.status === "delivered") return;

    const [endpoint] = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.id, event.endpointId));
    if (!endpoint || !endpoint.isActive) {
      console.warn(`[WebhookWorker] Endpoint ${event.endpointId} not found or inactive. Skipping.`);
      return;
    }

    // 2. Security Check (SSR Protection)
    if (process.env.NODE_ENV === "production" && isPrivateIp(endpoint.url)) {
      console.error(`[WebhookWorker] REJECTED: Private IP URL ${endpoint.url}`);
      await db.update(webhookEvents).set({ 
        status: "failed", 
        lastError: "Security: Private IP addresses are not allowed in production." 
      }).where(eq(webhookEvents.id, eventId));
      return;
    }

    // 3. Prepare Payload & Signature
    const timestamp = Date.now();
    const payloadString = JSON.stringify(event.payload);
    const signature = signWebhookPayload(payloadString, endpoint.secret, timestamp);

    try {
      // 4. Dispatch HTTP Request
      await axios.post(endpoint.url, event.payload, {
        headers: {
          "Content-Type": "application/json",
          "X-AgentRail-Signature": signature,
          "X-AgentRail-Timestamp": timestamp.toString(),
          "X-AgentRail-Event-Id": event.id,
        },
        timeout: 5000, // Short timeout as requested
        maxRedirects: 0, // Do not follow redirects
      });

      // 5. Success Update
      await db.update(webhookEvents).set({
        status: "delivered",
        deliveredAt: new Date(),
        attempts: event.attempts + 1,
        updatedAt: new Date(),
      } as any).where(eq(webhookEvents.id, eventId));

      console.log(`✅ [WebhookWorker] Delivered event ${event.type} to ${endpoint.url}`);
    } catch (error: any) {
      const errorMessage = error.response ? `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}` : error.message;
      console.error(`❌ [WebhookWorker] Delivery failed for ${event.id}: ${errorMessage}`);

      // 6. Failure Update (BullMQ will handle retries)
      await db.update(webhookEvents).set({
        status: "failed",
        lastError: errorMessage,
        attempts: event.attempts + 1,
        updatedAt: new Date(),
      } as any).where(eq(webhookEvents.id, eventId));

      throw new Error(errorMessage); // Throw to trigger BullMQ retry
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
    skipVersionCheck: true,
  }
 );
}

