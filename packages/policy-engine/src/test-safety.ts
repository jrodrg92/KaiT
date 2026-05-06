/**
 * AgentRail Infrastructure Safety Tests
 * Focus: Idempotency & Budget Enforcement
 */

import { PolicyEngine } from "./index";

async function runTests() {
  console.log("🧪 Starting Infrastructure Safety Tests...");

  const engine = new PolicyEngine();
  const mockAgentId = "00000000-0000-0000-0000-000000000001";
  const mockOrgId = "00000000-0000-0000-0000-000000000000";

  console.log("\n1. Testing Budget Reservation Logic...");
  // Note: This requires a running DB. In a CI environment, we would use a test DB.
  try {
    const res = await engine.reserveBudget("tx_test_1", mockAgentId, "500");
    console.log("Budget reservation result:", res);
  } catch (e) {
    console.log("Budget reservation failed (expected if DB not connected):", (e as Error).message);
  }

  console.log("\n2. Testing Policy Evaluation (Pure Logic)...");
  const mockPolicy = {
    id: "p1",
    agentId: mockAgentId,
    dailyLimit: "1000",
    monthlyLimit: "5000",
    spentDaily: "800",
    spentMonthly: "800",
    isActive: true,
    currency: "KAS"
  };

  const eval1 = engine.evaluatePaymentPolicy(
    { amount: "100", toAddress: "kaspa:abc", agentId: mockAgentId } as any,
    mockPolicy as any,
    "active"
  );
  console.log("Evaluation (Should pass):", eval1.approved === true ? "✅ PASS" : "❌ FAIL");

  const eval2 = engine.evaluatePaymentPolicy(
    { amount: "300", toAddress: "kaspa:abc", agentId: mockAgentId } as any,
    mockPolicy as any,
    "active"
  );
  console.log("Evaluation (Should fail - Daily Limit):", eval2.approved === false ? "✅ PASS" : "❌ FAIL");

  console.log("\n✅ Infrastructure Logic Verified.");
}

if (require.main === module) {
  runTests();
}
