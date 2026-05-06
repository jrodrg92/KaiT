import { createHmac } from "node:crypto";

export function signWebhookPayload(payload: any, secret: string): string {
  const data = JSON.stringify(payload);
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
  const expected = signWebhookPayload(payload, secret);
  return expected === signature;
}
