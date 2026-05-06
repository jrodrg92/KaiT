# AgentRail API Reference

Welcome to the AgentRail API. Our API is organized around REST. It has predictable resource-oriented URLs, accepts JSON-encoded request bodies, and uses standard HTTP response codes.

## Authentication

The AgentRail API uses API keys to authenticate requests. You can view and manage your API keys in the AgentRail Dashboard.

All API requests must be made over HTTPS. Calls made over plain HTTP will fail. Authentication is handled via the `Authorization` header.

```http
Authorization: Bearer YOUR_API_KEY
```

---

## 💎 Agents

### Create an Agent
`POST /v1/agents`

**Example Request:**
```bash
curl -X POST https://api.agentrail.io/v1/agents \
  -H "Authorization: Bearer $AR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trading Bot Alpha",
    "metadata": { "strategy": "arbitrage" }
  }'
```

---

## 💰 Payments

### Create a Payment
`POST /v1/payments`

> [!IMPORTANT]
> The `idempotencyKey` is mandatory to prevent duplicate charges in case of network retries.

**Example Request:**
```bash
curl -X POST https://api.agentrail.io/v1/payments \
  -H "Authorization: Bearer $AR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "550e8400-e29b-41d4-a716-446655440000",
    "toAddress": "kaspa:qr88...44aa",
    "amount": "100.50",
    "idempotencyKey": "unique_req_id_123"
  }'
```

---

## 🪝 Webhooks

AgentRail can notify your application when events occur in your account.

### Verify Signature

```typescript
// Helper provided in @agentrail/sdk
const isValid = client.webhooks.verifySignature({
  rawBody: req.body,
  signature: req.headers['x-agentrail-signature'],
  timestamp: req.headers['x-agentrail-timestamp'],
  secret: process.env.WEBHOOK_SECRET
});
```

### Event Types
- `payment.queued`: Payment received and valid.
- `payment.broadcasted`: Sent to the Kaspa network.
- `payment.confirmed`: Successfully finalized on-chain.
- `payment.failed`: Transaction failed.
- `budget.reserved`: Budget deducted.
- `budget.released`: Budget returned on failure.

---

## ❌ Errors

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `validation_error` | Invalid payload structure. |
| 401 | `authentication_error` | Missing or invalid API key. |
| 403 | `insufficient_budget` | Agent exceeds its daily/monthly limit. |
| 403 | `policy_violation` | Agent status is `paused` or `revoked`. |
| 409 | `idempotency_conflict` | Same key used with different parameters. |

---

## 📈 Operational Metrics

- `GET /health`: System health.
- `GET /metrics`: Aggregated performance and error rates (Admin only).
