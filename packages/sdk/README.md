# AgentRail SDK for TypeScript

The official Node.js library for the AgentRail Infrastructure Platform. 

## Features
- 🚀 **Resource-based**: Modular access to Payments, Agents, Wallets, and Policies.
- 🛡️ **Built-in Security**: HMAC Webhook verification and timestamp protection.
- 🔄 **Intelligent Retries**: Automatic exponential backoff for 429 and 5xx errors.
- 📐 **Strictly Typed**: Zod-validated responses with full TypeScript support.
- 📦 **Modern**: ESM/CJS compatible, fetch-based (zero external HTTP dependencies).

## Installation

```bash
npm install @agentrail/sdk
# or
pnpm add @agentrail/sdk
```

## Quick Start

```typescript
import { AgentRail } from "@agentrail/sdk";

const client = new AgentRail({
  apiKey: process.env.AGENTRAIL_API_KEY!,
});

// Create an autonomous payment
const payment = await client.payments.create({
  agentId: "agent_01j23...",
  toAddress: "kaspa:qr88...44aa",
  amount: "100.50",
  idempotencyKey: client.idempotency.generate(),
  metadata: { orderId: "123" }
});

console.log(`Payment status: ${payment.status}`);
```

## Authentication

Authentication is handled via a Bearer token in the `Authorization` header.

```typescript
const client = new AgentRail({
  apiKey: 'ar_live_...', // Your API key
});
```

## Webhook Verification

Securely verify incoming webhooks from AgentRail:

```typescript
const isValid = client.webhooks.verifySignature({
  rawBody: req.body, // Must be raw string
  signature: req.headers['x-agentrail-signature'],
  timestamp: req.headers['x-agentrail-timestamp'],
  secret: process.env.AGENTRAIL_WEBHOOK_SECRET!
});
```

## Error Handling

The SDK provides granular error classes for precise flow control:

```typescript
import { 
  AgentRailError, 
  RateLimitError, 
  InsufficientBudgetError 
} from "@agentrail/sdk";

try {
  const tx = await client.payments.create({ ... });
} catch (error) {
  if (error instanceof RateLimitError) {
    // Handle 429
  } else if (error instanceof InsufficientBudgetError) {
    // Handle budget exhaustion
  } else if (error instanceof AgentRailError) {
    console.error(`API error: ${error.message} (Request ID: ${error.requestId})`);
  }
}
```

## Advanced Configuration

```typescript
const client = new AgentRail({
  apiKey: '...',
  timeout: 30000, // 30 seconds
  maxRetries: 5,  // Exponential backoff
});
```

## License
MIT
