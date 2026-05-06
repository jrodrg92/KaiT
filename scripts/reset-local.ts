import { 
  db,
  organizations, 
  apiKeys, 
  agents, 
  policies, 
  transactions,
  agentWallets,
  auditLogs,
  webhookEvents,
  workerHeartbeats
} from "@agentrail/db";

import { sql } from "drizzle-orm";
import "dotenv/config";

async function reset() {
  if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("supabase.co") && !process.env.DATABASE_URL?.includes("localhost")) {
    console.error("❌ [Reset] Refusing to reset production or remote database!");
    process.exit(1);
  }

  console.log("🧹 [Reset] Clearing development data...");

  await db.execute(sql`TRUNCATE TABLE ${transactions}, ${auditLogs}, ${webhookEvents}, ${workerHeartbeats}, ${policies}, ${agentWallets}, ${agents}, ${apiKeys}, ${organizations} CASCADE`);

  console.log("✅ [Reset] Data cleared. Re-seeding...");
  // The seed script can be called after this or we could import it here.
  // For simplicity, we'll just exit and let the pnpm script chain it.
  process.exit(0);
}

reset().catch(err => {
  console.error("❌ [Reset] Failed:", err);
  process.exit(1);
});
