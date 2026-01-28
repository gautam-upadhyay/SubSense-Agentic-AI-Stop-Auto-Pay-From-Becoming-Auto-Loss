import { Crew } from "./crew.js";
import { CrewAgent } from "./agent.js";
import type { CrewConfig, CrewResult } from "./types.js";
import { storage } from "../../sqliteStorage.js";
import { monitoringAgent } from "../agents/monitoringAgent.js";
import { anomalyAgent, type Anomaly } from "../agents/anomalyAgent.js";
import { riskAgent, type RiskAssessment } from "../agents/riskAgent.js";
import { reasoningAgent, type ReasonedAlert } from "../agents/reasoningAgent.js";
import { actionAgent, type ActionRecommendation } from "../agents/actionAgent.js";

class MonitoringCrewAgent extends CrewAgent {
  constructor() {
    super({
      name: "Monitoring Specialist",
      role: "Subscription Monitor",
      goal: "Observe all subscription activity and detect patterns",
      backstory: "I am a vigilant monitor that watches every subscription transaction, detecting price changes, usage patterns, and renewal schedules.",
    });
  }

  async execute(task: string, context: Record<string, any>): Promise<any> {
    this.log("Observing subscription data...");
    await storage.updateAgentStatus("Monitoring Agent", {
      status: "processing",
      lastRun: new Date().toISOString(),
    });

    const subscriptions = await storage.getSubscriptions();
    const transactions = await storage.getTransactions();
    const result = await monitoringAgent.observe(subscriptions, transactions);

    const currentStatuses = await storage.getAgentStatuses();
    const observations = currentStatuses.find((a) => a.name === "Monitoring Agent")?.observations ?? 0;
    await storage.updateAgentStatus("Monitoring Agent", {
      status: "active",
      observations: observations + 1,
    });

    this.log(`Found ${result.priceChanges?.length || 0} price changes, ${result.unusedSubscriptions?.length || 0} unused subscriptions`);
    return result;
  }
}

class AnomalyDetectionCrewAgent extends CrewAgent {
  constructor() {
    super({
      name: "Anomaly Detective",
      role: "Pattern Analyst",
      goal: "Detect anomalies and suspicious patterns in subscription data",
      backstory: "I specialize in finding hidden patterns and anomalies that might indicate financial waste or fraud.",
    });
  }

  async execute(task: string, context: Record<string, any>): Promise<Anomaly[]> {
    this.log("Analyzing for anomalies...");
    await storage.updateAgentStatus("Anomaly Detection Agent", {
      status: "processing",
      lastRun: new Date().toISOString(),
    });

    const monitoringResult = context["Monitoring Specialist"];
    if (!monitoringResult) {
      this.log("No monitoring data available");
      return [];
    }

    const anomalies = await anomalyAgent.detect(monitoringResult);

    await storage.updateAgentStatus("Anomaly Detection Agent", {
      status: "active",
      observations: anomalies.length,
    });

    this.log(`Detected ${anomalies.length} anomalies`);
    return anomalies;
  }
}

class RiskAssessorCrewAgent extends CrewAgent {
  constructor() {
    super({
      name: "Risk Assessor",
      role: "Financial Risk Analyst",
      goal: "Calculate financial impact and risk severity of detected anomalies",
      backstory: "I quantify the financial risk of each anomaly to help users prioritize their actions.",
    });
  }

  async execute(task: string, context: Record<string, any>): Promise<RiskAssessment[]> {
    this.log("Assessing risks...");
    await storage.updateAgentStatus("Risk Prediction Agent", {
      status: "processing",
      lastRun: new Date().toISOString(),
    });

    const anomalies = context["Anomaly Detective"] as Anomaly[];
    if (!anomalies || anomalies.length === 0) {
      this.log("No anomalies to assess");
      return [];
    }

    const assessments = await riskAgent.assess(anomalies);

    await storage.updateAgentStatus("Risk Prediction Agent", {
      status: "active",
      observations: assessments.length,
    });

    this.log(`Assessed ${assessments.length} risks`);
    return assessments;
  }
}

class ReasoningCrewAgent extends CrewAgent {
  constructor() {
    super({
      name: "Explanation Expert",
      role: "AI Explainer",
      goal: "Generate clear, human-readable explanations for alerts",
      backstory: "I translate complex financial data into simple, actionable insights that users can understand.",
    });
  }

  async execute(task: string, context: Record<string, any>): Promise<ReasonedAlert[]> {
    this.log("Generating explanations...");
    await storage.updateAgentStatus("Reasoning Agent", {
      status: "processing",
      lastRun: new Date().toISOString(),
    });

    const riskAssessments = context["Risk Assessor"] as RiskAssessment[];
    if (!riskAssessments || riskAssessments.length === 0) {
      this.log("No risks to explain");
      return [];
    }

    const reasonedAlerts = await reasoningAgent.explain(riskAssessments);

    await storage.updateAgentStatus("Reasoning Agent", {
      status: "active",
      observations: reasonedAlerts.length,
    });

    this.log(`Generated ${reasonedAlerts.length} explanations`);
    return reasonedAlerts;
  }
}

class ActionRecommenderCrewAgent extends CrewAgent {
  constructor() {
    super({
      name: "Action Advisor",
      role: "Recommendation Specialist",
      goal: "Recommend actions users can take to protect their finances",
      backstory: "I provide actionable recommendations while ensuring human approval before any action is taken.",
    });
  }

  async execute(task: string, context: Record<string, any>): Promise<{ recommendations: ActionRecommendation[]; newAlerts: number; savings: number }> {
    this.log("Generating recommendations...");
    await storage.updateAgentStatus("Action Recommendation Agent", {
      status: "processing",
      lastRun: new Date().toISOString(),
    });

    const reasonedAlerts = context["Explanation Expert"] as ReasonedAlert[];
    if (!reasonedAlerts || reasonedAlerts.length === 0) {
      this.log("No alerts to process");
      return { recommendations: [], newAlerts: 0, savings: 0 };
    }

    const recommendations = await actionAgent.recommend(reasonedAlerts);

    const existingAlerts = await storage.getAlerts();
    const existingMerchants = new Set(existingAlerts.map((a) => `${a.merchant}-${a.type}`));

    let newAlertCount = 0;
    for (const rec of recommendations) {
      const key = `${rec.alert.merchant}-${rec.alert.type}`;
      if (!existingMerchants.has(key)) {
        await storage.createAlert(rec.alert);
        newAlertCount++;
        this.log(`Created alert for ${rec.alert.merchant}`);
      }
    }

    const totalSavings = recommendations.reduce((acc, r) => acc + r.alert.financialImpact.yearly, 0);

    await storage.updateAgentStatus("Action Recommendation Agent", {
      status: "active",
      observations: recommendations.length,
    });

    this.log(`Generated ${recommendations.length} recommendations, ${newAlertCount} new alerts, potential savings: ₹${totalSavings}/year`);

    return {
      recommendations,
      newAlerts: newAlertCount,
      savings: totalSavings,
    };
  }
}

export function createSubscriptionProtectionCrew(): Crew {
  const config: CrewConfig = {
    name: "Subscription Protection Crew",
    description: "A team of AI agents that autonomously protects users from silent financial loss in their subscriptions",
    agents: [
      {
        name: "Monitoring Specialist",
        role: "Subscription Monitor",
        goal: "Observe all subscription activity and detect patterns",
        backstory: "Vigilant monitor watching every transaction",
      },
      {
        name: "Anomaly Detective",
        role: "Pattern Analyst",
        goal: "Detect anomalies and suspicious patterns",
        backstory: "Specialist in finding hidden patterns",
      },
      {
        name: "Risk Assessor",
        role: "Financial Risk Analyst",
        goal: "Calculate financial impact and risk severity",
        backstory: "Quantifies risk to prioritize actions",
      },
      {
        name: "Explanation Expert",
        role: "AI Explainer",
        goal: "Generate human-readable explanations",
        backstory: "Translates complex data to insights",
      },
      {
        name: "Action Advisor",
        role: "Recommendation Specialist",
        goal: "Recommend protective actions",
        backstory: "Provides recommendations with human approval",
      },
    ],
    tasks: [
      {
        description: "Monitor all subscriptions and transactions for patterns",
        expectedOutput: "Monitoring result with price changes, unused subscriptions, renewals",
        agent: "Monitoring Specialist",
      },
      {
        description: "Detect anomalies from monitoring data",
        expectedOutput: "List of detected anomalies",
        agent: "Anomaly Detective",
        dependencies: ["Monitoring Specialist"],
      },
      {
        description: "Assess risk level of each anomaly",
        expectedOutput: "Risk assessments with severity and financial impact",
        agent: "Risk Assessor",
        dependencies: ["Anomaly Detective"],
      },
      {
        description: "Generate explanations for each risk",
        expectedOutput: "Human-readable alert explanations",
        agent: "Explanation Expert",
        dependencies: ["Risk Assessor"],
      },
      {
        description: "Create action recommendations for user approval",
        expectedOutput: "Actionable recommendations awaiting approval",
        agent: "Action Advisor",
        dependencies: ["Explanation Expert"],
      },
    ],
    verbose: true,
  };

  const crew = new Crew(config);
  crew.agents.set("Monitoring Specialist", new MonitoringCrewAgent());
  crew.agents.set("Anomaly Detective", new AnomalyDetectionCrewAgent());
  crew.agents.set("Risk Assessor", new RiskAssessorCrewAgent());
  crew.agents.set("Explanation Expert", new ReasoningCrewAgent());
  crew.agents.set("Action Advisor", new ActionRecommenderCrewAgent());

  return crew;
}

export interface CrewPipelineResult {
  success: boolean;
  recommendations: ActionRecommendation[];
  newAlerts: number;
  totalPotentialSavings: number;
  executionLog: string[];
}

export async function runCrewPipeline(): Promise<CrewPipelineResult> {
  console.log("\n" + "=".repeat(60));
  console.log("[CrewAI-Style Orchestrator] Starting Subscription Protection Crew");
  console.log("=".repeat(60));

  const crew = createSubscriptionProtectionCrew();
  console.log(crew.describe());

  const result = await crew.kickoff();

  const actionResult = result.finalOutput["Action Advisor"] as
    | { recommendations: ActionRecommendation[]; newAlerts: number; savings: number }
    | undefined;

  console.log("\n" + "=".repeat(60));
  console.log("[CrewAI-Style Orchestrator] Crew Execution Complete");
  console.log(`[Crew] Success: ${result.success}`);
  console.log(`[Crew] Total Duration: ${result.totalDuration}ms`);
  console.log(`[Crew] New Alerts: ${actionResult?.newAlerts || 0}`);
  console.log(`[Crew] Potential Savings: ₹${actionResult?.savings || 0}/year`);
  console.log("[Crew] All recommendations await user approval");
  console.log("=".repeat(60) + "\n");

  return {
    success: result.success,
    recommendations: actionResult?.recommendations || [],
    newAlerts: actionResult?.newAlerts || 0,
    totalPotentialSavings: actionResult?.savings || 0,
    executionLog: result.taskResults.map((t) => `${t.agentName}: ${t.taskDescription} (${t.duration}ms)`),
  };
}
