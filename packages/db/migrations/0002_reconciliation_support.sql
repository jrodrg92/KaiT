-- Migration: Reconciliation Support
-- Date: 2026-05-06

-- 1. Add reconciliation tracking fields to transactions
ALTER TABLE "transactions" ADD COLUMN "confirmed_at" timestamp;
ALTER TABLE "transactions" ADD COLUMN "failed_at" timestamp;
ALTER TABLE "transactions" ADD COLUMN "last_checked_at" timestamp;
ALTER TABLE "transactions" ADD COLUMN "check_count" integer DEFAULT 0 NOT NULL;

-- 2. Add blockchain metadata fields
ALTER TABLE "transactions" ADD COLUMN "kaspa_block_hash" text;
ALTER TABLE "transactions" ADD COLUMN "kaspa_metadata" jsonb;

-- 3. Indexes for reconciliation performance
CREATE INDEX "idx_transactions_reconciliation" ON "transactions" ("status") 
WHERE status IN ('queued', 'signing', 'signed', 'broadcasted');

-- 4. Audit Log Helper (Optional but useful for reconciliation)
COMMENT ON COLUMN "transactions"."last_checked_at" IS 'Last time the reconciliation worker checked this transaction';
