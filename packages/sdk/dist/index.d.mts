import { Agent, Transaction, TxStatus } from '@agentrail/types';

interface AgentRailConfig {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
    maxRetries?: number;
}
declare class AgentRailError extends Error {
    statusCode: number;
    details?: any | undefined;
    constructor(statusCode: number, message: string, details?: any | undefined);
}
/**
 * AgentRail TypeScript SDK
 * A developer-first, backend-ready client for the AgentRail infrastructure.
 */
declare class AgentRail {
    private client;
    constructor(config: AgentRailConfig);
    /**
     * AGENTS
     * Manage your autonomous AI agents and their identities.
     */
    agents: {
        list: () => Promise<Agent[]>;
        get: (id: string) => Promise<Agent>;
        create: (data: {
            name: string;
            metadata?: Record<string, any>;
        }) => Promise<Agent>;
        revoke: (id: string) => Promise<{
            status: "revoked";
        }>;
    };
    /**
     * PAYMENTS
     * Programmatic payment rails for AI agents on the Kaspa network.
     */
    payments: {
        /**
         * Creates a new autonomous payment.
         * @param data.idempotencyKey Required to prevent duplicate payments.
         */
        create: (data: {
            agentId: string;
            toAddress: string;
            amount: string;
            idempotencyKey: string;
            metadata?: Record<string, any>;
        }) => Promise<Transaction>;
        get: (id: string) => Promise<Transaction>;
        list: (filters?: {
            agentId?: string;
            status?: TxStatus;
        }) => Promise<Transaction[]>;
    };
    /**
     * KEYS
     * Manage API keys for organization-level access.
     */
    keys: {
        create: (data: {
            name: string;
            type: "live" | "test";
        }) => Promise<{
            apiKey: string;
        }>;
    };
}

export { AgentRail, type AgentRailConfig, AgentRailError };
