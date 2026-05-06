import { Transaction, Policy, AgentStatus } from "@agentrail/types";

export interface PolicyEvaluationResult {
  approved: boolean;
  blocked: boolean;
  reason?: string;
  policyViolations: string[];
}

export class PolicyEngine {
  /**
   * Evaluates if a payment complies with all agent and organizational policies.
   */
  evaluatePaymentPolicy(
    transaction: Transaction,
    policy: Policy,
    agentStatus: AgentStatus
  ): PolicyEvaluationResult {
    const violations: string[] = [];

    // 1. Agent Status Enforcement
    if (agentStatus === "revoked") {
      return { approved: false, blocked: true, reason: "Agent is REVOKED", policyViolations: ["AGENT_REVOKED"] };
    }
    if (agentStatus === "paused") {
      violations.push("AGENT_PAUSED");
    }

    const amount = BigInt(transaction.amount);
    const dailyLimit = BigInt(policy.dailyLimit);
    const monthlyLimit = BigInt(policy.monthlyLimit);
    const spent = BigInt(policy.spentAmount || "0");

    // 2. Transaction Limits
    if (policy.maxPerTransaction && amount > BigInt(policy.maxPerTransaction)) {
      violations.push("MAX_PER_TRANSACTION_EXCEEDED");
    }

    // 3. Budget Limits
    if (spent + amount > dailyLimit) {
      violations.push("DAILY_LIMIT_EXCEEDED");
    }
    if (spent + amount > monthlyLimit) {
      violations.push("MONTHLY_LIMIT_EXCEEDED");
    }

    // 4. Whitelist Enforcement
    if (policy.allowedAddresses && policy.allowedAddresses.length > 0) {
      if (!policy.allowedAddresses.includes(transaction.toAddress)) {
        violations.push("ADDRESS_NOT_WHITELISTED");
      }
    }

    // 5. Approval Gates
    if (policy.requireApprovalAbove && amount > BigInt(policy.requireApprovalAbove)) {
      violations.push("HUMAN_APPROVAL_REQUIRED");
    }

    const isBlocked = violations.length > 0;

    return {
      approved: !isBlocked,
      blocked: isBlocked,
      reason: isBlocked ? `Policy violations detected: ${violations.join(", ")}` : undefined,
      policyViolations: violations,
    };
  }

  /**
   * Mock: Reserves budget in the database/cache to prevent overspending.
   */
  async reserveBudget(transaction: Transaction, policy: Policy): Promise<boolean> {
    console.log(`[PolicyEngine] Reserving ${transaction.amount} from budget for agent ${transaction.agentId}`);
    return true;
  }

  /**
   * Mock: Releases reserved budget if a transaction fails or is rejected.
   */
  async releaseBudgetReservation(transaction: Transaction): Promise<void> {
    console.log(`[PolicyEngine] Releasing budget for transaction ${transaction.id}`);
  }

  /**
   * Mock: Persistently marks the budget as spent after confirmation.
   */
  async markBudgetSpent(transaction: Transaction): Promise<void> {
    console.log(`[PolicyEngine] Budget spent confirmed: ${transaction.amount}`);
  }
}
