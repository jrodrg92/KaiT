import { z } from "zod";

export const TxStatusSchema = z.enum([
  "created",
  "budget_reserved",
  "queued",
  "signing",
  "signed",
  "broadcasted",
  "confirmed",
  "failed",
  "canceled",
]);

export type TxStatus = z.infer<typeof TxStatusSchema>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  toAddress: z.string(),
  amount: z.string(),
  status: TxStatusSchema,
  txHash: z.string().optional(),
  failureReason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const AgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.enum(["active", "paused", "revoked"]),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
});

export type Agent = z.infer<typeof AgentSchema>;

export const PolicySchema = z.object({
  id: z.string().uuid(),
  agentId: z.string().uuid(),
  dailyLimit: z.string(),
  monthlyLimit: z.string(),
  spentDaily: z.string(),
  spentMonthly: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

export type Policy = z.infer<typeof PolicySchema>;

export const WalletSchema = z.object({
  address: z.string(),
  agentId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type Wallet = z.infer<typeof WalletSchema>;

export const EventSchema = z.object({
  id: z.string(),
  type: z.string(),
  payload: z.record(z.any()),
  createdAt: z.string().datetime(),
});

export type Event = z.infer<typeof EventSchema>;

export const WebhookEndpointSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  events: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

export type WebhookEndpoint = z.infer<typeof WebhookEndpointSchema>;

/**
 * Pagination & Filtering
 */
export interface ListOptions {
  limit?: number;
  offset?: number;
  status?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

