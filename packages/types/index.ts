import { z } from "zod";

// Status Enums
export const AgentStatusSchema = z.enum(["active", "paused", "revoked"]);
export const TxStatusSchema = z.enum([
  "pending", 
  "approved", 
  "blocked", 
  "signed", 
  "broadcasted", 
  "confirmed", 
  "failed"
]);

// Internal helper for Transaction
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  toAddress: z.string(),
  amount: z.string(),
  status: TxStatusSchema,
  txHash: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Organizations & Users
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "developer", "viewer"]),
  createdAt: z.date(),
});

// Agents & Wallets
export const AgentSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string(),
  status: AgentStatusSchema,
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
});

export const AgentWalletSchema = z.object({
  agentId: z.string().uuid(),
  address: z.string(),
  encryptedSecret: z.string(),
  createdAt: z.date(),
});

// Policies
export const PolicySchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  dailyLimit: z.string(),
  monthlyLimit: z.string(),
  spentAmount: z.string().optional(),
  currency: z.string().default("KAS"),
  maxPerTransaction: z.string().optional(),
  requireApprovalAbove: z.string().optional(),
  allowedAddresses: z.array(z.string()).optional(),
  createdAt: z.date(),
});

// Audit & Usage
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  actorId: z.string().uuid(),
  event: z.string(),
  details: z.record(z.any()),
  createdAt: z.date(),
});

// Exported Types
export type Agent = z.infer<typeof AgentSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Policy = z.infer<typeof PolicySchema>;
export type AgentStatus = z.infer<typeof AgentStatusSchema>;
export type TxStatus = z.infer<typeof TxStatusSchema>;
