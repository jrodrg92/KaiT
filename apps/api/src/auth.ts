import { createHash, randomBytes } from "crypto";
import { Context, Next } from "hono";
import { db } from "@agentrail/db";
import { apiKeys, agents } from "@agentrail/db/schema";
import { eq, and, gt } from "drizzle-orm";

export interface AuthContext {
  orgId: string;
  keyType: "live" | "test";
  scopes: string[];
}

/**
 * Middleware: Identity & Access Management
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: Missing Bearer token" }, 401);
  }

  const apiKey = authHeader.split(" ")[1];
  
  // 1. Prefix & Format Check
  if (!apiKey.startsWith("ar_live_") && !apiKey.startsWith("ar_test_")) {
    return c.json({ error: "Invalid API key format" }, 401);
  }

  // 2. Hash & Lookup
  const keyHash = createHash("sha256").update(apiKey).digest("hex");
  
  const [keyRecord] = await db.select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyHash, keyHash),
        eq(apiKeys.isActive, true)
      )
    );

  if (!keyRecord) {
    return c.json({ error: "Unauthorized: Invalid or revoked key" }, 401);
  }

  // 3. Expiration Check
  if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
    return c.json({ error: "Unauthorized: API key expired" }, 401);
  }

  // Inject Context
  c.set("auth", {
    orgId: keyRecord.orgId,
    keyType: keyRecord.type as "live" | "test",
    scopes: keyRecord.scopes || [],
  });

  await next();
};

/**
 * Middleware: Scope-based Access Control (RBAC)
 */
export const requireScope = (requiredScope: string) => {
  return async (c: Context, next: Next) => {
    const auth = c.get("auth") as AuthContext;
    
    if (!auth.scopes.includes(requiredScope) && !auth.scopes.includes("admin:all")) {
      return c.json({ 
        error: `Forbidden: Missing required scope '${requiredScope}'`,
        requiredScope 
      }, 403);
    }
    
    await next();
  };
};

/**
 * Key Generation Utility
 */
export function generateApiKey(orgId: string, name: string, type: "live" | "test" = "test", scopes: string[] = ["payments:write", "agents:read"]) {
  const bytes = randomBytes(32);
  const prefix = type === "live" ? "ar_live_" : "ar_test_";
  const rawKey = `${prefix}${bytes.toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.substring(0, 11);

  return {
    rawKey,
    keyHash,
    keyPrefix,
    type,
    orgId,
    name,
    scopes
  };
}

