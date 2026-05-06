-- Index for organizations listing
CREATE INDEX IF NOT EXISTS idx_agents_org_created ON agents (org_id, created_at DESC);

-- Indexes for payments listing and filtering
CREATE INDEX IF NOT EXISTS idx_transactions_org_created ON transactions (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status_created ON transactions (status, created_at DESC);

-- Index for webhooks and events
CREATE INDEX IF NOT EXISTS idx_webhook_events_org_created ON webhook_events (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_payment ON webhook_events (payment_id);

-- Index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs (org_id, created_at DESC);
