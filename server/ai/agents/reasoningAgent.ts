import { ChatOpenAI } from "@langchain/openai";
import type { RiskAssessment } from "./riskAgent.js";

export interface ReasonedAlert {
  assessment: RiskAssessment;
  title: string;
  description: string;
  aiExplanation: string;
  recommendation: string;
}

export class ReasoningAgent {
  name = "Reasoning Agent";
  private llm: ChatOpenAI | null = null;
  
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.llm = new ChatOpenAI({
        modelName: "gpt-3.5-turbo",
        temperature: 0.3,
      });
      console.log(`[${this.name}] LLM initialized with OpenAI`);
    } else {
      console.log(`[${this.name}] No OpenAI API key found, using template-based reasoning`);
    }
  }
  
  async explain(assessments: RiskAssessment[]): Promise<ReasonedAlert[]> {
    console.log(`\n[${this.name}] Generating explanations for ${assessments.length} risks...`);
    
    const reasonedAlerts: ReasonedAlert[] = [];
    
    for (const assessment of assessments) {
      let title = "";
      let description = "";
      let aiExplanation = "";
      let recommendation = "";
      
      if (this.llm) {
        try {
          const prompt = this.buildPrompt(assessment);
          const response = await this.llm.invoke(prompt);
          const content = response.content as string;
          
          const parsed = this.parseResponse(content, assessment);
          title = parsed.title;
          description = parsed.description;
          aiExplanation = parsed.aiExplanation;
          recommendation = parsed.recommendation;
          
          console.log(`[${this.name}] LLM generated explanation for ${assessment.anomaly.merchant}`);
        } catch (error) {
          console.log(`[${this.name}] LLM failed, falling back to templates`);
          const fallback = this.generateTemplateExplanation(assessment);
          title = fallback.title;
          description = fallback.description;
          aiExplanation = fallback.aiExplanation;
          recommendation = fallback.recommendation;
        }
      } else {
        const fallback = this.generateTemplateExplanation(assessment);
        title = fallback.title;
        description = fallback.description;
        aiExplanation = fallback.aiExplanation;
        recommendation = fallback.recommendation;
      }
      
      reasonedAlerts.push({
        assessment,
        title,
        description,
        aiExplanation,
        recommendation,
      });
    }
    
    console.log(`[${this.name}] Generated ${reasonedAlerts.length} explanations`);
    return reasonedAlerts;
  }
  
  private buildPrompt(assessment: RiskAssessment): string {
    const { anomaly, monthlyLoss, yearlyLoss } = assessment;
    
    return `You are a financial advisor AI helping users understand subscription risks.

Analyze this subscription issue and provide a brief, clear explanation:

Type: ${anomaly.type}
Merchant: ${anomaly.merchant}
Monthly Impact: ₹${monthlyLoss}
Yearly Impact: ₹${yearlyLoss}
Details: ${JSON.stringify(anomaly.data)}

Provide a JSON response with:
{
  "title": "Short alert title (max 50 chars)",
  "description": "One sentence describing the issue",
  "aiExplanation": "2-3 sentences explaining why this matters and the financial impact",
  "recommendation": "One actionable recommendation"
}`;
  }
  
  private parseResponse(content: string, assessment: RiskAssessment): {
    title: string;
    description: string;
    aiExplanation: string;
    recommendation: string;
  } {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          title: parsed.title || this.generateTemplateExplanation(assessment).title,
          description: parsed.description || this.generateTemplateExplanation(assessment).description,
          aiExplanation: parsed.aiExplanation || this.generateTemplateExplanation(assessment).aiExplanation,
          recommendation: parsed.recommendation || this.generateTemplateExplanation(assessment).recommendation,
        };
      }
    } catch {
      // Fall through to template
    }
    return this.generateTemplateExplanation(assessment);
  }
  
  private generateTemplateExplanation(assessment: RiskAssessment): {
    title: string;
    description: string;
    aiExplanation: string;
    recommendation: string;
  } {
    const { anomaly, monthlyLoss, yearlyLoss, riskLevel } = assessment;
    
    switch (anomaly.type) {
      case "price_increase": {
        const percentChange = anomaly.data.percentageChange as number;
        return {
          title: `${anomaly.merchant} Price Increase Detected`,
          description: `${anomaly.merchant} increased its price by ${percentChange}%, costing you ₹${yearlyLoss} more per year.`,
          aiExplanation: `Our AI detected a ${percentChange}% price increase on your ${anomaly.merchant} subscription. This silent increase happened without direct notification. Over the next year, you'll pay ₹${yearlyLoss} more than before. This is a ${riskLevel} risk alert that requires your attention.`,
          recommendation: "Review if the service still provides value at this price, consider alternatives or cancelling.",
        };
      }
      case "unused_subscription": {
        const days = anomaly.data.daysSinceLastUse as number;
        return {
          title: `${anomaly.merchant} Unused for ${days} Days`,
          description: `You haven't used ${anomaly.merchant} in ${days} days but are still being charged ₹${monthlyLoss}/month.`,
          aiExplanation: `Your ${anomaly.merchant} subscription has been inactive for ${days} days. At ₹${monthlyLoss}/month, this costs you ₹${yearlyLoss}/year for a service you're not using. This represents silent financial leakage that many users overlook.`,
          recommendation: "Consider pausing or cancelling this subscription to save money.",
        };
      }
      case "upcoming_renewal": {
        const daysLeft = anomaly.data.daysUntilRenewal as number;
        return {
          title: `${anomaly.merchant} Annual Renewal in ${daysLeft} Days`,
          description: `Your ${anomaly.merchant} subscription will auto-renew for ₹${yearlyLoss} in ${daysLeft} days.`,
          aiExplanation: `Your annual ${anomaly.merchant} subscription is about to auto-renew. The charge of ₹${yearlyLoss} will be deducted automatically. Now is the time to decide if you want to continue this service for another year.`,
          recommendation: daysLeft <= 2 ? "Urgent: Decide now if you want to keep or cancel before auto-renewal." : "Review your usage and decide if you want to continue.",
        };
      }
      case "duplicate_service": {
        const category = anomaly.data.category as string;
        return {
          title: `Multiple ${category} Subscriptions`,
          description: `You have multiple subscriptions in the ${category} category that may overlap.`,
          aiExplanation: `Our AI detected multiple active subscriptions in the ${category} category: ${anomaly.merchant}. Having overlapping services costs you ₹${yearlyLoss}/year in potential waste. Consider if you need all of them.`,
          recommendation: "Compare features and keep only the one you use most.",
        };
      }
      default:
        return {
          title: `Alert for ${anomaly.merchant}`,
          description: `Potential issue detected with your ${anomaly.merchant} subscription.`,
          aiExplanation: `Our AI flagged a potential issue with your ${anomaly.merchant} subscription worth ₹${yearlyLoss}/year.`,
          recommendation: "Review this subscription and take appropriate action.",
        };
    }
  }
}

export const reasoningAgent = new ReasoningAgent();
