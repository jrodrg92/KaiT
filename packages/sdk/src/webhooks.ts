import { createHmac } from "node:crypto";

export interface VerifySignatureOptions {
  rawBody: string;
  signature: string;
  timestamp: string;
  secret: string;
  tolerance?: number; // In seconds, default 300 (5 mins)
}

export class WebhookUtils {
  static verifySignature(options: VerifySignatureOptions): boolean {
    const { rawBody, signature, timestamp, secret, tolerance = 300 } = options;

    // 1. Validate Timestamp (Replay Protection)
    const now = Math.floor(Date.now() / 1000);
    const receivedTimestamp = parseInt(timestamp) / 1000;
    
    if (Math.abs(now - receivedTimestamp) > tolerance) {
      return false;
    }

    // 2. Validate HMAC SHA-256
    const dataToSign = `${timestamp}.${rawBody}`;
    const expectedSignature = createHmac("sha256", secret)
      .update(dataToSign)
      .digest("hex");

    return expectedSignature === signature;
  }
}
