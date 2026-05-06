# AgentRail SDK 🚂

The official TypeScript SDK for integrating autonomous agent payments on Kaspa.

## Installation

```bash
npm install @agentrail/sdk
```

## Usage

```typescript
import { AgentRail } from "@agentrail/sdk";

const agentrail = new AgentRail({
  apiKey: process.env.AGENTRAIL_API_KEY,
  baseUrl: "https://api.agentrail.io/v1" // Optional
});

// 1. Create a new agent with a secure wallet
const agent = await agentrail.agents.create({
  name: "TradingBot_01",
  metadata: { strategy: "arbitrage" }
});

console.log(`Agent created: ${agent.address}`);

// 2. Request a payment execution
const tx = await agentrail.payments.send({
  agentId: agent.id,
  toAddress: "kaspa:qp32...",
  amount: "100000000", // 1 KAS in Sompis
  idempotencyKey: "unique-request-id-123"
});

console.log(`Payment queued: ${tx.id}`);

// 3. Monitor transactions
const history = await agentrail.payments.listTransactions(agent.id);
```

## Features
- **Typed Errors**: Catch `AgentRailError` for specific API responses.
- **Auto-Retries**: Built-in exponential backoff for network failures.
- **Full Type Safety**: Complete TypeScript support for all models.
- **Runtime Validation**: Powered by Zod to ensure data integrity.
