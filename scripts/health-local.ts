import "dotenv/config";
import { db, workerHeartbeats } from "@agentrail/db";
import { sql } from "drizzle-orm";


async function checkHealth() {
  console.log("🏥 [Health] Checking local infrastructure...");

  let allOk = true;

  // 1. API
  try {
    // In Node.js >= 18, fetch is available globally. No import needed.
    const res = await fetch("http://localhost:3001/health");
    if (res.ok) {
      console.log("✅ API: Online");
    } else {
      console.log("❌ API: Unhealthy (Status: " + res.status + ")");
      allOk = false;
    }
  } catch (e) {
    console.log("❌ API: Offline");
    allOk = false;
  }

  // 2. DB
  try {
    await db.execute(sql`SELECT 1`);
    console.log("✅ DB: Connected");
  } catch (e) {
    console.log("❌ DB: Connection failed");
    allOk = false;
  }

  // 3. Workers
  try {
    const heartbeats = await db.select().from(workerHeartbeats);
    const now = Date.now();
    heartbeats.forEach(h => {
      const isHealthy = now - h.lastSeenAt.getTime() < 120000;
      console.log(`${isHealthy ? "✅" : "❌"} Worker [${h.workerName}]: ${isHealthy ? "Healthy" : "Missing heartbeat"}`);
      if (!isHealthy) allOk = false;
    });
    if (heartbeats.length === 0) {
      console.log("⚠️ No workers have registered heartbeats yet.");
      allOk = false;
    }
  } catch (e) {
    console.log("❌ Workers: Failed to check heartbeats");
    allOk = false;
  }

  if (!allOk) {
    process.exit(1);
  }
  process.exit(0);
}

checkHealth();
