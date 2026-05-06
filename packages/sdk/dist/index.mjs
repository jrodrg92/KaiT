// index.ts
import axios from "axios";
import { z } from "zod";
var AgentRailError = class extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AgentRailError";
  }
};
var AgentRail = class {
  client;
  constructor(config) {
    if (!config.apiKey) throw new Error("AgentRail API Key is required");
    this.client = axios.create({
      baseURL: config.baseUrl || "https://api.agentrail.io/v1",
      timeout: config.timeout || 1e4,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      }
    });
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config2 = error.config;
        if (!config2 || !config2.maxRetries) return Promise.reject(this.handleError(error));
        config2.__retryCount = config2.__retryCount || 0;
        if (config2.__retryCount >= config2.maxRetries) return Promise.reject(this.handleError(error));
        config2.__retryCount += 1;
        return this.client(config2);
      }
    );
  }
  handleError(error) {
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
  agents = {
    list: async () => {
      const res = await this.client.get("/agents");
      return res.data;
    },
    get: async (id) => {
      const res = await this.client.get(`/agents/${id}`);
      return res.data;
    },
    create: async (data) => {
      const res = await this.client.post("/agents", data);
      return res.data;
    },
    revoke: async (id) => {
      const res = await this.client.post(`/agents/${id}/revoke`);
      return res.data;
    }
  };
  /**
   * Payments & Transactions
   */
  payments = {
    send: async (data) => {
      const res = await this.client.post("/payments", data);
      return res.data;
    },
    listTransactions: async (agentId) => {
      const params = agentId ? { agentId } : {};
      const res = await this.client.get("/transactions", { params });
      return txSchema.array().parse(res.data);
    }
  };
  /**
   * Webhooks & Usage
   */
  webhooks = {
    list: async () => {
      const res = await this.client.get("/webhooks");
      return res.data;
    },
    create: async (data) => {
      const res = await this.client.post("/webhooks", data);
      return res.data;
    }
  };
};
var txSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  toAddress: z.string(),
  amount: z.string(),
  status: z.enum(["pending", "approved", "blocked", "signed", "broadcasted", "confirmed", "failed"]),
  txHash: z.string().optional(),
  createdAt: z.string().or(z.date()).transform((val) => new Date(val)),
  updatedAt: z.string().or(z.date()).transform((val) => new Date(val))
});
export {
  AgentRail,
  AgentRailError
};
