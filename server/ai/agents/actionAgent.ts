import type { ReasonedAlert } from "./reasoningAgent.js";
import type { InsertAlert } from "@shared/schema";

export interface ActionRecommendation {
  alert: InsertAlert;
  availableActions: string[];
  suggestedAction: string;
  requiresUserApproval: boolean;
}

export class ActionRecommendationAgent {
  name = "Action Recommendation Agent";
  
  async recommend(reasonedAlerts: ReasonedAlert[]): Promise<ActionRecommendation[]> {
    console.log(`\n[${this.name}] Generating action recommendations...`);
    console.log(`[${this.name}] SAFETY: All actions require user approval - no autonomous execution`);
    
    const recommendations: ActionRecommendation[] = [];
    
    for (const reasonedAlert of reasonedAlerts) {
      const { assessment, title, description, aiExplanation, recommendation } = reasonedAlert;
      const { anomaly, monthlyLoss, yearlyLoss, riskLevel } = assessment;
      
      let alertType: "price_increase" | "unused_subscription" | "trial_to_paid" | "plan_drift";
      let availableActions: string[];
      let suggestedAction: string;
      
      switch (anomaly.type) {
        case "price_increase":
          alertType = "price_increase";
          availableActions = ["Keep subscription", "Cancel auto-pay", "Dismiss"];
          suggestedAction = riskLevel === "high" ? "Cancel auto-pay" : "Review and decide";
          break;
        case "unused_subscription":
          alertType = "unused_subscription";
          availableActions = ["Continue", "Pause subscription", "Cancel subscription", "Dismiss"];
          suggestedAction = riskLevel === "high" ? "Cancel subscription" : "Pause subscription";
          break;
        case "upcoming_renewal":
          alertType = "unused_subscription";
          availableActions = ["Allow renewal", "Cancel before renewal", "Set reminder", "Dismiss"];
          suggestedAction = "Review usage before renewal";
          break;
        case "duplicate_service":
          alertType = "plan_drift";
          availableActions = ["Keep all", "Compare and choose one", "Dismiss"];
          suggestedAction = "Compare and choose one";
          break;
        default:
          alertType = "unused_subscription";
          availableActions = ["Continue", "Cancel", "Dismiss"];
          suggestedAction = "Review";
      }
      
      const alert: InsertAlert = {
        type: alertType,
        severity: riskLevel,
        subscriptionId: anomaly.subscriptionId,
        merchant: anomaly.merchant,
        title,
        description,
        financialImpact: {
          monthly: monthlyLoss,
          yearly: yearlyLoss,
        },
        recommendation,
        aiExplanation,
        status: "pending",
        createdAt: new Date().toISOString(),
        oldAmount: anomaly.data.oldAmount as number | undefined,
        newAmount: anomaly.data.newAmount as number | undefined,
      };
      
      console.log(`[${this.name}] ${anomaly.merchant}: Suggested="${suggestedAction}" (requires user approval)`);
      
      recommendations.push({
        alert,
        availableActions,
        suggestedAction,
        requiresUserApproval: true,
      });
    }
    
    console.log(`[${this.name}] Generated ${recommendations.length} recommendations`);
    console.log(`[${this.name}] All recommendations pending user approval`);
    
    return recommendations;
  }
}

export const actionAgent = new ActionRecommendationAgent();
