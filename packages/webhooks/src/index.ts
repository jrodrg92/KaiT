import { createHmac, randomBytes } from "node:crypto";
import axios from "axios";
import { db, webhookEndpoints, webhookEvents } from "@agentrail/db";
import { eq, and } from "drizzle-orm";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { v4 as uuidv4 } from "uuid";


/**
 * WEBHOOK SIGNING UTILITY
 */
export function signWebhookPayload(payload: string, secret: string, timestamp: number): string {
  const dataToSign = `${timestamp}.${payload}`;
  return createHmac("sha256", secret).update(dataToSign).digest("hex");
}

/**
 * WEBHOOK SERVICE
 */
export class WebhookService {
  private queue: Queue;

  constructor(redisUrl?: string) {
    const connection = redisUrl ? new IORedis(redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false }) : undefined;
    this.queue = new Queue("webhook-delivery", { connection });
  }

  /**
   * Triggers a webhook event by persisting it for all active endpoints and enqueuing delivery jobs.
   */
  async trigger(orgId: string, type: string, data: any, paymentId?: string) {
    // 1. Fetch active endpoints for the org
    const endpoints = await db
      .select()
      .from(webhookEndpoints)
      .where(and(eq(webhookEndpoints.orgId, orgId), eq(webhookEndpoints.isActive, true)));

    if (endpoints.length === 0) return [];

    const eventId = `evt_${randomBytes(8).toString("hex")}`;
    const timestamp = Date.now();
    const payload = {
      id: eventId,
      type,
      createdAt: new Date(timestamp).toISOString(),
      data,
    };

    const results = [];

    for (const endpoint of endpoints) {
      // Check if endpoint is subscribed to this event (or wildcard)
      const isSubscribed = endpoint.events.includes(type) || 
                          endpoint.events.includes("*") || 
                          (type.startsWith("payment.") && endpoint.events.includes("payment.*"));

      if (!isSubscribed) continue;

      const deliveryId = uuidv4();
      
      // 2. Persist Delivery Event
      const [event] = await db.insert(webhookEvents).values({
        id: deliveryId,
        orgId,
        endpointId: endpoint.id,
        paymentId,
        type,
        payload,
        status: "pending",
      } as any).returning();

      // 3. Enqueue for delivery
      await this.queue.add("deliver", { eventId: event.id }, {
        jobId: event.id,
        attempts: 10,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      });

      results.push(event);
    }

    return results;
  }
}

/**
 * SECURITY: Private IP Filter
 */
export function isPrivateIp(url: string): boolean {
  // Simplified check for demonstration. In production use a robust library like 'ipaddr.js'
  const privatePatterns = [
    /^https?:\/\/localhost/,
    /^https?:\/\/127\./,
    /^https?:\/\/192\.168\./,
    /^https?:\/\/10\./,
    /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./
  ];
  return privatePatterns.some(pattern => pattern.test(url));
}
