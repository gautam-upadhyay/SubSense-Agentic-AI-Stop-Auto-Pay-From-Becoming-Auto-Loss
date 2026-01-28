import { runLangGraphPipeline, type LangGraphOrchestrationResult } from "./graph/langgraphOrchestrator.js";
import { storage } from "../sqliteStorage.js";
import { randomUUID } from "crypto";

export type OrchestrationResult = LangGraphOrchestrationResult;

export interface SimulationResult extends OrchestrationResult {
  transaction?: {
    id: string;
    merchant: string;
    amount: number;
    priceIncreased: boolean;
    percentageIncrease?: number;
  };
}

export async function runAgentPipeline(): Promise<OrchestrationResult> {
  console.log("\n[AI Runner] Triggering LangGraph agent pipeline...");
  return await runLangGraphPipeline();
}

export async function simulateAutoPay(): Promise<SimulationResult> {
  console.log("\n[AI Runner] Simulating auto-pay transaction...");
  
  const subscriptions = await storage.getSubscriptions();
  const activeSubscriptions = subscriptions.filter(s => s.status === "active" && s.autoPayEnabled);
  
  if (activeSubscriptions.length === 0) {
    console.log("[AI Runner] No active subscriptions with auto-pay enabled");
    return {
      success: false,
      recommendations: [],
      newAlerts: 0,
      totalPotentialSavings: 0,
      executionLog: ["No active subscriptions found"],
    };
  }
  
  const randomIndex = Math.floor(Math.random() * activeSubscriptions.length);
  const subscription = activeSubscriptions[randomIndex];
  
  const priceIncrease = Math.random() < 0.3;
  let newAmount = subscription.currentAmount;
  let percentageIncrease = 0;
  
  if (priceIncrease) {
    percentageIncrease = Math.floor(Math.random() * 20) + 15;
    newAmount = Math.round(subscription.currentAmount * (1 + percentageIncrease / 100));
    
    await storage.updateSubscription(subscription.id, {
      previousAmount: subscription.currentAmount,
      currentAmount: newAmount,
    });
    
    console.log(`[AI Runner] Price increase detected: ${subscription.merchant} ${subscription.currentAmount} → ${newAmount} (+${percentageIncrease}%)`);
  }
  
  const transaction = await storage.createTransaction({
    date: new Date().toISOString(),
    merchant: subscription.merchant,
    amount: newAmount,
    transactionType: "AUTO_PAY",
    status: "success",
    subscriptionId: subscription.id,
    category: subscription.category,
  });
  
  console.log(`[AI Runner] Transaction created: ${transaction.merchant} ₹${transaction.amount}`);
  
  const wallet = await storage.getWallet();
  await storage.updateWallet({ balance: wallet.balance - newAmount });
  
  const pipelineResult = await runLangGraphPipeline();
  
  return {
    ...pipelineResult,
    transaction: {
      id: transaction.id,
      merchant: subscription.merchant,
      amount: newAmount,
      priceIncreased: priceIncrease,
      percentageIncrease: priceIncrease ? percentageIncrease : undefined,
    },
  };
}

export async function getAgentLogs(): Promise<string[]> {
  return [
    "Agent pipeline initialized",
    "Monitoring Agent: Active",
    "Anomaly Detection Agent: Active", 
    "Usage Analysis Agent: Active",
    "Risk Prediction Agent: Active",
    "Reasoning Agent: Ready",
    "Action Recommendation Agent: Ready",
  ];
}
