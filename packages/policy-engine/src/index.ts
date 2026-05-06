import { Transaction, Policy, AgentStatus } from "@agentrail/types";
import { db, policies, policyWhitelists } from "@agentrail/db";
import { eq, and, sql } from "drizzle-orm";

export interface PolicyEvaluationResult {
  approved: boolean;
  blocked: boolean;
  reason?: string;
  policyViolations: string[];
}

export class PolicyEngine {
  /**
   * Evaluates if a payment complies with all agent and organizational policies.
   * This is a static check used before attempting the atomic DB reservation.
   */
  evaluatePaymentPolicy(
    transaction: Transaction,
    policy: Policy,
    agentStatus: AgentStatus
  ): PolicyEvaluationResult {
    const violations: string[] = [];

    if (agentStatus === "revoked") {
      return { approved: false, blocked: true, reason: "Agent is REVOKED", policyViolations: ["AGENT_REVOKED"] };
    }
    if (agentStatus === "paused") {
      violations.push("AGENT_PAUSED");
    }

    const amount = BigInt(transaction.amount);
    const dailyLimit = BigInt(policy.dailyLimit);
    const monthlyLimit = BigInt(policy.monthlyLimit);
    const spentDaily = BigInt(policy.spentDaily || "0");
    const spentMonthly = BigInt(policy.spentMonthly || "0");

    if (policy.maxPerTransaction && amount > BigInt(policy.maxPerTransaction)) {
      violations.push("MAX_PER_TRANSACTION_EXCEEDED");
    }

    if (spentDaily + amount > dailyLimit) {
      violations.push("DAILY_LIMIT_EXCEEDED");
    }
    if (spentMonthly + amount > monthlyLimit) {
      violations.push("MONTHLY_LIMIT_EXCEEDED");
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
   * ATOMIC BUDGET RESERVATION (Postgres Native)
   * Uses a single UPDATE statement with conditional WHERE clause to ensure atomicity.
   * Source of truth: Supabase Postgres.
   */
  async reserveBudget(agentId: string, amount: string): Promise<{ success: boolean; reason?: string }> {
    const amountStr = amount.toString();

    // Atomic increment with limit check in Postgres
    const [updatedPolicy] = await db
      .update(policies)
      .set({
        spentDaily: sql`spent_daily + ${amountStr}`,
        spentMonthly: sql`spent_monthly + ${amountStr}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(policies.agentId, agentId),
          eq(policies.isActive, true),
          // Ensure we don't exceed limits in the same atomic operation
          sql`spent_daily + ${amountStr} <= daily_limit`,
          sql`spent_monthly + ${amountStr} <= monthly_limit`
        )
      )
      .returning();

    if (!updatedPolicy) {
      return { 
        success: false, 
        reason: "POLICY_VIOLATION: Limit exceeded or inactive policy" 
      };
    }

    return { success: true };
  }

  /**
   * Releases reserved budget from Postgres if transaction fails pre-broadcast.
   */
  async releaseBudgetReservation(agentId: string, amount: string): Promise<void> {
    const amountStr = amount.toString();
    
    await db.update(policies)
      .set({
        spentDaily: sql`spent_daily - ${amountStr}`,
        spentMonthly: sql`spent_monthly - ${amountStr}`,
        updatedAt: new Date(),
      })
      .where(eq(policies.agentId, agentId));
  }

  /**
   * Confirms budget spent.
   * Since we already deducted at reservation, this is for audit consistency.
   */
  async markBudgetSpent(transactionId: string): Promise<void> {
    // Audit logic already handled in worker
  }
}
