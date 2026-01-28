import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

export async function initializeDatabase() {
  console.log("[DB] Initializing SQLite database...");
  
  const sqlite = new Database("subsense.db");
  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      merchant TEXT NOT NULL,
      merchant_logo TEXT,
      current_amount REAL NOT NULL,
      previous_amount REAL,
      billing_cycle TEXT NOT NULL,
      status TEXT NOT NULL,
      last_used_date TEXT,
      next_billing_date TEXT NOT NULL,
      category TEXT NOT NULL,
      auto_pay_enabled INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      merchant TEXT NOT NULL,
      merchant_logo TEXT,
      amount REAL NOT NULL,
      transaction_type TEXT NOT NULL,
      status TEXT NOT NULL,
      subscription_id TEXT,
      category TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      subscription_id TEXT NOT NULL,
      merchant TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      financial_impact_monthly REAL NOT NULL,
      financial_impact_yearly REAL NOT NULL,
      recommendation TEXT NOT NULL,
      ai_explanation TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      old_amount REAL,
      new_amount REAL
    );
    
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT NOT NULL,
      user_approved INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS wallet (
      id TEXT PRIMARY KEY,
      balance REAL NOT NULL,
      currency TEXT NOT NULL,
      last_updated TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS agent_statuses (
      name TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      last_run TEXT NOT NULL,
      observations INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      platform_logo TEXT,
      amount REAL NOT NULL,
      billing_cycle TEXT NOT NULL,
      payment_method TEXT,
      status TEXT NOT NULL,
      transaction_id TEXT,
      subscription_id TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      qr_code TEXT
    );
  `);
  
  const existingSubs = sqlite.prepare("SELECT COUNT(*) as count FROM subscriptions").get() as { count: number };
  
  if (existingSubs.count === 0) {
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
    
    const insertSub = sqlite.prepare(`
      INSERT INTO subscriptions (id, merchant, current_amount, previous_amount, billing_cycle, status, last_used_date, next_billing_date, category, auto_pay_enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const sub of subscriptionsData) {
      insertSub.run(
        uuidv4(),
        sub.merchant,
        sub.currentAmount,
        sub.previousAmount ?? null,
        sub.billingCycle,
        sub.status,
        new Date(Date.now() - sub.lastUsedDays * 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() + sub.nextBillingDays * 24 * 60 * 60 * 1000).toISOString(),
        sub.category,
        sub.status === "active" ? 1 : 0
      );
    }
    
    const transactionsData = [
      { merchant: "Netflix", amount: 649, daysAgo: 1, category: "Entertainment" },
      { merchant: "Spotify", amount: 119, daysAgo: 3, category: "Entertainment" },
      { merchant: "Amazon Prime", amount: 1499, daysAgo: 5, category: "Shopping" },
      { merchant: "Adobe Creative", amount: 4999, daysAgo: 7, category: "Productivity" },
      { merchant: "Fitness First", amount: 2999, daysAgo: 10, category: "Fitness" },
    ];
    
    const insertTxn = sqlite.prepare(`
      INSERT INTO transactions (id, date, merchant, amount, transaction_type, status, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const txn of transactionsData) {
      insertTxn.run(
        uuidv4(),
        new Date(Date.now() - txn.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        txn.merchant,
        txn.amount,
        "AUTO_PAY",
        "success",
        txn.category
      );
    }
    
    sqlite.prepare(`
      INSERT INTO wallet (id, balance, currency, last_updated)
      VALUES (?, ?, ?, ?)
    `).run("wallet-1", 45250, "INR", new Date().toISOString());
    
    const agents = [
      "Monitoring Agent",
      "Anomaly Detection Agent",
      "Usage Analysis Agent",
      "Risk Prediction Agent",
      "Reasoning Agent",
      "Action Recommendation Agent",
    ];
    
    const insertAgent = sqlite.prepare(`
      INSERT INTO agent_statuses (name, status, last_run, observations)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const agent of agents) {
      insertAgent.run(agent, "active", new Date().toISOString(), 0);
    }
    
    console.log("[DB] Database seeded successfully!");
    console.log(`[DB] Created ${subscriptionsData.length} subscriptions`);
    console.log(`[DB] Created ${transactionsData.length} transactions`);
  } else {
    console.log("[DB] Database already has data, skipping seed");
  }
  
  sqlite.close();
  console.log("[DB] SQLite database ready\n");
}
