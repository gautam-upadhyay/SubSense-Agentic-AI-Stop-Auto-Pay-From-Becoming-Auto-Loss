import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { monitoringAgent } from "../agents/monitoringAgent.js";
import { anomalyAgent, type Anomaly } from "../agents/anomalyAgent.js";
import { riskAgent, type RiskAssessment } from "../agents/riskAgent.js";
import { reasoningAgent, type ReasonedAlert } from "../agents/reasoningAgent.js";
import { actionAgent, type ActionRecommendation } from "../agents/actionAgent.js";
import { storage } from "../../sqliteStorage.js";
import type { Subscription, Transaction, InsertAlert } from "@shared/schema";

const PipelineState = Annotation.Root({
  subscriptions: Annotation<Subscription[]>({
    reducer: (_, y) => y,
    default: () => [],
  }),
  transactions: Annotation<Transaction[]>({
    reducer: (_, y) => y,
    default: () => [],
  }),
  monitoringResult: Annotation<any>({
    reducer: (_, y) => y,
    default: () => ({}),
  }),
  anomalies: Annotation<Anomaly[]>({
    reducer: (_, y) => y,
    default: () => [],
  }),
  riskAssessments: Annotation<RiskAssessment[]>({
    reducer: (_, y) => y,
    default: () => [],
  }),
  reasonedAlerts: Annotation<ReasonedAlert[]>({
    reducer: (_, y) => y,
    default: () => [],
  }),
  recommendations: Annotation<ActionRecommendation[]>({
    reducer: (_, y) => y,
    default: () => [],
  }),
  newAlerts: Annotation<number>({
    reducer: (_, y) => y,
    default: () => 0,
  }),
  totalPotentialSavings: Annotation<number>({
    reducer: (_, y) => y,
    default: () => 0,
  }),
  executionLog: Annotation<string[]>({
    reducer: (x, y) => [...x, ...y],
    default: () => [],
  }),
  error: Annotation<string | null>({
    reducer: (_, y) => y,
    default: () => null,
  }),
});

type PipelineStateType = typeof PipelineState.State;

async function fetchDataNode(state: PipelineStateType): Promise<Partial<PipelineStateType>> {
  const logMsg = "[Step 1/5] Fetching data from database...";
  console.log(logMsg);
  
  const subscriptions = await storage.getSubscriptions();
  const transactions = await storage.getTransactions();
  
  console.log(`[Step 1/5] Loaded ${subscriptions.length} subscriptions, ${transactions.length} transactions`);
  
  return {
    subscriptions,
    transactions,
    executionLog: [logMsg, `Loaded ${subscriptions.length} subscriptions, ${transactions.length} transactions`],
  };
}

async function monitoringNode(state: PipelineStateType): Promise<Partial<PipelineStateType>> {
  const logMsg = "[Step 2/5] Running Monitoring Agent...";
  console.log(logMsg);
  
  await storage.updateAgentStatus("Monitoring Agent", { 
    status: "processing", 
    lastRun: new Date().toISOString() 
  });
  
  const monitoringResult = await monitoringAgent.observe(state.subscriptions, state.transactions);
  
  const currentStatuses = await storage.getAgentStatuses();
  const monitoringObservations = currentStatuses.find(a => a.name === "Monitoring Agent")?.observations ?? 0;
  await storage.updateAgentStatus("Monitoring Agent", { 
    status: "active", 
    observations: monitoringObservations + 1 
  });
  
  console.log(`[Monitoring Agent] Found ${monitoringResult.priceChanges?.length || 0} price changes, ${monitoringResult.unusedSubscriptions?.length || 0} unused, ${monitoringResult.upcomingRenewals?.length || 0} renewals`);
  
  return {
    monitoringResult,
    executionLog: [logMsg],
  };
}

async function anomalyDetectionNode(state: PipelineStateType): Promise<Partial<PipelineStateType>> {
  const logMsg = "[Step 3/5] Running Anomaly Detection Agent...";
  console.log(logMsg);
  
  await storage.updateAgentStatus("Anomaly Detection Agent", { 
    status: "processing", 
    lastRun: new Date().toISOString() 
  });
  
  const anomalies = await anomalyAgent.detect(state.monitoringResult);
  
  await storage.updateAgentStatus("Anomaly Detection Agent", { 
    status: "active",
    observations: anomalies.length
  });
  
  console.log(`[Anomaly Detection Agent] Detected ${anomalies.length} anomalies`);
  
  return {
    anomalies,
    executionLog: [logMsg, `Detected ${anomalies.length} anomalies`],
  };
}

async function riskPredictionNode(state: PipelineStateType): Promise<Partial<PipelineStateType>> {
  if (state.anomalies.length === 0) {
    console.log("[Risk Prediction Agent] No anomalies to assess, skipping...");
    return { executionLog: ["No anomalies to assess"] };
  }
  
  const logMsg = "[Step 4/5] Running Risk Prediction Agent...";
  console.log(logMsg);
  
  await storage.updateAgentStatus("Risk Prediction Agent", { 
    status: "processing", 
    lastRun: new Date().toISOString() 
  });
  
  const riskAssessments = await riskAgent.assess(state.anomalies);
  
  await storage.updateAgentStatus("Risk Prediction Agent", { 
    status: "active",
    observations: riskAssessments.length
  });
  
  console.log(`[Risk Prediction Agent] Assessed ${riskAssessments.length} risks`);
  
  return {
    riskAssessments,
    executionLog: [logMsg],
  };
}

async function reasoningNode(state: PipelineStateType): Promise<Partial<PipelineStateType>> {
  if (state.riskAssessments.length === 0) {
    console.log("[Reasoning Agent] No risks to explain, skipping...");
    return { executionLog: ["No risks to explain"] };
  }
  
  const logMsg = "[Step 5/5] Running Reasoning & Action Agents...";
  console.log(logMsg);
  
  await storage.updateAgentStatus("Reasoning Agent", { 
    status: "processing", 
    lastRun: new Date().toISOString() 
  });
  
  const reasonedAlerts = await reasoningAgent.explain(state.riskAssessments);
  
  await storage.updateAgentStatus("Reasoning Agent", { 
    status: "active",
    observations: reasonedAlerts.length
  });
  
  console.log(`[Reasoning Agent] Generated ${reasonedAlerts.length} explanations`);
  
  return {
    reasonedAlerts,
    executionLog: [logMsg],
  };
}

async function actionNode(state: PipelineStateType): Promise<Partial<PipelineStateType>> {
  if (state.reasonedAlerts.length === 0) {
    console.log("[Action Agent] No alerts to process, skipping...");
    return { 
      recommendations: [],
      newAlerts: 0,
      totalPotentialSavings: 0,
      executionLog: ["No alerts to process"] 
    };
  }
  
  await storage.updateAgentStatus("Action Recommendation Agent", { 
    status: "processing", 
    lastRun: new Date().toISOString() 
  });
  
  const recommendations = await actionAgent.recommend(state.reasonedAlerts);
  
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
      console.log(`[LangGraph Orchestrator] Created new alert for ${rec.alert.merchant}`);
    }
  }
  
  const totalPotentialSavings = recommendations.reduce(
    (acc, r) => acc + r.alert.financialImpact.yearly,
    0
  );
  
  console.log(`[Action Agent] Generated ${recommendations.length} recommendations, ${newAlertCount} new alerts`);
  
  return {
    recommendations,
    newAlerts: newAlertCount,
    totalPotentialSavings,
    executionLog: [`Created ${newAlertCount} new alerts, potential savings: ₹${totalPotentialSavings}/year`],
  };
}

function shouldContinueAfterAnomalies(state: PipelineStateType): "riskPrediction" | "end" {
  if (state.anomalies.length === 0) {
    console.log("[LangGraph] No anomalies detected, ending pipeline early");
    return "end";
  }
  return "riskPrediction";
}

const workflow = new StateGraph(PipelineState)
  .addNode("fetchData", fetchDataNode)
  .addNode("monitoring", monitoringNode)
  .addNode("anomalyDetection", anomalyDetectionNode)
  .addNode("riskPrediction", riskPredictionNode)
  .addNode("reasoning", reasoningNode)
  .addNode("action", actionNode)
  .addEdge(START, "fetchData")
  .addEdge("fetchData", "monitoring")
  .addEdge("monitoring", "anomalyDetection")
  .addConditionalEdges("anomalyDetection", shouldContinueAfterAnomalies, {
    riskPrediction: "riskPrediction",
    end: END,
  })
  .addEdge("riskPrediction", "reasoning")
  .addEdge("reasoning", "action")
  .addEdge("action", END);

const app = workflow.compile();

export interface LangGraphOrchestrationResult {
  success: boolean;
  recommendations: ActionRecommendation[];
  newAlerts: number;
  totalPotentialSavings: number;
  executionLog: string[];
}

export async function runLangGraphPipeline(): Promise<LangGraphOrchestrationResult> {
  console.log("\n" + "=".repeat(60));
  console.log("[LangGraph Orchestrator] Starting Agentic AI Pipeline");
  console.log("=".repeat(60));
  console.log("[LangGraph] Flow: DB → Monitor → Detect → Predict → Explain → Recommend → User");
  
  try {
    const result = await app.invoke({});
    
    console.log("\n" + "=".repeat(60));
    console.log("[LangGraph Orchestrator] Pipeline Complete");
    console.log(`[LangGraph] New Alerts: ${result.newAlerts}`);
    console.log(`[LangGraph] Total Potential Savings: ₹${result.totalPotentialSavings}/year`);
    console.log("[LangGraph] All recommendations await user approval");
    console.log("=".repeat(60) + "\n");
    
    return {
      success: true,
      recommendations: result.recommendations,
      newAlerts: result.newAlerts,
      totalPotentialSavings: result.totalPotentialSavings,
      executionLog: result.executionLog,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[LangGraph Orchestrator] ERROR: ${errorMsg}`);
    
    return {
      success: false,
      recommendations: [],
      newAlerts: 0,
      totalPotentialSavings: 0,
      executionLog: [`Error: ${errorMsg}`],
    };
  }
}

export { app as langGraphPipeline };
