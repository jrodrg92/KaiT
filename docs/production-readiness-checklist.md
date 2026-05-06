# AgentRail Production Readiness Checklist

This document tracks the mandatory requirements for a secure, production-grade launch of the AgentRail infrastructure.

---

## 🛡️ 1. Security

| Item | Status | Blocking | Notes |
|------|--------|----------|-------|
| Real KMS Integration | **Pending** | **Yes** | Currently using `MockKMSProvider`. Must transition to AWS KMS or GCP KMS. |
| API Key Rotation | **Partial** | **Yes** | Logic exists in `auth.ts`, but no UI or CLI tool for users to self-serve rotation. |
| Scoped Keys (RBAC) | **Done** | No | `admin:read` and `payments:write` scopes implemented. |
| Admin RBAC | **Done** | No | Dedicated admin group with scope enforcement active. |
| Secrets Management | **Partial** | **Yes** | Environment variables used; transition to HashiCorp Vault or Cloud Secrets recommended. |
| No Private Keys in Frontend | **Done** | No | Frontend only sees metadata and public addresses. |
| Signer Isolation | **Partial** | **Yes** | Worker runs in separate process, but should be isolated in a hardened subnet. |

---

## 💰 2. Financial Safety

| Item | Status | Blocking | Notes |
|------|--------|----------|-------|
| Mandatory Idempotency | **Done** | No | Enforced at DB and SDK levels via `idempotencyKey`. |
| Atomic Budgeting | **Done** | No | Native Postgres transactions and conditional `UPDATE` active. |
| Reconciliation Worker | **Done** | No | Periodic scanning and terminal state correction implemented. |
| No Manual Balance Edits | **Done** | No | Financial logic centralized in `PolicyEngine` and SQL. |
| txHash Persistence | **Done** | No | Captured during broadcast and verified by Recon worker. |
| Audit Logs | **Done** | No | All payments and admin actions generate structured audit records. |

---

## 🏗️ 3. Infrastructure

| Item | Status | Blocking | Notes |
|------|--------|----------|-------|
| Supabase Backups | **Partial** | **Yes** | Relies on Supabase default PITR; needs manual validation of restore flow. |
| Redis Availability | **Done** | No | Using Upstash Redis with built-in high availability. |
| Worker Monitoring | **Done** | No | `worker_heartbeats` and `/health/workers` endpoints active. |
| Health Checks | **Done** | No | DB, Redis, and Worker health endpoints operational. |
| Deployment Rollback | **Pending** | No | Requires CI/CD pipeline definition (GitHub Actions). |
| Env Validation | **Done** | No | Strict checking in `API` and `Worker` startup. |

---

## ⛓️ 4. Kaspa Integration

| Item | Status | Blocking | Notes |
|------|--------|----------|-------|
| Testnet Verified | **Done** | No | Integration tests use Testnet/Mock environment. |
| Indexer Fallback Plan | **Pending** | **Yes** | Currently hardcoded to one indexer. Needs rotation or local node fallback. |
| Confirmation Policy | **Partial** | No | Currently uses 1-6 blocks. Should be configurable per agent/org. |
| Stuck TX Handling | **Done** | No | Reconciliation worker handles timeouts and budget release safely. |
| Broadcast Failure Handling| **Done** | No | Automatic retry via BullMQ and safe budget release on failure. |

---

## 🛠️ 5. Developer Platform

| Item | Status | Blocking | Notes |
|------|--------|----------|-------|
| SDK Tested | **Done** | No | Unit and E2E tests covering core payment flows. |
| Webhooks Signed | **Done** | No | HMAC SHA-256 signatures with timestamp protection active. |
| Webhook Receiver Example | **Done** | No | Node.js/Hono reference implementation available in `/examples`. |
| API Documentation | **Partial** | **Yes** | Needs Swagger/OpenAPI spec or comprehensive docs site. |
| Error Model Stable | **Done** | No | Granular SDK errors mapped to API responses. |

---

## ⚖️ 6. Legal & Risk Boundaries

| Item | Status | Blocking | Notes |
|------|--------|----------|-------|
| No Fiat Integration | **Done** | No | Purely crypto-native infrastructure. |
| No Swap/Trade logic | **Done** | No | Focused strictly on payments and budget. |
| Clear Terms of Service | **Pending** | **Yes** | Must define liability for autonomous agent actions. |
| Customer-Controlled Wallets| **Partial** | No | Currently programmatic-first; needs "Export Key" feature for user exit. |

---

## 🚦 Launch Gates

1. **Testnet Alpha**: **CURRENT PHASE**. Internal testing and E2E validation.
2. **Limited Mainnet Beta**: **PENDING**. Requires Real KMS and Legal Terms.
3. **Production Mainnet**: **PENDING**. Requires full security audit and Indexer redundancy.
