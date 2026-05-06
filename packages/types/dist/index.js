"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var index_exports = {};
__export(index_exports, {
  AgentSchema: () => AgentSchema,
  AgentStatusSchema: () => AgentStatusSchema,
  AgentWalletSchema: () => AgentWalletSchema,
  AuditLogSchema: () => AuditLogSchema,
  OrganizationSchema: () => OrganizationSchema,
  PolicySchema: () => PolicySchema,
  TransactionSchema: () => TransactionSchema,
  TxStatusSchema: () => TxStatusSchema,
  UserSchema: () => UserSchema
});
module.exports = __toCommonJS(index_exports);
var import_zod = require("zod");
var AgentStatusSchema = import_zod.z.enum(["active", "paused", "revoked"]);
var TxStatusSchema = import_zod.z.enum([
  "pending",
  "approved",
  "blocked",
  "signed",
  "broadcasted",
  "confirmed",
  "failed"
]);
var TransactionSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  agentId: import_zod.z.string().uuid(),
  toAddress: import_zod.z.string(),
  amount: import_zod.z.string(),
  status: TxStatusSchema,
  txHash: import_zod.z.string().optional(),
  createdAt: import_zod.z.date(),
  updatedAt: import_zod.z.date()
});
var OrganizationSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  name: import_zod.z.string(),
  createdAt: import_zod.z.date()
});
var UserSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  orgId: import_zod.z.string().uuid(),
  email: import_zod.z.string().email(),
  role: import_zod.z.enum(["admin", "developer", "viewer"]),
  createdAt: import_zod.z.date()
});
var AgentSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  orgId: import_zod.z.string().uuid(),
  name: import_zod.z.string(),
  status: AgentStatusSchema,
  metadata: import_zod.z.record(import_zod.z.any()).optional(),
  createdAt: import_zod.z.date()
});
var AgentWalletSchema = import_zod.z.object({
  agentId: import_zod.z.string().uuid(),
  address: import_zod.z.string(),
  encryptedSecret: import_zod.z.string(),
  createdAt: import_zod.z.date()
});
var PolicySchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  agentId: import_zod.z.string().uuid(),
  dailyLimit: import_zod.z.string(),
  monthlyLimit: import_zod.z.string(),
  spentAmount: import_zod.z.string().optional(),
  currency: import_zod.z.string().default("KAS"),
  maxPerTransaction: import_zod.z.string().optional(),
  requireApprovalAbove: import_zod.z.string().optional(),
  allowedAddresses: import_zod.z.array(import_zod.z.string()).optional(),
  createdAt: import_zod.z.date()
});
var AuditLogSchema = import_zod.z.object({
  id: import_zod.z.string().uuid(),
  orgId: import_zod.z.string().uuid(),
  actorId: import_zod.z.string().uuid(),
  event: import_zod.z.string(),
  details: import_zod.z.record(import_zod.z.any()),
  createdAt: import_zod.z.date()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AgentSchema,
  AgentStatusSchema,
  AgentWalletSchema,
  AuditLogSchema,
  OrganizationSchema,
  PolicySchema,
  TransactionSchema,
  TxStatusSchema,
  UserSchema
});
