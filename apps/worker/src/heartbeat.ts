import { db, workerHeartbeats } from "../../../packages/db/src/index";

import { sql } from "drizzle-orm";

/**
 * WORKER HEARTBEAT UTILITY
 */
export class HeartbeatManager {
  constructor(private workerName: string) {}

  async pulse(status: "active" | "busy" | "idle" = "active", currentJobId?: string, metadata?: any) {
    try {


      await db
        .insert(workerHeartbeats)
        .values({
          workerName: this.workerName,
          lastSeenAt: new Date(),
          status,
          currentJobId,
          metadata,
        })
        .onConflictDoUpdate({
          target: workerHeartbeats.workerName,
          set: {
            lastSeenAt: new Date(),
            status,
            currentJobId,
            metadata: metadata || {},
            updatedAt: new Date(),
          },
        });

    } catch (error) {
      console.error(`[Heartbeat] Failed to pulse for ${this.workerName}:`, error);
    }
  }

  start(intervalMs: number = 30000) {
    console.log(`💓 [Heartbeat] Starting for ${this.workerName}`);
    this.pulse();
    setInterval(() => this.pulse(), intervalMs);
  }
}
