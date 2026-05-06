"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var index_exports = {};
__export(index_exports, {
  AgentRail: () => AgentRail,
  AgentRailError: () => AgentRailError
});
module.exports = __toCommonJS(index_exports);
var import_axios = __toESM(require("axios"));
var import_zod = require("zod");
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
    this.client = import_axios.default.create({
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
var txSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  agentId: import_zod.z.string().uuid(),
  toAddress: import_zod.z.string(),
  amount: import_zod.z.string(),
  status: import_zod.z.enum(["pending", "approved", "blocked", "signed", "broadcasted", "confirmed", "failed"]),
  txHash: import_zod.z.string().optional(),
  createdAt: import_zod.z.string().or(import_zod.z.date()).transform((val) => new Date(val)),
  updatedAt: import_zod.z.string().or(import_zod.z.date()).transform((val) => new Date(val))
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AgentRail,
  AgentRailError
});
