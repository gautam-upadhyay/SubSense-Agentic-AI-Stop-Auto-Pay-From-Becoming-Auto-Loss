import { db, schema } from "./index.js";
import { v4 as uuidv4 } from "uuid";
import { count } from "drizzle-orm";

export async function initializeDatabase() {
  console.log("[DB] Initializing SQLite database...");

  const existingSubs = await db.select({ value: count() }).from(schema.subscriptions);

  if (existingSubs[0].value === 0) {
    console.log("[DB] Seeding database with initial data...");

    const subscriptionsData = [
      { merchant: "Netflix", currentAmount: 649, previousAmount: 499, billingCycle: "monthly", status: "active", lastUsedDays: 2, nextBillingDays: 15, category: "Entertainment" },
      { merchant: "Spotify", currentAmount: 119, billingCycle: "monthly", status: "active", lastUsedDays: 0, nextBillingDays: 22, category: "Entertainment" },
      { merchant: "Amazon Prime", currentAmount: 1499, billingCycle: "yearly", status: "active", lastUsedDays: 5, nextBillingDays: 5, category: "Shopping" },
      { merchant: "YouTube Premium", currentAmount: 129, billingCycle: "monthly", status: "active", lastUsedDays: 45, nextBillingDays: 8, category: "Entertainment" },
      { merchant: "Adobe Creative", currentAmount: 4999, previousAmount: 3999, billingCycle: "monthly", status: "active", lastUsedDays: 90, nextBillingDays: 5, category: "Productivity" },
      { merchant: "Dropbox", currentAmount: 999, billingCycle: "monthly", status: "active", lastUsedDays: 60, nextBillingDays: 12, category: "Storage" },
      { merchant: "LinkedIn", currentAmount: 2499, billingCycle: "monthly", status: "paused", lastUsedDays: 120, nextBillingDays: 30, category: "Professional" },
      { merchant: "Notion", currentAmount: 800, billingCycle: "monthly", status: "active", lastUsedDays: 0, nextBillingDays: 18, category: "Productivity" },
      { merchant: "Fitness First", currentAmount: 2999, billingCycle: "monthly", status: "active", lastUsedDays: 35, nextBillingDays: 10, category: "Fitness" },
      { merchant: "Google One", currentAmount: 130, billingCycle: "monthly", status: "active", lastUsedDays: 10, nextBillingDays: 20, category: "Storage" },
    ];

    for (const sub of subscriptionsData) {
      await db.insert(schema.subscriptions).values({
        id: uuidv4(),
        merchant: sub.merchant,
        currentAmount: sub.currentAmount,
        previousAmount: sub.previousAmount ?? null,
        billingCycle: sub.billingCycle,
        status: sub.status,
        lastUsedDate: new Date(Date.now() - sub.lastUsedDays * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + sub.nextBillingDays * 24 * 60 * 60 * 1000).toISOString(),
        category: sub.category,
        autoPayEnabled: sub.status === "active" ? 1 : 0,
      });
    }

    const transactionsData = [
      { merchant: "Netflix", amount: 649, daysAgo: 1, category: "Entertainment" },
      { merchant: "Spotify", amount: 119, daysAgo: 3, category: "Entertainment" },
      { merchant: "Amazon Prime", amount: 1499, daysAgo: 5, category: "Shopping" },
      { merchant: "Adobe Creative", amount: 4999, daysAgo: 7, category: "Productivity" },
      { merchant: "Fitness First", amount: 2999, daysAgo: 10, category: "Fitness" },
    ];

    for (const txn of transactionsData) {
      await db.insert(schema.transactions).values({
        id: uuidv4(),
        date: new Date(Date.now() - txn.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        merchant: txn.merchant,
        amount: txn.amount,
        transactionType: "AUTO_PAY",
        status: "success",
        category: txn.category,
      });
    }

    await db.insert(schema.wallet).values({
      id: "wallet-1",
      balance: 45250,
      currency: "INR",
      lastUpdated: new Date().toISOString(),
    });

    const agents = [
      "Monitoring Agent",
      "Anomaly Detection Agent",
      "Usage Analysis Agent",
      "Risk Prediction Agent",
      "Reasoning Agent",
      "Action Recommendation Agent",
    ];

    for (const agent of agents) {
      await db.insert(schema.agentStatuses).values({
        name: agent,
        status: "active",
        lastRun: new Date().toISOString(),
        observations: 0,
      });
    }

    console.log("[DB] Database seeded successfully!");
    console.log(`[DB] Created ${subscriptionsData.length} subscriptions`);
    console.log(`[DB] Created ${transactionsData.length} transactions`);
  } else {
    console.log("[DB] Database already has data, skipping seed");
  }

  console.log("[DB] SQLite database ready\n");
}
