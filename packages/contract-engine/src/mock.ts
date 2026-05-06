import { Agent, Policy, Transaction } from "@agentrail/types";
import { ContractEngine } from "./index";

export class MockContractEngine implements ContractEngine {
  private registry = new Map<string, Agent>();
  private vaults = new Set<string>();
  private policies = new Map<string, Policy>();

  async registerAgent(agent: Agent): Promise<string> {
    console.log(`[MockEngine] Registering agent: ${agent.name} (${agent.id})`);
    this.registry.set(agent.id, agent);
    return `mock_registry_tx_${Date.now()}`;
  }

  async createVault(agentId: string): Promise<string> {
    console.log(`[MockEngine] Creating vault for agent: ${agentId}`);
    this.vaults.add(agentId);
    return `mock_vault_address_${agentId.slice(0, 8)}`;
  }

  async updatePolicy(agentId: string, policy: Policy): Promise<void> {
    console.log(`[MockEngine] Updating policy for agent: ${agentId}`);
    this.policies.set(agentId, policy);
  }

  async settlePayment(transaction: Transaction, proof: string): Promise<string> {
    console.log(`[MockEngine] Settling payment: ${transaction.amount} to ${transaction.toAddress}`);
    return `mock_settlement_hash_${Date.now()}`;
  }

  async revokeAgent(agentId: string): Promise<void> {
    console.log(`[MockEngine] Revoking agent: ${agentId}`);
    const agent = this.registry.get(agentId);
    if (agent) {
      agent.status = "REVOKED";
    }
  }
}
