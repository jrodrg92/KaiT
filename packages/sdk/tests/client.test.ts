import { describe, it, expect, vi, beforeEach } from "vitest";
import { AgentRail } from "../src/client";
import { AgentRailError, RateLimitError } from "../src/errors";

describe("AgentRail SDK", () => {
  const apiKey = "ar_test_key";
  const client = new AgentRail({ apiKey, baseUrl: "http://localhost:3001" });

  it("should generate a unique idempotency key", () => {
    const key1 = client.idempotency.generate();
    const key2 = client.idempotency.generate();
    expect(key1).not.toBe(key2);
    expect(key1).toHaveLength(36);
  });

  describe("Webhook Verification", () => {
    const secret = "whsec_test";
    const payload = JSON.stringify({ id: "evt_1", type: "payment.confirmed" });
    const timestamp = Date.now().toString();
    
    // Mocking HMAC for test verification logic
    const crypto = require("node:crypto");
    const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");

    it("should verify a valid signature", () => {
      const isValid = client.webhooks.verifySignature({
        rawBody: payload,
        signature,
        timestamp,
        secret
      });
      expect(isValid).toBe(true);
    });

    it("should reject an invalid signature", () => {
      const isValid = client.webhooks.verifySignature({
        rawBody: payload,
        signature: "invalid_sig",
        timestamp,
        secret
      });
      expect(isValid).toBe(false);
    });

    it("should reject an expired timestamp", () => {
      const oldTimestamp = (Date.now() - 600000).toString(); // 10 mins ago
      const isValid = client.webhooks.verifySignature({
        rawBody: payload,
        signature,
        timestamp: oldTimestamp,
        secret
      });
      expect(isValid).toBe(false);
    });
  });

  // Note: Full HTTP tests would require mocking fetch, which is handled in http.test.ts
});
