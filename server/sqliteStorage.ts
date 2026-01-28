import { db, schema } from "./db/index.js";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type {
  Subscription,
  InsertSubscription,
  Transaction,
  InsertTransaction,
  Alert,
  InsertAlert,
  Wallet,
  AgentStatus,
  DashboardSummary,
  AuditLog,
} from "@shared/schema";

export interface IStorage {
  getSubscriptions(): Promise<Subscription[]>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  createSubscription(sub: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  getTransactions(): Promise<Transaction[]>;
  createTransaction(txn: InsertTransaction): Promise<Transaction>;
  getAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined>;
  getWallet(): Promise<Wallet>;
  updateWallet(updates: Partial<Wallet>): Promise<Wallet>;
  getAgentStatuses(): Promise<AgentStatus[]>;
  updateAgentStatus(name: string, updates: Partial<AgentStatus>): Promise<AgentStatus | undefined>;
  getDashboardSummary(): Promise<DashboardSummary>;
  createAuditLog(log: Omit<AuditLog, "id">): Promise<AuditLog>;
}

export class SQLiteStorage implements IStorage {
  async getSubscriptions(): Promise<Subscription[]> {
    const rows = db.select().from(schema.subscriptions).all();
    return rows.map(this.mapSubscription);
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const row = db.select().from(schema.subscriptions).where(eq(schema.subscriptions.id, id)).get();
    return row ? this.mapSubscription(row) : undefined;
  }

  async createSubscription(sub: InsertSubscription): Promise<Subscription> {
    const id = uuidv4();
    const newSub = { ...sub, id };
    db.insert(schema.subscriptions).values(newSub).run();
    return this.mapSubscription(newSub as any);
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const existing = await this.getSubscription(id);
    if (!existing) return undefined;
    
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.autoPayEnabled !== undefined) dbUpdates.autoPayEnabled = updates.autoPayEnabled;
    if (updates.currentAmount !== undefined) dbUpdates.currentAmount = updates.currentAmount;
    if (updates.previousAmount !== undefined) dbUpdates.previousAmount = updates.previousAmount;
    if (updates.lastUsedDate !== undefined) dbUpdates.lastUsedDate = updates.lastUsedDate;
    
    db.update(schema.subscriptions).set(dbUpdates).where(eq(schema.subscriptions.id, id)).run();
    return this.getSubscription(id);
  }

  async getTransactions(): Promise<Transaction[]> {
    const rows = db.select().from(schema.transactions).all();
    return rows.map(this.mapTransaction);
  }

  async createTransaction(txn: InsertTransaction): Promise<Transaction> {
    const id = uuidv4();
    const newTxn = { ...txn, id };
    db.insert(schema.transactions).values(newTxn).run();
    return this.mapTransaction(newTxn as any);
  }

  async getAlerts(): Promise<Alert[]> {
    const rows = db.select().from(schema.alerts).all();
    return rows.map(this.mapAlert);
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    const row = db.select().from(schema.alerts).where(eq(schema.alerts.id, id)).get();
    return row ? this.mapAlert(row) : undefined;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = uuidv4();
    const dbAlert = {
      id,
      type: alert.type,
      severity: alert.severity,
      subscriptionId: alert.subscriptionId,
      merchant: alert.merchant,
      title: alert.title,
      description: alert.description,
      financialImpactMonthly: alert.financialImpact.monthly,
      financialImpactYearly: alert.financialImpact.yearly,
      recommendation: alert.recommendation,
      aiExplanation: alert.aiExplanation,
      status: alert.status,
      createdAt: alert.createdAt,
      oldAmount: alert.oldAmount ?? null,
      newAmount: alert.newAmount ?? null,
    };
    db.insert(schema.alerts).values(dbAlert).run();
    
    await this.createAuditLog({
      timestamp: new Date().toISOString(),
      action: "alert_created",
      entityType: "alert",
      entityId: id,
      details: `Created alert: ${alert.title} for ${alert.merchant}`,
      userApproved: false,
    });
    
    return this.mapAlert({ ...dbAlert } as any);
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const existing = await this.getAlert(id);
    if (!existing) return undefined;
    
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    
    db.update(schema.alerts).set(dbUpdates).where(eq(schema.alerts.id, id)).run();
    return this.getAlert(id);
  }

  async getWallet(): Promise<Wallet> {
    const row = db.select().from(schema.wallet).get();
    if (!row) {
      return { id: "wallet-1", balance: 45250, currency: "INR", lastUpdated: new Date().toISOString() };
    }
    return row;
  }

  async updateWallet(updates: Partial<Wallet>): Promise<Wallet> {
    const current = await this.getWallet();
    const newBalance = updates.balance ?? current.balance;
    db.update(schema.wallet).set({ balance: newBalance, lastUpdated: new Date().toISOString() }).where(eq(schema.wallet.id, current.id)).run();
    return this.getWallet();
  }

  async getAgentStatuses(): Promise<AgentStatus[]> {
    return db.select().from(schema.agentStatuses).all();
  }

  async updateAgentStatus(name: string, updates: Partial<AgentStatus>): Promise<AgentStatus | undefined> {
    const existing = db.select().from(schema.agentStatuses).where(eq(schema.agentStatuses.name, name)).get();
    if (!existing) return undefined;
    
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.lastRun !== undefined) dbUpdates.lastRun = updates.lastRun;
    if (updates.observations !== undefined) dbUpdates.observations = updates.observations;
    
    db.update(schema.agentStatuses).set(dbUpdates).where(eq(schema.agentStatuses.name, name)).run();
    return db.select().from(schema.agentStatuses).where(eq(schema.agentStatuses.name, name)).get();
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    const subscriptions = await this.getSubscriptions();
    const alerts = await this.getAlerts();
    const wallet = await this.getWallet();

    const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
    const monthlySpend = activeSubscriptions.reduce((acc, s) => {
      if (s.billingCycle === "monthly") {
        return acc + s.currentAmount;
      }
      return acc + s.currentAmount / 12;
    }, 0);

    const pendingAlerts = alerts.filter((a) => a.status === "pending");
    const potentialSavings = pendingAlerts.reduce((acc, a) => acc + a.financialImpact.yearly, 0);

    let riskScore: "low" | "medium" | "high" = "low";
    if (pendingAlerts.some((a) => a.severity === "high")) {
      riskScore = "high";
    } else if (pendingAlerts.some((a) => a.severity === "medium")) {
      riskScore = "medium";
    }

    return {
      wallet,
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      monthlySpend: Math.round(monthlySpend),
      yearlyProjectedSpend: Math.round(monthlySpend * 12),
      potentialSavings: Math.round(potentialSavings),
      pendingAlerts: pendingAlerts.length,
      riskScore,
    };
  }

  async createAuditLog(log: Omit<AuditLog, "id">): Promise<AuditLog> {
    const id = uuidv4();
    const auditLog = { ...log, id };
    db.insert(schema.auditLogs).values(auditLog).run();
    console.log(`[AUDIT] ${log.action}: ${log.details}`);
    return auditLog;
  }

  private mapSubscription(row: any): Subscription {
    return {
      id: row.id,
      merchant: row.merchant,
      merchantLogo: row.merchantLogo ?? row.merchant_logo,
      currentAmount: row.currentAmount ?? row.current_amount,
      previousAmount: row.previousAmount ?? row.previous_amount,
      billingCycle: row.billingCycle ?? row.billing_cycle,
      status: row.status,
      lastUsedDate: row.lastUsedDate ?? row.last_used_date,
      nextBillingDate: row.nextBillingDate ?? row.next_billing_date,
      category: row.category,
      autoPayEnabled: Boolean(row.autoPayEnabled ?? row.auto_pay_enabled),
    };
  }

  private mapTransaction(row: any): Transaction {
    return {
      id: row.id,
      date: row.date,
      merchant: row.merchant,
      merchantLogo: row.merchantLogo ?? row.merchant_logo,
      amount: row.amount,
      transactionType: row.transactionType ?? row.transaction_type,
      status: row.status,
      subscriptionId: row.subscriptionId ?? row.subscription_id,
      category: row.category,
    };
  }

  private mapAlert(row: any): Alert {
    return {
      id: row.id,
      type: row.type,
      severity: row.severity,
      subscriptionId: row.subscriptionId ?? row.subscription_id,
      merchant: row.merchant,
      title: row.title,
      description: row.description,
      financialImpact: {
        monthly: row.financialImpactMonthly ?? row.financial_impact_monthly,
        yearly: row.financialImpactYearly ?? row.financial_impact_yearly,
      },
      recommendation: row.recommendation,
      aiExplanation: row.aiExplanation ?? row.ai_explanation,
      status: row.status,
      createdAt: row.createdAt ?? row.created_at,
      oldAmount: row.oldAmount ?? row.old_amount,
      newAmount: row.newAmount ?? row.new_amount,
    };
  }
}

export const storage = new SQLiteStorage();
