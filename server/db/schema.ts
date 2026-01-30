import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  merchant: text('merchant').notNull(),
  merchantLogo: text('merchant_logo'),
  currentAmount: real('current_amount').notNull(),
  previousAmount: real('previous_amount'),
  billingCycle: text('billing_cycle').notNull(),
  status: text('status').notNull(),
  lastUsedDate: text('last_used_date'),
  nextBillingDate: text('next_billing_date').notNull(),
  category: text('category').notNull(),
  autoPayEnabled: integer('auto_pay_enabled').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  merchant: text('merchant').notNull(),
  merchantLogo: text('merchant_logo'),
  amount: real('amount').notNull(),
  transactionType: text('transaction_type').notNull(),
  status: text('status').notNull(),
  subscriptionId: text('subscription_id'),
  category: text('category').notNull(),
});

export const alerts = sqliteTable('alerts', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  severity: text('severity').notNull(),
  subscriptionId: text('subscription_id').notNull(),
  merchant: text('merchant').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  financialImpactMonthly: real('financial_impact_monthly').notNull(),
  financialImpactYearly: real('financial_impact_yearly').notNull(),
  recommendation: text('recommendation').notNull(),
  aiExplanation: text('ai_explanation').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
  oldAmount: real('old_amount'),
  newAmount: real('new_amount'),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  details: text('details').notNull(),
  userApproved: integer('user_approved').notNull(),
});

export const wallet = sqliteTable('wallet', {
  id: text('id').primaryKey(),
  balance: real('balance').notNull(),
  currency: text('currency').notNull(),
  lastUpdated: text('last_updated').notNull(),
});

export const agentStatuses = sqliteTable('agent_statuses', {
  name: text('name').primaryKey(),
  status: text('status').notNull(),
  lastRun: text('last_run').notNull(),
  observations: integer('observations').notNull(),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  platform: text('platform').notNull(),
  platformLogo: text('platform_logo'),
  amount: real('amount').notNull(),
  billingCycle: text('billing_cycle').notNull(),
  paymentMethod: text('payment_method'),
  status: text('status').notNull(),
  transactionId: text('transaction_id'),
  subscriptionId: text('subscription_id'),
  createdAt: text('created_at').notNull(),
  completedAt: text('completed_at'),
  qrCode: text('qr_code'),
});