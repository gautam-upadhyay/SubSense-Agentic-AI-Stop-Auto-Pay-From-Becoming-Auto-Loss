import { monitoringAgent } from "../agents/monitoringAgent.js";
import { anomalyAgent } from "../agents/anomalyAgent.js";
import { riskAgent } from "../agents/riskAgent.js";
import { reasoningAgent } from "../agents/reasoningAgent.js";
import { actionAgent, type ActionRecommendation } from "../agents/actionAgent.js";
import { storage } from "../../storage.js";

export interface OrchestrationResult {
  success: boolean;
  recommendations: ActionRecommendation[];
  newAlerts: number;
  totalPotentialSavings: number;
  executionLog: string[];
}

export class AgentOrchestrator {
  name = "Agent Orchestrator";
  
  async run(): Promise<OrchestrationResult> {
    const executionLog: string[] = [];
    const log = (msg: string) => {
      console.log(msg);
      executionLog.push(msg);
    };
    
    log(`\n${"=".repeat(60)}`);
    log(`[${this.name}] Starting Agentic AI Pipeline`);
    log(`${"=".repeat(60)}`);
    log(`[${this.name}] Flow: DB → Monitor → Detect → Predict → Explain → Recommend → User`);
    
    try {
      log(`\n[Step 1/5] Fetching data from database...`);
      const subscriptions = await storage.getSubscriptions();
      const transactions = await storage.getTransactions();
      log(`[Step 1/5] Loaded ${subscriptions.length} subscriptions, ${transactions.length} transactions`);
      
      await storage.updateAgentStatus("Monitoring Agent", { status: "processing", lastRun: new Date().toISOString() });
      
      log(`\n[Step 2/5] Running Monitoring Agent...`);
      const monitoringResult = await monitoringAgent.observe(subscriptions, transactions);
      await storage.updateAgentStatus("Monitoring Agent", { 
        status: "active", 
        observations: (await storage.getAgentStatuses()).find(a => a.name === "Monitoring Agent")?.observations ?? 0 + 1 
      });
      
      log(`\n[Step 3/5] Running Anomaly Detection Agent...`);
      await storage.updateAgentStatus("Anomaly Detection Agent", { status: "processing", lastRun: new Date().toISOString() });
      const anomalies = await anomalyAgent.detect(monitoringResult);
      await storage.updateAgentStatus("Anomaly Detection Agent", { 
        status: "active",
        observations: anomalies.length
      });
      
      if (anomalies.length === 0) {
        log(`\n[${this.name}] No anomalies detected. Pipeline complete.`);
        return {
          success: true,
          recommendations: [],
          newAlerts: 0,
          totalPotentialSavings: 0,
          executionLog,
        };
      }
      
      log(`\n[Step 4/5] Running Risk Prediction Agent...`);
      await storage.updateAgentStatus("Risk Prediction Agent", { status: "processing", lastRun: new Date().toISOString() });
      const riskAssessments = await riskAgent.assess(anomalies);
      await storage.updateAgentStatus("Risk Prediction Agent", { 
        status: "active",
        observations: riskAssessments.length
      });
      
      log(`\n[Step 5/5] Running Reasoning & Action Agents...`);
      await storage.updateAgentStatus("Reasoning Agent", { status: "processing", lastRun: new Date().toISOString() });
      const reasonedAlerts = await reasoningAgent.explain(riskAssessments);
      await storage.updateAgentStatus("Reasoning Agent", { 
        status: "active",
        observations: reasonedAlerts.length
      });
      
      await storage.updateAgentStatus("Action Recommendation Agent", { status: "processing", lastRun: new Date().toISOString() });
      const recommendations = await actionAgent.recommend(reasonedAlerts);
      await storage.updateAgentStatus("Action Recommendation Agent", { 
        status: "active",
        observations: recommendations.length
      });
      
      const existingAlerts = await storage.getAlerts();
      const existingMerchants = new Set(existingAlerts.map(a => `${a.merchant}-${a.type}`));
      
      let newAlertCount = 0;
      for (const rec of recommendations) {
        const key = `${rec.alert.merchant}-${rec.alert.type}`;
        if (!existingMerchants.has(key)) {
          await storage.createAlert(rec.alert);
          newAlertCount++;
          log(`[${this.name}] Created new alert for ${rec.alert.merchant}`);
        }
      }
      
      const totalPotentialSavings = recommendations.reduce(
        (acc, r) => acc + r.alert.financialImpact.yearly,
        0
      );
      
      log(`\n${"=".repeat(60)}`);
      log(`[${this.name}] Pipeline Complete`);
      log(`[${this.name}] New Alerts: ${newAlertCount}`);
      log(`[${this.name}] Total Potential Savings: ₹${totalPotentialSavings}/year`);
      log(`[${this.name}] All recommendations await user approval`);
      log(`${"=".repeat(60)}\n`);
      
      return {
        success: true,
        recommendations,
        newAlerts: newAlertCount,
        totalPotentialSavings,
        executionLog,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      log(`\n[${this.name}] ERROR: ${errorMsg}`);
      
      return {
        success: false,
        recommendations: [],
        newAlerts: 0,
        totalPotentialSavings: 0,
        executionLog,
      };
    }
  }
}

export const orchestrator = new AgentOrchestrator();
