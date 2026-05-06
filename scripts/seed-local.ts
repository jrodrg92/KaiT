import { 
  db,
  organizations, 
  apiKeys, 
  agents, 
  policies, 
  webhookEndpoints 
} from "@agentrail/db";

import { v4 as uuidv4 } from "uuid";
import { createHash } from "node:crypto";
import "dotenv/config";

const DEV_ORG_ID = "00000000-0000-0000-0000-000000000001";

async function seed() {
  console.log("🌱 [Seed] Starting local development seed...");

  // 1. Organization
  await db.insert(organizations).values({
    id: DEV_ORG_ID,
    name: "Dev Organization",
  } as any).onConflictDoNothing();

  // 2. API Key
  const rawKey = "ar_test_dev_key_12345678";
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  
  await db.insert(apiKeys).values({
    id: uuidv4(),
    orgId: DEV_ORG_ID,
    name: "Dev Default Key",
    keyHash,
    keyPrefix: "ar_test_dev",
    isActive: true,
    scopes: ["admin:read", "payments:write", "agents:read"],
  } as any).onConflictDoNothing();

  // 3. Agent
  const agentId = uuidv4();
  await db.insert(agents).values({
    id: agentId,
    orgId: DEV_ORG_ID,
    name: "Demo Agent",
    status: "active",
  } as any);

  // 4. Policy
  await db.insert(policies).values({
    id: uuidv4(),
    agentId,
    dailyLimit: "1000",
    monthlyLimit: "5000",
    currency: "KAS",
    isActive: true,
  } as any);

  console.log("\n✅ [Seed] Success!");
  console.log("-----------------------------------------");
  console.log(`Organization ID: ${DEV_ORG_ID}`);
  console.log(`Agent ID:        ${agentId}`);
  console.log(`API Key:         ${rawKey}`);
  console.log("-----------------------------------------");
  console.log("\n🚀 Try creating a payment:");
  console.log(`curl -X POST http://localhost:3001/v1/payments \\
  -H "Authorization: Bearer ${rawKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "${agentId}",
    "toAddress": "kaspa:qp8888888888888888888888888888888888888888",
    "amount": "10.5",
    "idempotencyKey": "${uuidv4()}"
  }'`);
  
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ [Seed] Failed:", err);
  process.exit(1);
});
