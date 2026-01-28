import { db, schema } from "./index.js";
import { v4 as uuidv4 } from "uuid";

export async function seedDatabase() {
  console.log("[DB] Checking if database needs seeding...");
  
  const existingSubs = db.select().from(schema.subscriptions).all();
  if (existingSubs.length > 0) {
    console.log("[DB] Database already seeded, skipping...");
    return;
  }
  
  console.log("[DB] Seeding database with initial data...");
  
  const subscriptionsData = [
    {
      id: uuidv4(),
      merchant: "Netflix",
      currentAmount: 649,
      previousAmount: 499,
      billingCycle: "monthly" as const,
      status: "active" as const,
      lastUsedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Entertainment",
      autoPayEnabled: true,
    },
    {
      id: uuidv4(),
      merchant: "Spotify",
      currentAmount: 119,
      billingCycle: "monthly" as const,
      status: "active" as const,
      lastUsedDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Entertainment",
      autoPayEnabled: true,
    },
    {
      id: uuidv4(),
      merchant: "Amazon Prime",
      currentAmount: 1499,
      billingCycle: "yearly" as const,
      status: "active" as const,
      lastUsedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Shopping",
      autoPayEnabled: true,
    },
    {
      id: uuidv4(),
      merchant: "YouTube Premium",
      currentAmount: 129,
      billingCycle: "monthly" as const,
      status: "active" as const,
      lastUsedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      nextBillingDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Entertainment",
      autoPayEnabled: true,
    },
    {
      id: uuidv4(),
      merchant: "Adobe Creative",
      currentAmount: 4999,
      previousAmount: 3999,
      billingCycle: "monthly" as const,
      status: "active" as const,
      lastUsedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Productivity",
      autoPayEnabled: true,
    },
    {
      id: uuidv4(),
      merchant: "Dropbox",
      currentAmount: 999,
      billingCycle: "monthly" as const,
      status: "active" as const,
      lastUsedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      nextBillingDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Storage",
      autoPayEnabled: true,
    },
    {
      id: uuidv4(),
      merchant: "LinkedIn",
      currentAmount: 2499,
      billingCycle: "monthly" as const,
      status: "paused" as const,
      lastUsedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Professional",
      autoPayEnabled: false,
    },
    {
      id: uuidv4(),
      merchant: "Notion",
      currentAmount: 800,
      billingCycle: "monthly" as const,
      status: "active" as const,
      lastUsedDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Productivity",
      autoPayEnabled: true,
    },
    {
      id: uuidv4(),
      merchant: "Fitness First",
      currentAmount: 2999,
      billingCycle: "monthly" as const,
      status: "active" as const,
      lastUsedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Fitness",
      autoPayEnabled: true,
    },
    {
      id: uuidv4(),
      merchant: "Google One",
      currentAmount: 130,
      billingCycle: "monthly" as const,
      status: "active" as const,
      lastUsedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Storage",
      autoPayEnabled: true,
    },
  ];
  
  for (const sub of subscriptionsData) {
    db.insert(schema.subscriptions).values(sub).run();
  }
  
  const transactionsData = [
    {
      id: uuidv4(),
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: "Netflix",
      amount: 649,
      transactionType: "AUTO_PAY" as const,
      status: "success" as const,
      category: "Entertainment",
    },
    {
      id: uuidv4(),
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: "Spotify",
      amount: 119,
      transactionType: "AUTO_PAY" as const,
      status: "success" as const,
      category: "Entertainment",
    },
    {
      id: uuidv4(),
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: "Amazon Prime",
      amount: 1499,
      transactionType: "AUTO_PAY" as const,
      status: "success" as const,
      category: "Shopping",
    },
    {
      id: uuidv4(),
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: "Adobe Creative",
      amount: 4999,
      transactionType: "AUTO_PAY" as const,
      status: "success" as const,
      category: "Productivity",
    },
    {
      id: uuidv4(),
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      merchant: "Fitness First",
      amount: 2999,
      transactionType: "AUTO_PAY" as const,
      status: "success" as const,
      category: "Fitness",
    },
  ];
  
  for (const txn of transactionsData) {
    db.insert(schema.transactions).values(txn).run();
  }
  
  db.insert(schema.wallet).values({
    id: "wallet-1",
    balance: 45250,
    currency: "INR",
    lastUpdated: new Date().toISOString(),
  }).run();
  
  const agents = [
    { name: "Monitoring Agent", status: "active" as const, lastRun: new Date().toISOString(), observations: 0 },
    { name: "Anomaly Detection Agent", status: "active" as const, lastRun: new Date().toISOString(), observations: 0 },
    { name: "Usage Analysis Agent", status: "active" as const, lastRun: new Date().toISOString(), observations: 0 },
    { name: "Risk Prediction Agent", status: "active" as const, lastRun: new Date().toISOString(), observations: 0 },
    { name: "Reasoning Agent", status: "active" as const, lastRun: new Date().toISOString(), observations: 0 },
    { name: "Action Recommendation Agent", status: "active" as const, lastRun: new Date().toISOString(), observations: 0 },
  ];
  
  for (const agent of agents) {
    db.insert(schema.agentStatuses).values(agent).run();
  }
  
  console.log("[DB] Database seeded successfully!");
  console.log(`[DB] Created ${subscriptionsData.length} subscriptions`);
  console.log(`[DB] Created ${transactionsData.length} transactions`);
}
