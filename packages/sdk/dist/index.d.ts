import { Agent, Transaction } from '@agentrail/types';

declare module "axios" {
    interface AxiosRequestConfig {
        __retryCount?: number;
        maxRetries?: number;
    }
}
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
declare class AgentRail {
    private client;
    constructor(config: AgentRailConfig);
    private handleError;
    /**
     * Agents Management
     */
    agents: {
        list: () => Promise<Agent[]>;
        get: (id: string) => Promise<Agent>;
        create: (data: {
            name: string;
            metadata?: any;
        }) => Promise<Agent>;
        revoke: (id: string) => Promise<{
            status: string;
        }>;
    };
    /**
     * Payments & Transactions
     */
    payments: {
        send: (data: {
            agentId: string;
            toAddress: string;
            amount: string;
            idempotencyKey?: string;
        }) => Promise<Transaction>;
        listTransactions: (agentId?: string) => Promise<Transaction[]>;
    };
    /**
     * Webhooks & Usage
     */
    webhooks: {
        list: () => Promise<any>;
        create: (data: {
            url: string;
            events: string[];
        }) => Promise<any>;
    };
}

export { AgentRail, type AgentRailConfig, AgentRailError };
