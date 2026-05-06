import { z } from 'zod';

declare const AgentStatusSchema: z.ZodEnum<["active", "paused", "revoked"]>;
declare const TxStatusSchema: z.ZodEnum<["pending", "approved", "blocked", "signed", "broadcasted", "confirmed", "failed"]>;
declare const TransactionSchema: z.ZodObject<{
    id: z.ZodString;
    agentId: z.ZodString;
    toAddress: z.ZodString;
    amount: z.ZodString;
    status: z.ZodEnum<["pending", "approved", "blocked", "signed", "broadcasted", "confirmed", "failed"]>;
    txHash: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    agentId: string;
    toAddress: string;
    amount: string;
    status: "pending" | "approved" | "blocked" | "signed" | "broadcasted" | "confirmed" | "failed";
    createdAt: Date;
    updatedAt: Date;
    txHash?: string | undefined;
}, {
    id: string;
    agentId: string;
    toAddress: string;
    amount: string;
    status: "pending" | "approved" | "blocked" | "signed" | "broadcasted" | "confirmed" | "failed";
    createdAt: Date;
    updatedAt: Date;
    txHash?: string | undefined;
}>;
declare const OrganizationSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    name: string;
}, {
    id: string;
    createdAt: Date;
    name: string;
}>;
declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    orgId: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["admin", "developer", "viewer"]>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    orgId: string;
    email: string;
    role: "admin" | "developer" | "viewer";
}, {
    id: string;
    createdAt: Date;
    orgId: string;
    email: string;
    role: "admin" | "developer" | "viewer";
}>;
declare const AgentSchema: z.ZodObject<{
    id: z.ZodString;
    orgId: z.ZodString;
    name: z.ZodString;
    status: z.ZodEnum<["active", "paused", "revoked"]>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "active" | "paused" | "revoked";
    createdAt: Date;
    name: string;
    orgId: string;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    status: "active" | "paused" | "revoked";
    createdAt: Date;
    name: string;
    orgId: string;
    metadata?: Record<string, any> | undefined;
}>;
declare const AgentWalletSchema: z.ZodObject<{
    agentId: z.ZodString;
    address: z.ZodString;
    encryptedSecret: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    agentId: string;
    createdAt: Date;
    address: string;
    encryptedSecret: string;
}, {
    agentId: string;
    createdAt: Date;
    address: string;
    encryptedSecret: string;
}>;
declare const PolicySchema: z.ZodObject<{
    id: z.ZodString;
    agentId: z.ZodString;
    dailyLimit: z.ZodString;
    monthlyLimit: z.ZodString;
    spentAmount: z.ZodOptional<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    maxPerTransaction: z.ZodOptional<z.ZodString>;
    requireApprovalAbove: z.ZodOptional<z.ZodString>;
    allowedAddresses: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    agentId: string;
    createdAt: Date;
    dailyLimit: string;
    monthlyLimit: string;
    currency: string;
    spentAmount?: string | undefined;
    maxPerTransaction?: string | undefined;
    requireApprovalAbove?: string | undefined;
    allowedAddresses?: string[] | undefined;
}, {
    id: string;
    agentId: string;
    createdAt: Date;
    dailyLimit: string;
    monthlyLimit: string;
    spentAmount?: string | undefined;
    currency?: string | undefined;
    maxPerTransaction?: string | undefined;
    requireApprovalAbove?: string | undefined;
    allowedAddresses?: string[] | undefined;
}>;
declare const AuditLogSchema: z.ZodObject<{
    id: z.ZodString;
    orgId: z.ZodString;
    actorId: z.ZodString;
    event: z.ZodString;
    details: z.ZodRecord<z.ZodString, z.ZodAny>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    orgId: string;
    actorId: string;
    event: string;
    details: Record<string, any>;
}, {
    id: string;
    createdAt: Date;
    orgId: string;
    actorId: string;
    event: string;
    details: Record<string, any>;
}>;
type Agent = z.infer<typeof AgentSchema>;
type Transaction = z.infer<typeof TransactionSchema>;
type Policy = z.infer<typeof PolicySchema>;
type AgentStatus = z.infer<typeof AgentStatusSchema>;
type TxStatus = z.infer<typeof TxStatusSchema>;

export { type Agent, AgentSchema, type AgentStatus, AgentStatusSchema, AgentWalletSchema, AuditLogSchema, OrganizationSchema, type Policy, PolicySchema, type Transaction, TransactionSchema, type TxStatus, TxStatusSchema, UserSchema };
