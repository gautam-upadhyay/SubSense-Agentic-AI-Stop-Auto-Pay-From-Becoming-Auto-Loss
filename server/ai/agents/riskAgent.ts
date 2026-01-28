import type { Anomaly } from "./anomalyAgent.js";

export interface RiskAssessment {
  anomaly: Anomaly;
  monthlyLoss: number;
  yearlyLoss: number;
  riskLevel: "high" | "medium" | "low";
  urgency: number;
}

export class RiskPredictionAgent {
  name = "Risk Prediction Agent";
  
  async assess(anomalies: Anomaly[]): Promise<RiskAssessment[]> {
    console.log(`\n[${this.name}] Assessing risk for ${anomalies.length} anomalies...`);
    
    const assessments: RiskAssessment[] = [];
    
    for (const anomaly of anomalies) {
      let monthlyLoss = 0;
      let yearlyLoss = 0;
      
      switch (anomaly.type) {
        case "price_increase": {
          const oldAmount = anomaly.data.oldAmount as number;
          const newAmount = anomaly.data.newAmount as number;
          const billingCycle = anomaly.data.billingCycle as string;
          const increase = newAmount - oldAmount;
          monthlyLoss = billingCycle === "monthly" ? increase : increase / 12;
          yearlyLoss = billingCycle === "monthly" ? increase * 12 : increase;
          break;
        }
        case "unused_subscription": {
          const amount = anomaly.data.amount as number;
          const billingCycle = anomaly.data.billingCycle as string;
          monthlyLoss = billingCycle === "monthly" ? amount : amount / 12;
          yearlyLoss = billingCycle === "monthly" ? amount * 12 : amount;
          break;
        }
        case "upcoming_renewal": {
          const amount = anomaly.data.amount as number;
          monthlyLoss = 0;
          yearlyLoss = amount;
          break;
        }
        case "duplicate_service": {
          const totalCost = anomaly.data.totalMonthlyCost as number;
          monthlyLoss = totalCost / 2;
          yearlyLoss = monthlyLoss * 12;
          break;
        }
      }
      
      let riskLevel: "high" | "medium" | "low" = "low";
      if (yearlyLoss >= 30000 || monthlyLoss >= 3000) {
        riskLevel = "high";
      } else if (yearlyLoss >= 10000 || monthlyLoss >= 1000) {
        riskLevel = "medium";
      }
      
      let urgency = 1;
      if (anomaly.type === "upcoming_renewal") {
        const days = anomaly.data.daysUntilRenewal as number;
        urgency = days <= 1 ? 5 : days <= 3 ? 4 : 3;
      } else if (riskLevel === "high") {
        urgency = 4;
      } else if (riskLevel === "medium") {
        urgency = 2;
      }
      
      console.log(`[${this.name}] ${anomaly.merchant}: Risk=${riskLevel}, Monthly=₹${monthlyLoss}, Yearly=₹${yearlyLoss}`);
      
      assessments.push({
        anomaly,
        monthlyLoss: Math.round(monthlyLoss),
        yearlyLoss: Math.round(yearlyLoss),
        riskLevel,
        urgency,
      });
    }
    
    assessments.sort((a, b) => {
      if (a.urgency !== b.urgency) return b.urgency - a.urgency;
      return b.yearlyLoss - a.yearlyLoss;
    });
    
    console.log(`[${this.name}] Risk assessment complete. Total potential yearly loss: ₹${assessments.reduce((acc, a) => acc + a.yearlyLoss, 0)}`);
    return assessments;
  }
}

export const riskAgent = new RiskPredictionAgent();
