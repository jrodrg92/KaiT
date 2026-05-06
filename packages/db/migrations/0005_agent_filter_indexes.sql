-- Index for agent-specific payment history
CREATE INDEX IF NOT EXISTS idx_transactions_agent_created ON transactions (agent_id, created_at DESC);

-- Compound index for status filtering within an agent
CREATE INDEX IF NOT EXISTS idx_transactions_agent_status_created ON transactions (agent_id, status, created_at DESC);

-- Compound index for organizational agent filtering
CREATE INDEX IF NOT EXISTS idx_transactions_org_agent_created ON transactions (org_id, agent_id, created_at DESC);
