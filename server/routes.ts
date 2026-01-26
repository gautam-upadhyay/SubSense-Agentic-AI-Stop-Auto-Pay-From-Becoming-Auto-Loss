import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import { z } from "zod";
import type { InsertAlert } from "@shared/schema";

// Request validation schemas
const resolveAlertSchema = z.object({
  action: z.enum(["cancel", "keep"]),
});

const updateSubscriptionSchema = z.object({
  action: z.enum(["cancel", "pause", "resume"]),
});

// Agentic AI Logic
class AgenticAI {
  // Monitoring Agent - Observes new transactions
  async monitorTransaction(subscriptionId: string) {
    await storage.updateAgentStatus("Monitoring Agent", {
      status: "processing",
      lastRun: new Date().toISOString(),
    });

    const subscription = await storage.getSubscription(subscriptionId);
    if (!subscription) return;

    // Increment observations
    const agents = await storage.getAgentStatuses();
    const monitoringAgent = agents.find((a) => a.name === "Monitoring Agent");
    if (monitoringAgent) {
      await storage.updateAgentStatus("Monitoring Agent", {
        observations: monitoringAgent.observations + 1,
        status: "active",
      });
    }

    // Trigger anomaly detection
    await this.detectAnomalies(subscription);
  }

  // Anomaly Detection Agent - Detects price increases, unused subscriptions
  async detectAnomalies(subscription: any) {
    await storage.updateAgentStatus("Anomaly Detection Agent", {
      status: "processing",
      lastRun: new Date().toISOString(),
    });

    const anomalies: string[] = [];

    // Check for price increase > 15%
    if (subscription.previousAmount) {
      const increase = ((subscription.currentAmount - subscription.previousAmount) / subscription.previousAmount) * 100;
      if (increase > 15) {
        anomalies.push("price_increase");
      }
    }

    // Check for unused subscription (30+ days)
    if (subscription.lastUsedDate) {
      const daysSinceUse = Math.floor(
        (Date.now() - new Date(subscription.lastUsedDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceUse > 30) {
        anomalies.push("unused_subscription");
      }
    }

    await storage.updateAgentStatus("Anomaly Detection Agent", {
      status: "active",
    });

    if (anomalies.length > 0) {
      await this.analyzeUsage(subscription, anomalies);
    }
  }

  // Usage Analysis Agent
  async analyzeUsage(subscription: any, anomalies: string[]) {
    await storage.updateAgentStatus("Usage Analysis Agent", {
      status: "processing",
      lastRun: new Date().toISOString(),
    });

    const usageData = {
      daysSinceLastUse: subscription.lastUsedDate
        ? Math.floor((Date.now() - new Date(subscription.lastUsedDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      isFrequentlyUsed: subscription.lastUsedDate
        ? (Date.now() - new Date(subscription.lastUsedDate).getTime()) < 7 * 24 * 60 * 60 * 1000
        : false,
    };

    await storage.updateAgentStatus("Usage Analysis Agent", {
      status: "active",
    });

    await this.predictRisk(subscription, anomalies, usageData);
  }

  // Risk Prediction Agent
  async predictRisk(subscription: any, anomalies: string[], usageData: any) {
    await storage.updateAgentStatus("Risk Prediction Agent", {
      status: "processing",
      lastRun: new Date().toISOString(),
    });

    let severity: "high" | "medium" | "low" = "low";
    let monthlyImpact = 0;

    if (anomalies.includes("price_increase") && subscription.previousAmount) {
      monthlyImpact = subscription.currentAmount - subscription.previousAmount;
      severity = monthlyImpact > 200 ? "high" : "medium";
    }

    if (anomalies.includes("unused_subscription")) {
      monthlyImpact = subscription.currentAmount;
      if (usageData.daysSinceLastUse > 60) {
        severity = "high";
      } else if (usageData.daysSinceLastUse > 30) {
        severity = "medium";
      }
    }

    await storage.updateAgentStatus("Risk Prediction Agent", {
      status: "active",
    });

    await this.generateReasoningAndAlert(subscription, anomalies, usageData, severity, monthlyImpact);
  }

  // Reasoning Agent - Generates explanations
  async generateReasoningAndAlert(
    subscription: any,
    anomalies: string[],
    usageData: any,
    severity: "high" | "medium" | "low",
    monthlyImpact: number
  ) {
    await storage.updateAgentStatus("Reasoning Agent", {
      status: "processing",
      lastRun: new Date().toISOString(),
    });

    for (const anomaly of anomalies) {
      let title = "";
      let description = "";
      let recommendation = "";
      let aiExplanation = "";

      if (anomaly === "price_increase" && subscription.previousAmount) {
        const percentIncrease = Math.round(
          ((subscription.currentAmount - subscription.previousAmount) / subscription.previousAmount) * 100
        );
        title = `${subscription.merchant} Price Increase Detected`;
        description = `${subscription.merchant} has increased its price from ₹${subscription.previousAmount} to ₹${subscription.currentAmount}/month (+${percentIncrease}%)`;
        recommendation = "Consider downgrading or cancelling";
        aiExplanation = `Our AI detected a ${percentIncrease}% price increase on your ${subscription.merchant} subscription. This silent increase happened during your billing cycle. Over the next year, you'll pay ₹${monthlyImpact * 12} more than before.`;
        monthlyImpact = subscription.currentAmount - subscription.previousAmount;
      } else if (anomaly === "unused_subscription") {
        title = `Unused ${subscription.merchant} Subscription`;
        description = `${subscription.merchant} hasn't been used in ${usageData.daysSinceLastUse} days but still charging ₹${subscription.currentAmount}/month`;
        recommendation = `Cancel to save ₹${subscription.currentAmount * 12}/year`;
        aiExplanation = `You haven't used ${subscription.merchant} in ${usageData.daysSinceLastUse} days. The subscription costs ₹${subscription.currentAmount}/month (₹${subscription.currentAmount * 12}/year). If you're not actively using this service, consider cancelling to avoid unnecessary charges.`;
        monthlyImpact = subscription.currentAmount;
      }

      const existingAlerts = await storage.getAlerts();
      const alreadyExists = existingAlerts.some(
        (a) => a.subscriptionId === subscription.id && a.type === anomaly && a.status === "pending"
      );

      if (!alreadyExists && title) {
        const alert: InsertAlert = {
          type: anomaly as any,
          severity,
          subscriptionId: subscription.id,
          merchant: subscription.merchant,
          title,
          description,
          financialImpact: {
            monthly: monthlyImpact,
            yearly: monthlyImpact * 12,
          },
          recommendation,
          aiExplanation,
          status: "pending",
          createdAt: new Date().toISOString(),
          oldAmount: subscription.previousAmount,
          newAmount: subscription.currentAmount,
        };

        await storage.createAlert(alert);

        await storage.updateAgentStatus("Action Recommendation Agent", {
          status: "active",
          lastRun: new Date().toISOString(),
        });
      }
    }

    await storage.updateAgentStatus("Reasoning Agent", {
      status: "active",
    });
  }
}

const agenticAI = new AgenticAI();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Dashboard Summary
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const summary = await storage.getDashboardSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to get dashboard summary" });
    }
  });

  // Wallet
  app.get("/api/wallet", async (req, res) => {
    try {
      const wallet = await storage.getWallet();
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to get wallet" });
    }
  });

  // Subscriptions
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get subscriptions" });
    }
  });

  app.get("/api/subscriptions/:id", async (req, res) => {
    try {
      const subscription = await storage.getSubscription(req.params.id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to get subscription" });
    }
  });

  app.patch("/api/subscriptions/:id", async (req, res) => {
    try {
      const validation = updateSubscriptionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }

      const { action } = validation.data;
      let updates: any = {};

      switch (action) {
        case "cancel":
          updates = { status: "cancelled", autoPayEnabled: false };
          break;
        case "pause":
          updates = { status: "paused", autoPayEnabled: false };
          break;
        case "resume":
          updates = { status: "active", autoPayEnabled: true };
          break;
      }

      const subscription = await storage.updateSubscription(req.params.id, updates);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  // Alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get alerts" });
    }
  });

  app.post("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const validation = resolveAlertSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }

      const { action } = validation.data;
      const alert = await storage.getAlert(req.params.id);
      
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }

      // Update alert status
      await storage.updateAlert(req.params.id, { status: "resolved" });

      // If action is cancel, also cancel the subscription
      if (action === "cancel" && alert.subscriptionId) {
        await storage.updateSubscription(alert.subscriptionId, {
          status: "cancelled",
          autoPayEnabled: false,
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve alert" });
    }
  });

  app.post("/api/alerts/:id/dismiss", async (req, res) => {
    try {
      const alert = await storage.updateAlert(req.params.id, { status: "dismissed" });
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to dismiss alert" });
    }
  });

  // Agent Statuses
  app.get("/api/agents/status", async (req, res) => {
    try {
      const statuses = await storage.getAgentStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to get agent statuses" });
    }
  });

  // Simulate Auto-Pay Transaction (for demo)
  app.post("/api/simulate/autopay", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      const activeSubscriptions = subscriptions.filter((s) => s.status === "active" && s.autoPayEnabled);
      
      if (activeSubscriptions.length === 0) {
        return res.status(400).json({ error: "No active subscriptions" });
      }

      // Pick a random subscription
      const randomSub = activeSubscriptions[Math.floor(Math.random() * activeSubscriptions.length)];
      
      // 30% chance of price increase for demo
      let newAmount = randomSub.currentAmount;
      let priceIncreased = false;
      if (Math.random() < 0.3) {
        const increasePercent = 15 + Math.floor(Math.random() * 20); // 15-35% increase
        newAmount = Math.round(randomSub.currentAmount * (1 + increasePercent / 100));
        priceIncreased = true;
        
        await storage.updateSubscription(randomSub.id, {
          previousAmount: randomSub.currentAmount,
          currentAmount: newAmount,
        });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        date: new Date().toISOString(),
        merchant: randomSub.merchant,
        amount: newAmount,
        transactionType: "AUTO_PAY",
        status: "success",
        subscriptionId: randomSub.id,
        category: randomSub.category,
      });

      // Deduct from wallet
      await storage.updateWalletBalance(-newAmount);

      // Trigger agentic AI analysis
      const updatedSub = await storage.getSubscription(randomSub.id);
      if (updatedSub) {
        await agenticAI.monitorTransaction(updatedSub.id);
      }

      res.json({
        transaction,
        priceIncreased,
        message: priceIncreased
          ? `${randomSub.merchant} increased price - AI agents analyzing...`
          : `${randomSub.merchant} auto-pay processed`,
      });
    } catch (error) {
      console.error("Simulation error:", error);
      res.status(500).json({ error: "Failed to simulate auto-pay" });
    }
  });

  // Monthly spending trend data
  app.get("/api/analytics/monthly-trend", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      const monthlyData: Record<string, number> = {};
      
      transactions.forEach((txn) => {
        if (txn.status === "success") {
          const date = new Date(txn.date);
          const monthKey = date.toLocaleDateString("en-US", { month: "short" });
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + txn.amount;
        }
      });

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentMonth = new Date().getMonth();
      const last6Months = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthName = months[monthIndex];
        last6Months.push({
          month: monthName,
          amount: monthlyData[monthName] || Math.round(5000 + Math.random() * 3000),
        });
      }

      res.json(last6Months);
    } catch (error) {
      res.status(500).json({ error: "Failed to get monthly trend" });
    }
  });

  return httpServer;
}
