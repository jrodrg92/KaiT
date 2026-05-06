import { describe, it, expect } from "vitest";
import { PolicyEngine } from "./index";
import { Transaction, Policy } from "@agentrail/types";

describe("PolicyEngine", () => {
  const engine = new PolicyEngine();
  
  const mockPolicy: Partial<Policy> = {
    dailyLimit: "1000",
    monthlyLimit: "5000",
    spentAmount: "0",
    maxPerTransaction: "500",
    allowedAddresses: ["kaspa:whitelist_1"],
    requireApprovalAbove: "800",
  };

  it("should block transactions from a REVOKED agent", () => {
    const tx = { amount: "100", toAddress: "kaspa:whitelist_1" } as Transaction;
    const result = engine.evaluatePaymentPolicy(tx, mockPolicy as Policy, "revoked");
    expect(result.approved).toBe(false);
    expect(result.policyViolations).toContain("AGENT_REVOKED");
  });

  it("should block transactions above maxPerTransaction", () => {
    const tx = { amount: "600", toAddress: "kaspa:whitelist_1" } as Transaction;
    const result = engine.evaluatePaymentPolicy(tx, mockPolicy as Policy, "active");
    expect(result.approved).toBe(false);
    expect(result.policyViolations).toContain("MAX_PER_TRANSACTION_EXCEEDED");
  });

  it("should block transactions to non-whitelisted addresses", () => {
    const tx = { amount: "100", toAddress: "kaspa:unknown" } as Transaction;
    const result = engine.evaluatePaymentPolicy(tx, mockPolicy as Policy, "active");
    expect(result.approved).toBe(false);
    expect(result.policyViolations).toContain("ADDRESS_NOT_WHITELISTED");
  });

  it("should block if daily limit is exceeded", () => {
    const policyWithSpent = { ...mockPolicy, spentAmount: "950" } as Policy;
    const tx = { amount: "100", toAddress: "kaspa:whitelist_1" } as Transaction;
    const result = engine.evaluatePaymentPolicy(tx, policyWithSpent, "active");
    expect(result.approved).toBe(false);
    expect(result.policyViolations).toContain("DAILY_LIMIT_EXCEEDED");
  });

  it("should approve valid transactions", () => {
    const tx = { amount: "100", toAddress: "kaspa:whitelist_1" } as Transaction;
    const result = engine.evaluatePaymentPolicy(tx, mockPolicy as Policy, "active");
    expect(result.approved).toBe(true);
    expect(result.policyViolations.length).toBe(0);
  });
});
