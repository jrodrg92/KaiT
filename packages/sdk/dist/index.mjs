// index.ts
import axios from "axios";
var AgentRailError = class _AgentRailError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AgentRailError";
    Object.setPrototypeOf(this, _AgentRailError.prototype);
  }
};
var AgentRail = class {
  client;
  constructor(config) {
    if (!config.apiKey) {
      throw new Error("AgentRail API Key is required. Get one at https://dashboard.agentrail.io");
    }
    this.client = axios.create({
      baseURL: config.baseUrl || "https://api.agentrail.io/v1",
      timeout: config.timeout || 15e3,
      headers: {
        "X-API-Key": config.apiKey,
        // Using standard X-API-Key header
        "Content-Type": "application/json",
        "User-Agent": "AgentRail-NodeSDK/1.0.0"
      }
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new AgentRailError(
            error.response.status,
            error.response.data?.error || "AgentRail API Error",
            error.response.data
          );
        }
        throw error;
      }
    );
  }
  /**
   * AGENTS
   * Manage your autonomous AI agents and their identities.
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
   * PAYMENTS
   * Programmatic payment rails for AI agents on the Kaspa network.
   */
  payments = {
    /**
     * Creates a new autonomous payment.
     * @param data.idempotencyKey Required to prevent duplicate payments.
     */
    create: async (data) => {
      const res = await this.client.post("/payments", data);
      return res.data;
    },
    get: async (id) => {
      const res = await this.client.get(`/transactions/${id}`);
      return res.data;
    },
    list: async (filters) => {
      const res = await this.client.get("/transactions", { params: filters });
      return res.data;
    }
  };
  /**
   * KEYS
   * Manage API keys for organization-level access.
   */
  keys = {
    create: async (data) => {
      const res = await this.client.post("/api-keys", data);
      return res.data;
    }
  };
};
export {
  AgentRail,
  AgentRailError
};
