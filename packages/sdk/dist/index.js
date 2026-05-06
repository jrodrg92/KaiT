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
    this.client = import_axios.default.create({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AgentRail,
  AgentRailError
});
