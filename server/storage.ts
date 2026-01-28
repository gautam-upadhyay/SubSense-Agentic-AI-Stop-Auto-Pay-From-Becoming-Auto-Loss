import { randomUUID } from "crypto";
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
  // Wallet
  getWallet(): Promise<Wallet>;
  updateWallet(updates: Partial<Wallet>): Promise<Wallet>;

  // Subscriptions
  getSubscriptions(): Promise<Subscription[]>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  createSubscription(sub: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  createTransaction(txn: InsertTransaction): Promise<Transaction>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined>;

  // Agents
  getAgentStatuses(): Promise<AgentStatus[]>;
  updateAgentStatus(name: string, updates: Partial<AgentStatus>): Promise<AgentStatus | undefined>;

  // Dashboard
  getDashboardSummary(): Promise<DashboardSummary>;

  // Audit
  createAuditLog(log: Omit<AuditLog, "id">): Promise<AuditLog>;
}

export class MemStorage implements IStorage {
  private wallet: Wallet;
  private subscriptions: Map<string, Subscription>;
  private transactions: Map<string, Transaction>;
  private alerts: Map<string, Alert>;
  private agentStatuses: Map<string, AgentStatus>;

  constructor() {
    this.wallet = {
      id: randomUUID(),
      balance: 125000,
      currency: "INR",
      lastUpdated: new Date().toISOString(),
    };

    this.subscriptions = new Map();
    this.transactions = new Map();
    this.alerts = new Map();
    this.agentStatuses = new Map();

    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize realistic subscriptions with varied use cases
    const subscriptionsData: InsertSubscription[] = [
      {
        merchant: "Netflix",
        currentAmount: 649,
        previousAmount: 499,
        billingCycle: "monthly",
        status: "active",
        lastUsedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Entertainment",
        autoPayEnabled: true,
      },
      {
        merchant: "Spotify",
        currentAmount: 119,
        billingCycle: "monthly",
        status: "active",
        lastUsedDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Entertainment",
        autoPayEnabled: true,
      },
      {
        merchant: "Amazon Prime",
        currentAmount: 1499,
        billingCycle: "yearly",
        status: "active",
        lastUsedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Shopping",
        autoPayEnabled: true,
      },
      {
        merchant: "YouTube Premium",
        currentAmount: 129,
        billingCycle: "monthly",
        status: "active",
        lastUsedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Entertainment",
        autoPayEnabled: true,
      },
      {
        merchant: "Adobe Creative",
        currentAmount: 4999,
        previousAmount: 3999,
        billingCycle: "monthly",
        status: "active",
        lastUsedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Productivity",
        autoPayEnabled: true,
      },
      {
        merchant: "Dropbox",
        currentAmount: 999,
        billingCycle: "monthly",
        status: "active",
        lastUsedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Storage",
        autoPayEnabled: true,
      },
      {
        merchant: "LinkedIn",
        currentAmount: 2499,
        billingCycle: "monthly",
        status: "paused",
        lastUsedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Professional",
        autoPayEnabled: false,
      },
      {
        merchant: "Notion",
        currentAmount: 800,
        billingCycle: "monthly",
        status: "active",
        lastUsedDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Productivity",
        autoPayEnabled: true,
      },
      {
        merchant: "Fitness First",
        currentAmount: 2999,
        billingCycle: "monthly",
        status: "active",
        lastUsedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Fitness",
        autoPayEnabled: true,
      },
      {
        merchant: "Google One",
        currentAmount: 130,
        billingCycle: "monthly",
        status: "active",
        lastUsedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Storage",
        autoPayEnabled: true,
      },
    ];

    subscriptionsData.forEach((sub) => {
      const id = randomUUID();
      this.subscriptions.set(id, { id, ...sub });
    });

    // Initialize past transactions
    const subArray = Array.from(this.subscriptions.values());
    const now = new Date();
    
    for (let monthsAgo = 0; monthsAgo < 3; monthsAgo++) {
      subArray.forEach((sub) => {
        if (sub.status !== "cancelled") {
          const txnDate = new Date(now);
          txnDate.setMonth(txnDate.getMonth() - monthsAgo);
          txnDate.setDate(Math.floor(Math.random() * 28) + 1);
          
          const txn: Transaction = {
            id: randomUUID(),
            date: txnDate.toISOString(),
            merchant: sub.merchant,
            amount: sub.currentAmount,
            transactionType: "AUTO_PAY",
            status: "success",
            subscriptionId: sub.id,
            category: sub.category,
          };
          this.transactions.set(txn.id, txn);
        }
      });
    }

    // Initialize alerts based on subscription analysis
    const netflixSub = subArray.find((s) => s.merchant === "Netflix");
    const adobeSub = subArray.find((s) => s.merchant === "Adobe Creative");
    const youtubeSub = subArray.find((s) => s.merchant === "YouTube Premium");
    const dropboxSub = subArray.find((s) => s.merchant === "Dropbox");

    if (netflixSub && netflixSub.previousAmount) {
      const alert: Alert = {
        id: randomUUID(),
        type: "price_increase",
        severity: "high",
        subscriptionId: netflixSub.id,
        merchant: netflixSub.merchant,
        title: "Netflix Price Increase Detected",
        description: `Netflix has increased its price from ₹${netflixSub.previousAmount} to ₹${netflixSub.currentAmount}/month`,
        financialImpact: {
          monthly: netflixSub.currentAmount - netflixSub.previousAmount,
          yearly: (netflixSub.currentAmount - netflixSub.previousAmount) * 12,
        },
        recommendation: "Consider downgrading to a lower plan or cancelling",
        aiExplanation: `Our AI detected a 30% price increase on your Netflix subscription. This silent increase happened without notification. Over the next year, you'll pay ₹${(netflixSub.currentAmount - netflixSub.previousAmount) * 12} more than before. Given the entertainment category has alternatives like Amazon Prime which you already have, this might be worth reconsidering.`,
        status: "pending",
        createdAt: new Date().toISOString(),
        oldAmount: netflixSub.previousAmount,
        newAmount: netflixSub.currentAmount,
      };
      this.alerts.set(alert.id, alert);
    }

    if (adobeSub && adobeSub.previousAmount) {
      const alert: Alert = {
        id: randomUUID(),
        type: "unused_subscription",
        severity: "high",
        subscriptionId: adobeSub.id,
        merchant: adobeSub.merchant,
        title: "Unused Adobe Creative Subscription",
        description: "Adobe Creative hasn't been used in 90 days but still charging ₹4,999/month",
        financialImpact: {
          monthly: adobeSub.currentAmount,
          yearly: adobeSub.currentAmount * 12,
        },
        recommendation: "Cancel subscription to save ₹59,988/year",
        aiExplanation: "You haven't opened any Adobe Creative applications in the last 90 days. The subscription costs ₹4,999/month (₹59,988/year). If you're not actively using the creative suite, consider cancelling or switching to individual app subscriptions which are significantly cheaper.",
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      };
      this.alerts.set(alert.id, alert);
    }

    if (youtubeSub) {
      const alert: Alert = {
        id: randomUUID(),
        type: "unused_subscription",
        severity: "medium",
        subscriptionId: youtubeSub.id,
        merchant: youtubeSub.merchant,
        title: "YouTube Premium Unused for 45 Days",
        description: "Your YouTube Premium subscription hasn't been used recently",
        financialImpact: {
          monthly: youtubeSub.currentAmount,
          yearly: youtubeSub.currentAmount * 12,
        },
        recommendation: "Consider if premium features are worth the cost",
        aiExplanation: "You haven't watched YouTube with your Premium account in 45 days. While the cost is relatively low at ₹129/month, that's still ₹1,548/year. If you primarily use YouTube on your TV which might not be logged in, consider checking your usage patterns.",
        status: "pending",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      };
      this.alerts.set(alert.id, alert);
    }

    if (dropboxSub) {
      const alert: Alert = {
        id: randomUUID(),
        type: "unused_subscription",
        severity: "low",
        subscriptionId: dropboxSub.id,
        merchant: dropboxSub.merchant,
        title: "Dropbox Storage Underutilized",
        description: "Dropbox hasn't been accessed in 60 days",
        financialImpact: {
          monthly: dropboxSub.currentAmount,
          yearly: dropboxSub.currentAmount * 12,
        },
        recommendation: "Review if you need this storage or if Google Drive is sufficient",
        aiExplanation: "Your Dropbox storage subscription at ₹999/month hasn't been accessed in 60 days. You also have Google One storage. Consider consolidating your cloud storage to a single provider to reduce costs.",
        status: "pending",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      };
      this.alerts.set(alert.id, alert);
    }

    // Initialize agent statuses
    const agents = [
      { name: "Monitoring Agent", status: "active" as const, observations: 156 },
      { name: "Anomaly Detection Agent", status: "active" as const, observations: 42 },
      { name: "Usage Analysis Agent", status: "active" as const, observations: 89 },
      { name: "Risk Prediction Agent", status: "active" as const, observations: 34 },
      { name: "Reasoning Agent", status: "idle" as const, observations: 18 },
      { name: "Action Recommendation Agent", status: "idle" as const, observations: 12 },
    ];

    agents.forEach((agent) => {
      this.agentStatuses.set(agent.name, {
        ...agent,
        lastRun: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      });
    });
  }

  // Wallet methods
  async getWallet(): Promise<Wallet> {
    return this.wallet;
  }

  async updateWallet(updates: Partial<Wallet>): Promise<Wallet> {
    if (updates.balance !== undefined) {
      this.wallet.balance = updates.balance;
    }
    this.wallet.lastUpdated = new Date().toISOString();
    return this.wallet;
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).sort((a, b) => 
      b.currentAmount - a.currentAmount
    );
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async createSubscription(sub: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = { id, ...sub };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const sub = this.subscriptions.get(id);
    if (!sub) return undefined;
    const updated = { ...sub, ...updates };
    this.subscriptions.set(id, updated);
    return updated;
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createTransaction(txn: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { id, ...txn };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Alert methods
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const newAlert: Alert = { id, ...alert };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    const updated = { ...alert, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  // Agent methods
  async getAgentStatuses(): Promise<AgentStatus[]> {
    return Array.from(this.agentStatuses.values());
  }

  async updateAgentStatus(name: string, updates: Partial<AgentStatus>): Promise<AgentStatus | undefined> {
    const agent = this.agentStatuses.get(name);
    if (agent) {
      const updated = { ...agent, ...updates };
      this.agentStatuses.set(name, updated);
      return updated;
    }
    return undefined;
  }

  // Audit methods
  async createAuditLog(log: Omit<AuditLog, "id">): Promise<AuditLog> {
    const id = randomUUID();
    const auditLog: AuditLog = { id, ...log };
    console.log(`[AUDIT] ${log.action}: ${log.details}`);
    return auditLog;
  }

  // Dashboard summary
  async getDashboardSummary(): Promise<DashboardSummary> {
    const subscriptions = await this.getSubscriptions();
    const alerts = await this.getAlerts();
    const wallet = await this.getWallet();

    const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
    const pendingAlerts = alerts.filter((a) => a.status === "pending");

    const monthlySpend = activeSubscriptions.reduce((acc, sub) => {
      if (sub.billingCycle === "monthly") {
        return acc + sub.currentAmount;
      }
      return acc + sub.currentAmount / 12;
    }, 0);

    const potentialSavings = pendingAlerts.reduce(
      (acc, alert) => acc + alert.financialImpact.yearly,
      0
    );

    const highRiskAlerts = pendingAlerts.filter((a) => a.severity === "high").length;
    let riskScore: "low" | "medium" | "high" = "low";
    if (highRiskAlerts > 1) {
      riskScore = "high";
    } else if (pendingAlerts.length > 2) {
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
}

export const storage = new MemStorage();
