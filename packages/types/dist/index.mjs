// index.ts
import { z } from "zod";
var AgentStatusSchema = z.enum(["active", "paused", "revoked"]);
var TxStatusSchema = z.enum([
  "pending",
  "approved",
  "blocked",
  "signed",
  "broadcasted",
  "confirmed",
  "failed"
]);
var TransactionSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  toAddress: z.string(),
  amount: z.string(),
  status: TxStatusSchema,
  txHash: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});
var OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date()
});
var UserSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "developer", "viewer"]),
  createdAt: z.date()
});
var AgentSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string(),
  status: AgentStatusSchema,
  metadata: z.record(z.any()).optional(),
  createdAt: z.date()
});
var AgentWalletSchema = z.object({
  agentId: z.string().uuid(),
  address: z.string(),
  encryptedSecret: z.string(),
  createdAt: z.date()
});
var PolicySchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  dailyLimit: z.string(),
  monthlyLimit: z.string(),
  spentAmount: z.string().optional(),
  currency: z.string().default("KAS"),
  maxPerTransaction: z.string().optional(),
  requireApprovalAbove: z.string().optional(),
  allowedAddresses: z.array(z.string()).optional(),
  createdAt: z.date()
});
var AuditLogSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  actorId: z.string().uuid(),
  event: z.string(),
  details: z.record(z.any()),
  createdAt: z.date()
});
export {
  AgentSchema,
  AgentStatusSchema,
  AgentWalletSchema,
  AuditLogSchema,
  OrganizationSchema,
  PolicySchema,
  TransactionSchema,
  TxStatusSchema,
  UserSchema
};
