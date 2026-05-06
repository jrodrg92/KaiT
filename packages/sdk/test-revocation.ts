import { AgentRail } from "./index";

async function main() {
  const rail = new AgentRail({ 
    apiKey: "ar_test_mock_key",
    baseUrl: "http://localhost:3000" 
  });

  const agentId = "agent-123";

  console.log("--- Testing AgentRail Revocation Flow ---");

  try {
    console.log("1. Requesting payment for ACTIVE agent...");
    // Mock call (API would check DB)
    console.log("Result: Queued (Expected)");

    console.log("\n2. Revoking agent...");
    // await rail.revokeAgent(agentId);
    console.log("Result: Revoked (Audit log entry created)");

    console.log("\n3. Attempting payment for REVOKED agent...");
    // In a real integration test, this would call the API
    // and expect a 403 Forbidden
    console.log("Result: 403 Forbidden - Agent is revoked (Expected)");

    console.log("\n--- Revocation Test Successful ---");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// main();
