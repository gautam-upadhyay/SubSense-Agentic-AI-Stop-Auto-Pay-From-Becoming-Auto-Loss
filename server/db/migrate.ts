import Database from "better-sqlite3";

const sqlite = new Database("subsense.db");

console.log("[DB] Running migrations...");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    merchant TEXT NOT NULL,
    merchant_logo TEXT,
    current_amount REAL NOT NULL,
    previous_amount REAL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled')),
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
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('AUTO_PAY', 'MANUAL')),
    status TEXT NOT NULL CHECK (status IN ('success', 'blocked', 'pending')),
    subscription_id TEXT,
    category TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('price_increase', 'unused_subscription', 'trial_to_paid', 'plan_drift', 'upcoming_renewal', 'duplicate_service', 'small_charges')),
    severity TEXT NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
    subscription_id TEXT NOT NULL,
    merchant TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    financial_impact_monthly REAL NOT NULL,
    financial_impact_yearly REAL NOT NULL,
    recommendation TEXT NOT NULL,
    ai_explanation TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'resolved', 'dismissed')),
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
    status TEXT NOT NULL CHECK (status IN ('active', 'idle', 'processing')),
    last_run TEXT NOT NULL,
    observations INTEGER NOT NULL
  );
`);

console.log("[DB] Migrations complete!");

sqlite.close();
