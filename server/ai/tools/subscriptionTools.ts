import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { storage } from "../../storage.js";

export const getSubscriptionsTool = new DynamicStructuredTool({
  name: "getSubscriptions",
  description: "Fetch all user subscriptions from the database",
  schema: z.object({}),
  func: async () => {
    console.log("[AI Tool] getSubscriptions - Fetching all subscriptions");
    const subscriptions = await storage.getSubscriptions();
    console.log(`[AI Tool] Found ${subscriptions.length} subscriptions`);
    return JSON.stringify(subscriptions);
  },
});

export const getTransactionsTool = new DynamicStructuredTool({
  name: "getTransactions",
  description: "Fetch all transactions from the database",
  schema: z.object({}),
  func: async () => {
    console.log("[AI Tool] getTransactions - Fetching all transactions");
    const transactions = await storage.getTransactions();
    console.log(`[AI Tool] Found ${transactions.length} transactions`);
    return JSON.stringify(transactions);
  },
});

export const calculateLossTool = new DynamicStructuredTool({
  name: "calculateLoss",
  description: "Calculate financial loss for a subscription based on amount and billing cycle",
  schema: z.object({
    amount: z.number().describe("The subscription amount"),
    billingCycle: z.enum(["monthly", "yearly"]).describe("The billing cycle"),
    previousAmount: z.number().optional().describe("Previous amount if there was a price change"),
  }),
  func: async ({ amount, billingCycle, previousAmount }) => {
    console.log(`[AI Tool] calculateLoss - Amount: ${amount}, Cycle: ${billingCycle}`);
    
    let monthlyLoss = billingCycle === "monthly" ? amount : amount / 12;
    let yearlyLoss = billingCycle === "monthly" ? amount * 12 : amount;
    
    if (previousAmount) {
      const increase = amount - previousAmount;
      monthlyLoss = billingCycle === "monthly" ? increase : increase / 12;
      yearlyLoss = billingCycle === "monthly" ? increase * 12 : increase;
    }
    
    const result = {
      monthlyLoss: Math.round(monthlyLoss),
      yearlyLoss: Math.round(yearlyLoss),
      isIncrease: !!previousAmount,
      percentageIncrease: previousAmount ? Math.round(((amount - previousAmount) / previousAmount) * 100) : 0,
    };
    
    console.log(`[AI Tool] Loss calculated:`, result);
    return JSON.stringify(result);
  },
});

export const getSubscriptionByIdTool = new DynamicStructuredTool({
  name: "getSubscriptionById",
  description: "Get a specific subscription by ID",
  schema: z.object({
    id: z.string().describe("The subscription ID"),
  }),
  func: async ({ id }) => {
    console.log(`[AI Tool] getSubscriptionById - ID: ${id}`);
    const subscription = await storage.getSubscription(id);
    return JSON.stringify(subscription || null);
  },
});

export const allTools = [
  getSubscriptionsTool,
  getTransactionsTool,
  calculateLossTool,
  getSubscriptionByIdTool,
];
