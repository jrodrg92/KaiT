# AgentRail Operations Runbook

**Version**: 1.0.0  
**Status**: Production-Ready  
**Domain**: Financial Infrastructure / Kaspa Payments

---

## 1. System Overview

AgentRail is a programmable payment infrastructure for autonomous AI agents. It ensures financial consistency using a multi-layer architecture where Postgres is the ultimate source of truth.

### Architecture Diagram
```text
      [ Developers / SDK ]
               |
               v
      [ AgentRail API (v1) ] <-----> [ Supabase / Postgres ] (Source of Truth)
               |                            ^
               v                            |
      [ Redis / BullMQ ] <------------------+
               |
    +----------+----------+-----------------------+
    |                     |                       |
[ Signer Worker ]  [ Recon Worker ]      [ Webhook Worker ]
    |                     |                       |
    v                     v                       v
[ Kaspa Network ]   [ Network Indexer ]     [ Developer Endpoints ]
```

### Core Components
- **API**: Handles auth, validation, and job queuing.
- **Supabase/Postgres**: Stores balances, transactions, and audit logs.
- **Redis/BullMQ**: Manages job distribution and retries.
- **Signer Worker**: Handles secure signing and broadcasting.
- **Reconciliation Worker**: Scans for "stuck" states and verifies on-chain status.
- **Webhook Worker**: Delivers event notifications with HMAC signatures.

---

## 2. Critical Financial Guarantees

1. **Postgres is Absolute Truth**: Balances and transaction states must only be finalized in Postgres.
2. **Redis is Transitory**: Redis should only be used for coordination. If Redis is wiped, the system must be reconstructible from Postgres.
3. **Budget Safety**: Budget is reserved atomically before queuing. Budget is only released if a transaction fails *before* being broadcasted.
4. **Idempotency**: All `payments.create` operations must include an `idempotencyKey`. Duplicate requests must return the existing record without creating new jobs.
5. **Read-Only Reconciliation**: The reconciliation worker never signs new transactions; it only verifies existing ones.

---

## 3. Payment Lifecycle

| State | Responsibility | Description | Recovery |
|-------|----------------|-------------|----------|
| `created` | API | Initial record created. | Automatic via Queue. |
| `budget_reserved` | API | Budget atomically deducted from policy. | Automatic. |
| `queued` | API / Redis | Job waiting in BullMQ. | Check Redis Health. |
| `signing` | Signer | Private key access and TX generation. | Timeout after 10m (Recon). |
| `signed` | Signer | TX ready but not yet on wire. | Timeout after 10m (Recon). |
| `broadcasted` | Signer | Sent to Kaspa network. Has `txHash`. | **DO NOT RE-SIGN**. Poll Network. |
| `confirmed` | Recon / Network | TX verified on-chain. | Terminal state. |
| `failed` | Any | Error during processing. | Budget released if pre-broadcast. |
| `canceled` | Admin | Manual cancellation. | Handled by admin. |

---

## 4. Operational Monitoring

### Health Checks
- `GET /health/db`: Must return 200.
- `GET /health/redis`: Must return 200.
- `GET /health/workers`: Checks for recent heartbeats (threshold < 2min).

### Critical Thresholds
- **Stuck Queued**: > 5 minutes (Worker capacity or Redis issue).
- **Stuck Signing**: > 10 minutes (Signer worker failure).
- **Stuck Broadcasted**: > 30 minutes (Network congestion or Indexer lag).
- **Webhook Failures**: > 5 attempts (Endpoint issue or Webhook worker issue).

---

## 5. Incident Response Playbooks

### A. Redis Down
- **Symptoms**: API returns 500 on payments. Workers are idle.
- **Impact**: No new payments can be processed. Existing `broadcasted` payments are safe.
- **Recovery**: Restart Redis. BullMQ will recover jobs if persistence was enabled. If not, use `admin/re-sync-queues` to rebuild from Postgres.

### B. Worker Heartbeat Missing
- **Symptoms**: `GET /health/workers` shows "missing".
- **Diagnosis**: Check worker container logs.
- **Mitigation**: Scale/restart the affected worker group.

### C. Payments Stuck in Signing
- **Symptoms**: Payments stay in `signing` for > 10m.
- **Impact**: Stuck funds/budget.
- **Recovery**: Reconciliation worker will eventually mark as `failed` and release budget. If critical, verify KMS availability.

### D. Payments Stuck in Broadcasted
- **Symptoms**: `confirmed` status delayed > 30m.
- **Diagnosis**: Check `txHash` on a public Kaspa explorer.
- **Mitigation**: If the TX is on-chain, wait for the Indexer to sync. If NOT on-chain, investigate Signer broadcast logs. **WARNING**: Never re-broadcast until 100% sure the original TX is not in any mempool.

---

## 6. Security Procedures

### Key Rotation
- **API Keys**: Rotate via `admin/keys/rotate`. Invalidate old hash immediately.
- **Webhook Secrets**: Update in Dashboard. Old signatures will fail immediately.
- **KMS**: Use MockKMS rotation strategy if using encrypted secrets.

### Incident Response
- **Worker Compromised**: Shut down all workers immediately. Rotate KMS master keys. Revoke all active signing jobs.
- **Admin Key Leaked**: Invalidate key in DB. Check Audit Logs for unauthorized access.

---

## 7. Forbidden Manual Operations

> [!CAUTION]
> Failure to follow these rules may result in double-spending or financial inconsistency.

1. **NEVER** modify balances in Postgres manually. Use reconciliation tools.
2. **NEVER** mark a transaction as `confirmed` manually if it has no `txHash`.
3. **NEVER** release reserved budget if a `txHash` exists without verifying the TX is definitively rejected by the network.
4. **NEVER** edit a transaction's `amount` or `toAddress` after it has reached `signing`.

---

## 8. Remaining Risks & Limitations

- **Hot Wallet Risk**: Signer workers have access to encrypted secrets. Compromise of the worker environment is high risk.
- **Indexer Dependency**: We rely on external indexers for confirmation. If the indexer is stale, payments will stay in `broadcasted`.
- **Blockchain Reorgs**: Confirmations are currently based on a fixed block depth. Deep reorgs could technically invalidate "confirmed" states.
- **No HSM**: Current implementation uses software-based encryption (MockKMS). Not FIPS 140-2 compliant.

---

## 9. Severity Levels

| Level | Description | Escalation |
|-------|-------------|------------|
| **SEV-0** | Total loss of Postgres or Key Compromise. | Immediate Management Notification. |
| **SEV-1** | Payments stopped (API or Signer down). | On-call Engineer. |
| **SEV-2** | Observability/Admin tools down. | Next Business Day. |
| **SEV-3** | Webhook delivery delays. | Low Priority. |
