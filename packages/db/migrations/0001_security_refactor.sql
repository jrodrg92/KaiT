-- Migration: Security & Payment Consistency Refactor
-- Date: 2026-05-06

-- 1. Update Transaction Status Enum (requires manual cast or recreation in some PG versions)
-- For Drizzle/PG:
ALTER TYPE "tx_status" ADD VALUE 'created';
ALTER TYPE "tx_status" ADD VALUE 'budget_reserved';
ALTER TYPE "tx_status" ADD VALUE 'queued';
ALTER TYPE "tx_status" ADD VALUE 'signing';
ALTER TYPE "tx_status" ADD VALUE 'canceled';

-- 2. Enhance Policies Table
ALTER TABLE "policies" ADD COLUMN "spent_daily" numeric(20, 8) DEFAULT '0' NOT NULL;
ALTER TABLE "policies" ADD COLUMN "spent_monthly" numeric(20, 8) DEFAULT '0' NOT NULL;
ALTER TABLE "policies" ADD COLUMN "last_reset_daily" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "policies" ADD COLUMN "last_reset_monthly" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "policies" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;

-- 3. Enhance Transactions Table
ALTER TABLE "transactions" ADD COLUMN "org_id" uuid REFERENCES "organizations"("id");
ALTER TABLE "transactions" ADD COLUMN "idempotency_key" text;
ALTER TABLE "transactions" ADD COLUMN "failure_reason" text;

-- 4. Fill org_id for existing transactions (best effort)
UPDATE "transactions" t 
SET org_id = a.org_id 
FROM agents a 
WHERE t.agent_id = a.id;

ALTER TABLE "transactions" ALTER COLUMN "org_id" SET NOT NULL;
ALTER TABLE "transactions" ALTER COLUMN "idempotency_key" SET NOT NULL;

-- 5. Add Idempotency Index
CREATE UNIQUE INDEX "idempotency_idx" ON "transactions" ("org_id", "idempotency_key");

-- 6. Cleanup old status values if necessary (migration specific)
UPDATE "transactions" SET status = 'failed' WHERE status = 'blocked';
