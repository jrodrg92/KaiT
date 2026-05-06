import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { z } from "zod";
import { Agent, Transaction, Policy } from "@agentrail/types";

declare module "axios" {
  export interface AxiosRequestConfig {
    __retryCount?: number;
    maxRetries?: number;
  }
}

export interface AgentRailConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export class AgentRailError extends Error {
  constructor(public statusCode: number, message: string, public details?: any) {
    super(message);
    this.name = "AgentRailError";
  }
}

export class AgentRail {
  private client: AxiosInstance;

  constructor(config: AgentRailConfig) {
    if (!config.apiKey) throw new Error("AgentRail API Key is required");

    this.client = axios.create({
      baseURL: config.baseUrl || "https://api.agentrail.io/v1",
      timeout: config.timeout || 10000,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // Simple Retry Interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        if (!config || !config.maxRetries) return Promise.reject(this.handleError(error));
        
        config.__retryCount = config.__retryCount || 0;
        if (config.__retryCount >= config.maxRetries) return Promise.reject(this.handleError(error));

        config.__retryCount += 1;
        return this.client(config);
      }
    );
  }

  private handleError(error: any) {
    if (error.response) {
      return new AgentRailError(
        error.response.status,
        error.response.data?.error || "API Error",
        error.response.data
      );
    }
    return new Error(error.message || "Network Error");
  }

  /**
   * Agents Management
   */
  public agents = {
    list: async (): Promise<Agent[]> => {
      const res = await this.client.get("/agents");
      return res.data;
    },
    get: async (id: string): Promise<Agent> => {
      const res = await this.client.get(`/agents/${id}`);
      return res.data;
    },
    create: async (data: { name: string; metadata?: any }): Promise<Agent> => {
      const res = await this.client.post("/agents", data);
      return res.data;
    },
    revoke: async (id: string): Promise<{ status: string }> => {
      const res = await this.client.post(`/agents/${id}/revoke`);
      return res.data;
    }
  };

  /**
   * Payments & Transactions
   */
  public payments = {
    send: async (data: { agentId: string; toAddress: string; amount: string; idempotencyKey?: string }): Promise<Transaction> => {
      const res = await this.client.post("/payments", data);
      return res.data;
    },
    listTransactions: async (agentId?: string): Promise<Transaction[]> => {
      const params = agentId ? { agentId } : {};
      const res = await this.client.get("/transactions", { params });
      return txSchema.array().parse(res.data); // Validation example
    }
  };

  /**
   * Webhooks & Usage
   */
  public webhooks = {
    list: async () => {
      const res = await this.client.get("/webhooks");
      return res.data;
    },
    create: async (data: { url: string; events: string[] }) => {
      const res = await this.client.post("/webhooks", data);
      return res.data;
    }
  };
}

// Internal Zod schema for runtime validation
const txSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  toAddress: z.string(),
  amount: z.string(),
  status: z.enum(["pending", "approved", "blocked", "signed", "broadcasted", "confirmed", "failed"]),
  txHash: z.string().optional(),
  createdAt: z.string().or(z.date()).transform(val => new Date(val)),
  updatedAt: z.string().or(z.date()).transform(val => new Date(val)),
});
