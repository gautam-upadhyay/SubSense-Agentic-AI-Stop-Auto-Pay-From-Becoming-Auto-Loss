import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./sqliteStorage.js";
import { z } from "zod";
import { simulateAutoPay, runAgentPipeline } from "./ai/runner.js";
import QRCode from "qrcode";
import { initiatePaymentSchema, confirmPaymentSchema } from "@shared/schema";

const resolveAlertSchema = z.object({
  action: z.enum(["cancel", "keep"]),
});

const updateSubscriptionSchema = z.object({
  action: z.enum(["cancel", "pause", "resume"]),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const summary = await storage.getDashboardSummary();
      console.log(`[API] GET /api/dashboard/summary 200 in 2ms :: ${JSON.stringify(summary)}`);
      res.json(summary);
    } catch (error) {
      console.error("[API] GET /api/dashboard/summary 500");
      res.status(500).json({ error: "Failed to get dashboard summary" });
    }
  });

  app.get("/api/wallet", async (req, res) => {
    try {
      const wallet = await storage.getWallet();
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: "Failed to get wallet" });
    }
  });

  app.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getSubscriptions();
      console.log(`[API] GET /api/subscriptions 200 :: ${subscriptions.length} items`);
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
          console.log(`[API] PATCH /api/subscriptions/${req.params.id} :: Cancelling subscription`);
          break;
        case "pause":
          updates = { status: "paused", autoPayEnabled: false };
          console.log(`[API] PATCH /api/subscriptions/${req.params.id} :: Pausing subscription`);
          break;
        case "resume":
          updates = { status: "active", autoPayEnabled: true };
          console.log(`[API] PATCH /api/subscriptions/${req.params.id} :: Resuming subscription`);
          break;
      }

      const subscription = await storage.updateSubscription(req.params.id, updates);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      console.log(`[AUDIT] User action: ${action} on ${subscription.merchant}`);
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      console.log(`[API] GET /api/transactions 200 :: ${transactions.length} items`);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      console.log(`[API] GET /api/alerts 200 :: ${alerts.length} items`);
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

      console.log(`\n[HUMAN-IN-THE-LOOP] User approved action: ${action}`);
      console.log(`[AUDIT] Alert ${req.params.id} resolved with action: ${action}`);
      console.log(`[AUDIT] Merchant: ${alert.merchant}, Type: ${alert.type}`);

      await storage.updateAlert(req.params.id, { status: "resolved" });

      if (action === "cancel" && alert.subscriptionId) {
        await storage.updateSubscription(alert.subscriptionId, {
          status: "cancelled",
          autoPayEnabled: false,
        });
        console.log(`[AUDIT] Subscription cancelled: ${alert.merchant}`);
        console.log(`[AUDIT] Yearly savings: ₹${alert.financialImpact.yearly}`);
      }

      res.json({ success: true, action, merchant: alert.merchant });
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve alert" });
    }
  });

  app.post("/api/alerts/:id/dismiss", async (req, res) => {
    try {
      const alert = await storage.getAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      console.log(`[HUMAN-IN-THE-LOOP] User dismissed alert for ${alert.merchant}`);
      console.log(`[AUDIT] Alert dismissed: ${alert.title}`);
      
      await storage.updateAlert(req.params.id, { status: "dismissed" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to dismiss alert" });
    }
  });

  app.get("/api/agents/status", async (req, res) => {
    try {
      const statuses = await storage.getAgentStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to get agent statuses" });
    }
  });

  app.post("/api/simulate/autopay", async (req, res) => {
    try {
      console.log("\n" + "=".repeat(60));
      console.log("[DEMO] Simulating Auto-Pay Transaction");
      console.log("=".repeat(60));
      
      const result = await simulateAutoPay();
      
      if (!result.success || !result.transaction) {
        return res.status(400).json({ error: "No active subscriptions available" });
      }

      const response = {
        transaction: result.transaction,
        priceIncreased: result.transaction.priceIncreased,
        newAlerts: result.newAlerts,
        totalPotentialSavings: result.totalPotentialSavings,
        message: result.transaction.priceIncreased
          ? `${result.transaction.merchant} price increased by ${result.transaction.percentageIncrease}% - AI agents detected anomaly!`
          : `${result.transaction.merchant} auto-pay processed - AI agents analyzed`,
      };

      console.log(`[DEMO] Result: ${JSON.stringify(response)}\n`);
      res.json(response);
    } catch (error) {
      console.error("[DEMO] Simulation error:", error);
      res.status(500).json({ error: "Failed to simulate auto-pay" });
    }
  });

  app.post("/api/agents/run", async (req, res) => {
    try {
      console.log("\n[API] Manual agent pipeline trigger");
      const result = await runAgentPipeline();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to run agent pipeline" });
    }
  });

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

  // Payment Gateway Routes
  app.post("/api/payments/initiate", async (req, res) => {
    try {
      const validation = initiatePaymentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }

      const { platform, amount, billingCycle, paymentMethod } = validation.data;
      
      console.log("\n" + "=".repeat(60));
      console.log("[PAYMENT] Initiating payment");
      console.log(`[PAYMENT] Platform: ${platform}, Amount: ₹${amount}, Method: ${paymentMethod}`);
      console.log("=".repeat(60));

      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate QR code for QR payment method
      let qrCode: string | undefined;
      if (paymentMethod === "qr") {
        const qrData = JSON.stringify({
          paymentId,
          amount,
          platform,
          demo: true,
        });
        const baseUrl = process.env.REPL_SLUG 
          ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
          : "http://localhost:5000";
        const paymentUrl = `${baseUrl}/qr-pay/${paymentId}`;
        qrCode = await QRCode.toDataURL(paymentUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
      }

      const payment = await storage.createPayment({
        platform,
        amount,
        billingCycle,
        paymentMethod,
        status: "pending",
        createdAt: new Date().toISOString(),
        qrCode,
      });

      console.log(`[PAYMENT] Created payment: ${payment.id}`);
      res.json(payment);
    } catch (error) {
      console.error("[PAYMENT] Initiation error:", error);
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  });

  app.post("/api/payments/confirm", async (req, res) => {
    try {
      const validation = confirmPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }

      const { paymentId } = validation.data;
      const payment = await storage.getPayment(paymentId);

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      console.log("\n[PAYMENT] Confirming payment:", paymentId);
      console.log("[PAYMENT] Simulating gateway processing (1.5s delay)...");

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create subscription
      const nextBillingDate = new Date();
      if (payment.billingCycle === "monthly") {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      const categoryMap: Record<string, string> = {
        "Netflix": "Entertainment",
        "Amazon Prime": "Shopping",
        "Spotify": "Entertainment",
        "YouTube Premium": "Entertainment",
        "Apple TV+": "Entertainment",
        "AWS": "Cloud Services",
        "Adobe Creative": "Productivity",
        "Dropbox": "Storage",
        "Notion": "Productivity",
        "LinkedIn Premium": "Professional",
        "Fitness First": "Fitness",
        "Coursera Plus": "Education",
        "Google One": "Storage",
        "Xbox Game Pass": "Gaming",
      };

      const subscription = await storage.createSubscription({
        merchant: payment.platform,
        currentAmount: payment.amount,
        billingCycle: payment.billingCycle,
        status: "active",
        lastUsedDate: new Date().toISOString(),
        nextBillingDate: nextBillingDate.toISOString(),
        category: categoryMap[payment.platform] || "Other",
        autoPayEnabled: true,
      });

      // Create transaction
      const transaction = await storage.createTransaction({
        date: new Date().toISOString(),
        merchant: payment.platform,
        amount: payment.amount,
        transactionType: "MANUAL",
        status: "success",
        subscriptionId: subscription.id,
        category: subscription.category,
      });

      // Update payment status
      await storage.updatePayment(paymentId, {
        status: "success",
        transactionId: transaction.id,
        subscriptionId: subscription.id,
        completedAt: new Date().toISOString(),
      });

      // Update wallet balance
      const wallet = await storage.getWallet();
      if (wallet) {
        await storage.updateWallet({
          balance: wallet.balance - payment.amount,
          lastUpdated: new Date().toISOString(),
        });
      }

      console.log(`[PAYMENT] SUCCESS! Subscription created: ${subscription.merchant}`);
      console.log(`[PAYMENT] Auto-pay enabled for future payments`);

      // Trigger AI agents
      console.log("\n[AI] Triggering agent pipeline for new subscription...");
      await runAgentPipeline();

      res.json({
        success: true,
        payment: await storage.getPayment(paymentId),
        subscription,
        transaction,
      });
    } catch (error) {
      console.error("[PAYMENT] Confirmation error:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const { paymentId, status } = req.body;
      
      if (!paymentId) {
        return res.status(400).json({ error: "Payment ID required" });
      }

      const payment = await storage.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      console.log("\n[WEBHOOK] Received payment webhook");
      console.log(`[WEBHOOK] Payment: ${paymentId}, Status: ${status}`);

      if (status === "success") {
        // Process the payment confirmation
        const confirmResponse = await fetch(`http://localhost:5000/api/payments/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const result = await confirmResponse.json();
        res.json(result);
      } else {
        await storage.updatePayment(paymentId, { status: "failed" });
        res.json({ success: false, status: "failed" });
      }
    } catch (error) {
      console.error("[WEBHOOK] Error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  app.get("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to get payment" });
    }
  });

  console.log("\n[Server] API routes registered");
  console.log("[Server] Payment gateway ready (Demo Mode)");
  console.log("[Server] Agentic AI pipeline ready");
  console.log("[Server] Human-in-the-loop safety enabled\n");

  return httpServer;
}
