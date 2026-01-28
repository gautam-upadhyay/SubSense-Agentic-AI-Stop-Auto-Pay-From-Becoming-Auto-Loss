import type { MonitoringResult } from "./monitoringAgent.js";

export interface Anomaly {
  type: "price_increase" | "unused_subscription" | "trial_to_paid" | "duplicate_service" | "upcoming_renewal";
  subscriptionId: string;
  merchant: string;
  severity: "high" | "medium" | "low";
  data: Record<string, unknown>;
}

export class AnomalyDetectionAgent {
  name = "Anomaly Detection Agent";
  private priceIncreaseThreshold = 15;
  private unusedDaysThreshold = 30;
  
  async detect(monitoringResult: MonitoringResult): Promise<Anomaly[]> {
    console.log(`\n[${this.name}] Starting anomaly detection...`);
    
    const anomalies: Anomaly[] = [];
    
    for (const priceChange of monitoringResult.patterns.priceChanges) {
      if (priceChange.percentageChange >= this.priceIncreaseThreshold) {
        console.log(`[${this.name}] ANOMALY: ${priceChange.subscription.merchant} price increased by ${priceChange.percentageChange}%`);
        anomalies.push({
          type: "price_increase",
          subscriptionId: priceChange.subscription.id,
          merchant: priceChange.subscription.merchant,
          severity: priceChange.percentageChange >= 25 ? "high" : "medium",
          data: {
            oldAmount: priceChange.oldAmount,
            newAmount: priceChange.newAmount,
            percentageChange: priceChange.percentageChange,
            billingCycle: priceChange.subscription.billingCycle,
          },
        });
      }
    }
    
    for (const unused of monitoringResult.patterns.unusedSubscriptions) {
      let severity: "high" | "medium" | "low" = "low";
      if (unused.daysSinceLastUse >= 90) {
        severity = "high";
      } else if (unused.daysSinceLastUse >= 60) {
        severity = "medium";
      }
      
      console.log(`[${this.name}] ANOMALY: ${unused.subscription.merchant} unused for ${unused.daysSinceLastUse} days`);
      anomalies.push({
        type: "unused_subscription",
        subscriptionId: unused.subscription.id,
        merchant: unused.subscription.merchant,
        severity,
        data: {
          daysSinceLastUse: unused.daysSinceLastUse,
          amount: unused.subscription.currentAmount,
          billingCycle: unused.subscription.billingCycle,
        },
      });
    }
    
    for (const renewal of monitoringResult.patterns.upcomingRenewals) {
      if (renewal.subscription.billingCycle === "yearly") {
        console.log(`[${this.name}] ANOMALY: ${renewal.subscription.merchant} annual renewal in ${renewal.daysUntilRenewal} days`);
        anomalies.push({
          type: "upcoming_renewal",
          subscriptionId: renewal.subscription.id,
          merchant: renewal.subscription.merchant,
          severity: renewal.daysUntilRenewal <= 3 ? "high" : "medium",
          data: {
            daysUntilRenewal: renewal.daysUntilRenewal,
            amount: renewal.subscription.currentAmount,
            billingCycle: "yearly",
          },
        });
      }
    }
    
    const categories = new Map<string, typeof monitoringResult.subscriptions>();
    for (const sub of monitoringResult.subscriptions) {
      if (sub.status === "active") {
        const existing = categories.get(sub.category) || [];
        existing.push(sub);
        categories.set(sub.category, existing);
      }
    }
    
    for (const [category, subs] of categories) {
      if (subs.length >= 2) {
        const totalCost = subs.reduce((acc, s) => acc + s.currentAmount, 0);
        console.log(`[${this.name}] ANOMALY: Duplicate services in ${category} category (${subs.length} subscriptions)`);
        anomalies.push({
          type: "duplicate_service",
          subscriptionId: subs[0].id,
          merchant: subs.map(s => s.merchant).join(", "),
          severity: "low",
          data: {
            category,
            subscriptions: subs.map(s => ({ id: s.id, merchant: s.merchant, amount: s.currentAmount })),
            totalMonthlyCost: totalCost,
          },
        });
      }
    }
    
    console.log(`[${this.name}] Total anomalies detected: ${anomalies.length}`);
    return anomalies;
  }
}

export const anomalyAgent = new AnomalyDetectionAgent();
