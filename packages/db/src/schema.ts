import { pgTable, uuid, text, timestamp, numeric, jsonb, boolean, integer, pgEnum } from "drizzle-orm/pg-core";

// Enums for DB constraints
export const agentStatusEnum = pgEnum("agent_status", ["active", "paused", "revoked"]);
export const txStatusEnum = pgEnum("tx_status", [
  "created", 
  "budget_reserved", 
  "queued", 
  "signing", 
  "signed", 
  "broadcasted", 
  "confirmed", 
  "failed", 
  "canceled"
]);

/**
 * Organizations & IAM
 */
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Agent Infrastructure
 */
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  name: text("name").notNull(),
  status: agentStatusEnum("status").default("active").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agentWallets = pgTable("agent_wallets", {
  agentId: uuid("agent_id").primaryKey().references(() => agents.id).notNull(),
  address: text("address").notNull().unique(),
  // KMS ENVELOPE
  encryptedSecret: text("encrypted_secret").notNull(), // ciphertext
  iv: text("iv").notNull(),
  authTag: text("auth_tag").notNull(),
  keyVersion: text("key_version").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


/**
 * Security & Policies
 */
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(), // Only hashed keys
  keyPrefix: text("key_prefix").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  scopes: text("scopes").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

export const policies = pgTable("policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").references(() => agents.id).notNull(),
  dailyLimit: numeric("daily_limit", { precision: 20, scale: 8 }).notNull(),
  monthlyLimit: numeric("monthly_limit", { precision: 20, scale: 8 }).notNull(),
  spentDaily: numeric("spent_daily", { precision: 20, scale: 8 }).default("0").notNull(),
  spentMonthly: numeric("spent_monthly", { precision: 20, scale: 8 }).default("0").notNull(),
  lastResetDaily: timestamp("last_reset_daily").defaultNow().notNull(),
  lastResetMonthly: timestamp("last_reset_monthly").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  currency: text("currency").default("KAS").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const policyWhitelists = pgTable("policy_whitelists", {
  id: uuid("id").primaryKey().defaultRandom(),
  policyId: uuid("policy_id").references(() => policies.id).notNull(),
  address: text("address").notNull(),
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Transactions & Settlement
 */
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  agentId: uuid("agent_id").references(() => agents.id).notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  toAddress: text("to_address").notNull(),
  amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
  status: txStatusEnum("status").default("created").notNull(),
  txHash: text("tx_hash"),
  failureReason: text("failure_reason"),
  
  // Reconciliation fields
  confirmedAt: timestamp("confirmed_at"),
  failedAt: timestamp("failed_at"),
  lastCheckedAt: timestamp("last_checked_at"),
  checkCount: integer("check_count").default(0).notNull(),
  
  // Network data
  kaspaBlockHash: text("kaspa_block_hash"),
  kaspaMetadata: jsonb("kaspa_metadata"),

  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return [
    {
      name: "idempotency_idx",
      unique: true,
      columns: [table.orgId, table.idempotencyKey],
    }
  ];
});



/**
 * Logs & Metrics (SaaS Model)
 */
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  actorId: uuid("actor_id").notNull(), // User or Agent
  event: text("event").notNull(),
  details: jsonb("details").notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usageLogs = pgTable("usage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  agentId: uuid("agent_id").references(() => agents.id),
  action: text("action").notNull(), // 'api_request', 'payment_execution'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Webhooks
 */
export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: text("events").array().notNull(), // ['payment.*', 'budget.*']
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  endpointId: uuid("endpoint_id").references(() => webhookEndpoints.id).notNull(),
  paymentId: uuid("payment_id").references(() => transactions.id),
  type: text("type").notNull(), 
  payload: jsonb("payload").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'delivered', 'failed', 'scheduled'
  attempts: integer("attempts").default(0).notNull(),
  nextRetryAt: timestamp("next_retry_at"),
  deliveredAt: timestamp("delivered_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workerHeartbeats = pgTable("worker_heartbeats", {
  workerName: text("worker_name").primaryKey(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  status: text("status").default("active").notNull(), // 'active', 'busy', 'idle'
  currentJobId: text("current_job_id"),
  metadata: jsonb("metadata"),
});



