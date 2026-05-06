# AgentRail Webhook Receiver (Node.js Example)

This is a reference implementation of a secure webhook receiver for AgentRail.

## Features
- ✅ **HMAC SHA-256 Verification**: Ensures the request came from AgentRail.
- ✅ **Timestamp Validation**: Prevents replay attacks (5-minute window).
- ✅ **Deduplication**: Uses `X-AgentRail-Event-Id` to ignore duplicate deliveries.

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Set your WEBHOOK_SECRET from the AgentRail Dashboard
   ```

3. **Start the receiver**:
   ```bash
   npm run dev
   ```

## Local Testing with cURL

You can simulate a webhook call with this command (make sure to update the signature if you change the payload/timestamp/secret):

```bash
# Payload
PAYLOAD='{"id":"evt_123","type":"payment.confirmed","data":{"txId":"tx_001","status":"confirmed"}}'
TIMESTAMP=$(date +%s000)
SECRET="your_agentrail_webhook_secret_here"

# Sign (macOS/Linux)
SIGNATURE=$(echo -n "$TIMESTAMP.$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | sed 's/^.* //')

curl -X POST http://localhost:4000/webhooks/agentrail \
  -H "Content-Type: application/json" \
  -H "X-AgentRail-Signature: $SIGNATURE" \
  -H "X-AgentRail-Timestamp: $TIMESTAMP" \
  -H "X-AgentRail-Event-Id: evt_123" \
  -d "$PAYLOAD"
```

## Implementation Details

The receiver reads the **raw body** of the request. It is critical not to parse the JSON before verifying the signature, as whitespace or property order changes during parsing could invalidate the hash.
