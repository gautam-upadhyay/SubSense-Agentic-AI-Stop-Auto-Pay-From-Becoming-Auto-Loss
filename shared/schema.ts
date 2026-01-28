import { z } from "zod";

// Subscription Schema
export const subscriptionSchema = z.object({
  id: z.string(),
  merchant: z.string(),
  merchantLogo: z.string().optional(),
  currentAmount: z.number(),
  previousAmount: z.number().optional(),
  billingCycle: z.enum(["monthly", "yearly"]),
  status: z.enum(["active", "paused", "cancelled"]),
  lastUsedDate: z.string().nullable(),
  nextBillingDate: z.string(),
  category: z.string(),
  autoPayEnabled: z.boolean(),
});

export const insertSubscriptionSchema = subscriptionSchema.omit({ id: true });

export type Subscription = z.infer<typeof subscriptionSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Transaction Schema
export const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  merchant: z.string(),
  merchantLogo: z.string().optional(),
  amount: z.number(),
  transactionType: z.enum(["AUTO_PAY", "MANUAL"]),
  status: z.enum(["success", "blocked", "pending"]),
  subscriptionId: z.string().optional(),
  category: z.string(),
});

export const insertTransactionSchema = transactionSchema.omit({ id: true });

export type Transaction = z.infer<typeof transactionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Alert Schema
export const alertSchema = z.object({
  id: z.string(),
  type: z.enum(["price_increase", "unused_subscription", "trial_to_paid", "plan_drift", "upcoming_renewal", "duplicate_service", "small_charges"]),
  severity: z.enum(["high", "medium", "low"]),
  subscriptionId: z.string(),
  merchant: z.string(),
  title: z.string(),
  description: z.string(),
  financialImpact: z.object({
    monthly: z.number(),
    yearly: z.number(),
  }),
  recommendation: z.string(),
  aiExplanation: z.string(),
  status: z.enum(["pending", "resolved", "dismissed"]),
  createdAt: z.string(),
  oldAmount: z.number().optional(),
  newAmount: z.number().optional(),
});

// Audit Log Schema
export const auditLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  action: z.enum(["alert_created", "alert_resolved", "alert_dismissed", "subscription_cancelled", "subscription_paused", "subscription_resumed", "agent_run"]),
  entityType: z.enum(["alert", "subscription", "agent"]),
  entityId: z.string(),
  details: z.string(),
  userApproved: z.boolean(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;

export const insertAlertSchema = alertSchema.omit({ id: true });

export type Alert = z.infer<typeof alertSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Wallet Schema
export const walletSchema = z.object({
  id: z.string(),
  balance: z.number(),
  currency: z.string(),
  lastUpdated: z.string(),
});

export type Wallet = z.infer<typeof walletSchema>;

// AI Agent Status Schema
export const agentStatusSchema = z.object({
  name: z.string(),
  status: z.enum(["active", "idle", "processing"]),
  lastRun: z.string(),
  observations: z.number(),
});

export type AgentStatus = z.infer<typeof agentStatusSchema>;

// Dashboard Summary
export const dashboardSummarySchema = z.object({
  wallet: walletSchema,
  totalSubscriptions: z.number(),
  activeSubscriptions: z.number(),
  monthlySpend: z.number(),
  yearlyProjectedSpend: z.number(),
  potentialSavings: z.number(),
  pendingAlerts: z.number(),
  riskScore: z.enum(["low", "medium", "high"]),
});

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;

// Payment Schema
export const paymentSchema = z.object({
  id: z.string(),
  platform: z.string(),
  platformLogo: z.string().optional(),
  amount: z.number(),
  billingCycle: z.enum(["monthly", "yearly"]),
  paymentMethod: z.enum(["upi", "qr", "card"]).optional(),
  status: z.enum(["pending", "processing", "success", "failed"]),
  transactionId: z.string().optional(),
  subscriptionId: z.string().optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  qrCode: z.string().optional(),
});

export const initiatePaymentSchema = z.object({
  platform: z.string(),
  amount: z.number(),
  billingCycle: z.enum(["monthly", "yearly"]),
  paymentMethod: z.enum(["upi", "qr", "card"]),
});

export const confirmPaymentSchema = z.object({
  paymentId: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;
export type InitiatePayment = z.infer<typeof initiatePaymentSchema>;
export type ConfirmPayment = z.infer<typeof confirmPaymentSchema>;

// Platform for Marketplace
export const platformSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string(),
  category: z.string(),
  monthlyPrice: z.number(),
  yearlyPrice: z.number(),
  description: z.string(),
  popular: z.boolean().optional(),
});

export type Platform = z.infer<typeof platformSchema>;
