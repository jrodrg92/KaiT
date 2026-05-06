# AgentRail Protocol 🚂

The programmable payment and policy infrastructure for autonomous AI agents on Kaspa.

## Architecture
AgentRail is built as a modular monorepo using **Turborepo** and **pnpm**, designed for extreme security and high-performance agentic operations.

- **`apps/dashboard`**: Next.js 16.0.0/React 19.2.0 premium dashboard for agent monitoring and budget management.
- **`apps/api`**: Hono-based REST API for programmatic agent control and SDK integration.
- **`apps/worker`**: Isolated Signer Worker (Execution Runtime) that enforces security policies before signing.
- **`packages/wallet-core`**: Secure wallet infrastructure using `@kasplex/kiwi` and modular KMS.
- **`packages/policy-engine`**: Programmable policy engine for spending limits and withdrawal gates.
- **`packages/contracts`**: Smart contract layer for AgentRegistry and AgentVault on zkEVM.

## Security First
- **Isolated Keys**: Private keys are only decrypted inside the isolated worker memory.
- **Policy Enforcement**: Every payment must pass through the `PolicyEngine` (budget, whitelist, status).
- **Immutable Audit**: Comprehensive logging of agent creation, revocation, and payment events.

## Tech Stack
- **Framework**: Next.js 16.0.0 (App Router) / React 19.2.0
- **Logic**: TypeScript / Hono
- **Blockchain**: Kaspa L1 (@kasplex/kiwi) + zkEVM (Wagmi/Viem)
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **Queue**: BullMQ + Redis
- **Aesthetics**: Glassmorphism, Framer Motion animations.

## Getting Started (Local Development)

AgentRail is optimized for a fast, **Docker-free** local experience using your existing Supabase and Redis instances.

1. **Install Dependencies**: `pnpm install`
2. **Environment**: `cp .env.local.example .env` (Add your DATABASE_URL and REDIS_URL)
3. **Database**: `pnpm db:migrate && pnpm seed:local`
4. **Run All Services**: `pnpm dev:local`

For more details, see the [Local Development Guide](./docs/local-development.md).

## Core Commands

| Command | Description |
|---------|-------------|
| `pnpm dev:local` | Start API and all 3 Workers concurrently. |
| `pnpm health:local` | Check system status (API, DB, Redis, Workers). |
| `pnpm seed:local` | Bootstrap demo data and API Key. |
| `pnpm test:e2e:local` | Run full payment flow verification. |

## Infrastructure Configuration
Copy `.env.local.example` to `.env` and fill in your Supabase and Redis credentials.

