import { db, schema } from "./db/index.js";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { IStorage } from "./storage.js";
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
    const dbRow = {
      id,
      merchant: sub.merchant,
      merchantLogo: sub.merchantLogo ?? null,
      currentAmount: sub.currentAmount,
      previousAmount: sub.previousAmount ?? null,
      billingCycle: sub.billingCycle,
      status: sub.status,
      lastUsedDate: sub.lastUsedDate ?? null,
      nextBillingDate: sub.nextBillingDate,
      category: sub.category,
      autoPayEnabled: sub.autoPayEnabled,
    };
    db.insert(schema.subscriptions).values(dbRow).run();
    const inserted = db.select().from(schema.subscriptions).where(eq(schema.subscriptions.id, id)).get();
    return this.mapSubscription(inserted!);
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const existing = await this.getSubscription(id);
    if (!existing) return undefined;
    
    const dbUpdates: Record<string, any> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.autoPayEnabled !== undefined) dbUpdates.autoPayEnabled = updates.autoPayEnabled;
    if (updates.currentAmount !== undefined) dbUpdates.currentAmount = updates.currentAmount;
    if (updates.previousAmount !== undefined) dbUpdates.previousAmount = updates.previousAmount;
    if (updates.lastUsedDate !== undefined) dbUpdates.lastUsedDate = updates.lastUsedDate;
    
    if (Object.keys(dbUpdates).length > 0) {
      db.update(schema.subscriptions).set(dbUpdates).where(eq(schema.subscriptions.id, id)).run();
    }
    return this.getSubscription(id);
  }

  async getTransactions(): Promise<Transaction[]> {
    const rows = db.select().from(schema.transactions).all();
    return rows.map(this.mapTransaction);
  }

  async createTransaction(txn: InsertTransaction): Promise<Transaction> {
    const id = uuidv4();
    const dbRow = {
      id,
      date: txn.date,
      merchant: txn.merchant,
      merchantLogo: txn.merchantLogo ?? null,
      amount: txn.amount,
      transactionType: txn.transactionType,
      status: txn.status,
      subscriptionId: txn.subscriptionId ?? null,
      category: txn.category,
    };
    db.insert(schema.transactions).values(dbRow).run();
    const inserted = db.select().from(schema.transactions).where(eq(schema.transactions.id, id)).get();
    return this.mapTransaction(inserted!);
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
    const dbRow = {
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
    db.insert(schema.alerts).values(dbRow).run();
    
    await this.createAuditLog({
      timestamp: new Date().toISOString(),
      action: "alert_created",
      entityType: "alert",
      entityId: id,
      details: `Created alert: ${alert.title} for ${alert.merchant}`,
      userApproved: false,
    });
    
    const inserted = db.select().from(schema.alerts).where(eq(schema.alerts.id, id)).get();
    return this.mapAlert(inserted!);
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const existing = await this.getAlert(id);
    if (!existing) return undefined;
    
    const dbUpdates: Record<string, any> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    
    if (Object.keys(dbUpdates).length > 0) {
      db.update(schema.alerts).set(dbUpdates).where(eq(schema.alerts.id, id)).run();
    }
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
    
    const dbUpdates: Record<string, any> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.lastRun !== undefined) dbUpdates.lastRun = updates.lastRun;
    if (updates.observations !== undefined) dbUpdates.observations = updates.observations;
    
    if (Object.keys(dbUpdates).length > 0) {
      db.update(schema.agentStatuses).set(dbUpdates).where(eq(schema.agentStatuses.name, name)).run();
    }
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
    const dbRow = {
      id,
      timestamp: log.timestamp,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.details,
      userApproved: log.userApproved,
    };
    db.insert(schema.auditLogs).values(dbRow).run();
    console.log(`[AUDIT] ${log.action}: ${log.details}`);
    const inserted = db.select().from(schema.auditLogs).where(eq(schema.auditLogs.id, id)).get();
    return inserted!;
  }

  private mapSubscription(row: typeof schema.subscriptions.$inferSelect): Subscription {
    return {
      id: row.id,
      merchant: row.merchant,
      merchantLogo: row.merchantLogo ?? undefined,
      currentAmount: row.currentAmount,
      previousAmount: row.previousAmount ?? undefined,
      billingCycle: row.billingCycle,
      status: row.status,
      lastUsedDate: row.lastUsedDate ?? undefined,
      nextBillingDate: row.nextBillingDate,
      category: row.category,
      autoPayEnabled: row.autoPayEnabled,
    };
  }

  private mapTransaction(row: typeof schema.transactions.$inferSelect): Transaction {
    return {
      id: row.id,
      date: row.date,
      merchant: row.merchant,
      merchantLogo: row.merchantLogo ?? undefined,
      amount: row.amount,
      transactionType: row.transactionType,
      status: row.status,
      subscriptionId: row.subscriptionId ?? undefined,
      category: row.category,
    };
  }

  private mapAlert(row: typeof schema.alerts.$inferSelect): Alert {
    return {
      id: row.id,
      type: row.type,
      severity: row.severity,
      subscriptionId: row.subscriptionId,
      merchant: row.merchant,
      title: row.title,
      description: row.description,
      financialImpact: {
        monthly: row.financialImpactMonthly,
        yearly: row.financialImpactYearly,
      },
      recommendation: row.recommendation,
      aiExplanation: row.aiExplanation,
      status: row.status,
      createdAt: row.createdAt,
      oldAmount: row.oldAmount ?? undefined,
      newAmount: row.newAmount ?? undefined,
    };
  }
}

export const storage = new SQLiteStorage();
