import type { Subscription, Transaction } from "@shared/schema";

export interface MonitoringResult {
  subscriptions: Subscription[];
  transactions: Transaction[];
  patterns: {
    priceChanges: Array<{
      subscription: Subscription;
      oldAmount: number;
      newAmount: number;
      percentageChange: number;
    }>;
    unusedSubscriptions: Array<{
      subscription: Subscription;
      daysSinceLastUse: number;
    }>;
    upcomingRenewals: Array<{
      subscription: Subscription;
      daysUntilRenewal: number;
    }>;
  };
}

export class MonitoringAgent {
  name = "Monitoring Agent";
  
  async observe(subscriptions: Subscription[], transactions: Transaction[]): Promise<MonitoringResult> {
    console.log(`\n[${this.name}] Starting observation...`);
    console.log(`[${this.name}] Analyzing ${subscriptions.length} subscriptions and ${transactions.length} transactions`);
    
    const now = new Date();
    
    const priceChanges = subscriptions
      .filter(sub => sub.previousAmount && sub.previousAmount !== sub.currentAmount)
      .map(sub => ({
        subscription: sub,
        oldAmount: sub.previousAmount!,
        newAmount: sub.currentAmount,
        percentageChange: Math.round(((sub.currentAmount - sub.previousAmount!) / sub.previousAmount!) * 100),
      }));
    
    const unusedSubscriptions = subscriptions
      .filter(sub => sub.status === "active" && sub.lastUsedDate)
      .map(sub => {
        const lastUsed = new Date(sub.lastUsedDate!);
        const daysSinceLastUse = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
        return { subscription: sub, daysSinceLastUse };
      })
      .filter(item => item.daysSinceLastUse >= 30);
    
    const upcomingRenewals = subscriptions
      .filter(sub => sub.status === "active")
      .map(sub => {
        const nextBilling = new Date(sub.nextBillingDate);
        const daysUntilRenewal = Math.floor((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { subscription: sub, daysUntilRenewal };
      })
      .filter(item => item.daysUntilRenewal <= 7 && item.daysUntilRenewal >= 0);
    
    console.log(`[${this.name}] Found ${priceChanges.length} price changes`);
    console.log(`[${this.name}] Found ${unusedSubscriptions.length} unused subscriptions`);
    console.log(`[${this.name}] Found ${upcomingRenewals.length} upcoming renewals`);
    
    return {
      subscriptions,
      transactions,
      patterns: {
        priceChanges,
        unusedSubscriptions,
        upcomingRenewals,
      },
    };
  }
}

export const monitoringAgent = new MonitoringAgent();
