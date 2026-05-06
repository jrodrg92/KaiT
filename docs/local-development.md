# Local Development Guide (Docker-Free)

AgentRail is designed for a fast and reproducible local development experience using your existing Supabase and Redis infrastructure. No Docker required.

## Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0
- **Supabase**: A local or cloud project (PostgreSQL).
- **Redis**: A local or cloud instance (e.g., Upstash or local brew/apt install).

## Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/jrodrg92/KaiT.git
cd kait
pnpm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env
```
Edit `.env` and fill in your `DATABASE_URL` and `REDIS_URL`.

### 3. Initialize Database
```bash
pnpm db:migrate
pnpm seed:local
```
This will create the schema and a demo organization with an API Key.

### 4. Start Development Services
```bash
pnpm dev:local
```
This starts the API and all 3 background workers (Signer, Recon, Webhook) concurrently.

---

## Operational Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:local` | Starts API + all Workers. |
| `pnpm db:migrate` | Runs database migrations. |
| `pnpm seed:local` | Bootstraps dev data (Org, API Key, Agent). |
| `pnpm reset:local`| Clears dev data and re-seeds (Safe for local/dev only). |
| `pnpm health:local`| Verifies API, DB, Redis, and Worker heartbeats. |
| `pnpm test:e2e:local`| Runs E2E tests against the local services. |

---

## Mock Kaspa Network

By default, `KASPA_NETWORK` is set to `mock`. 
- **Broadcast**: Always succeeds (unless `MOCK_KASPA_FAIL_BROADCAST=true`).
- **Confirmation**: The reconciliation worker will automatically confirm transactions after `MOCK_KASPA_CONFIRM_DELAY_MS` (default 3s).

---

## Troubleshooting

- **Redis Connection**: Ensure Redis is running and reachable.
- **KMS Error**: Ensure `LOCAL_KMS_MASTER_KEY` is at least 32 characters long.
- **Worker Heartbeats**: If `pnpm health:local` shows workers as "missing", check the `pnpm dev:local` logs for startup errors.
- **Database Reset**: If you need a fresh start, run `pnpm reset:local`. It will abort if it detects a production URL.

## Future: Hardhat Integration
Hardhat is available for future EVM/L2 simulations but is **not required** for the core Kaspa payment flow.
