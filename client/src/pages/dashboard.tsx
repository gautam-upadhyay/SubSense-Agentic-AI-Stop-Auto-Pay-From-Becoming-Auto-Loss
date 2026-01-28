import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { WalletCard } from "@/components/wallet-card";
import { StatsCards } from "@/components/stats-cards";
import { SubscriptionList } from "@/components/subscription-list";
import { TransactionList } from "@/components/transaction-list";
import { AlertList } from "@/components/alert-list";
import { SpendingChart } from "@/components/spending-chart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Zap } from "lucide-react";
import type { DashboardSummary, Subscription, Transaction, Alert } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: summary, isLoading: summaryLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/simulate/autopay");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Auto-Pay Simulated",
        description: "A new subscription payment has been processed. AI agents are analyzing...",
      });
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "cancel" | "keep" }) => {
      return apiRequest("POST", `/api/alerts/${id}/resolve`, { action });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: action === "cancel" ? "Subscription Cancelled" : "Subscription Kept",
        description: action === "cancel" 
          ? "Auto-pay has been disabled for this subscription."
          : "The subscription will continue as normal.",
      });
    },
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/alerts/${id}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Dismissed",
        description: "The alert has been dismissed.",
      });
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your subscription protection overview
          </p>
        </div>
        <Button
          onClick={() => simulateMutation.mutate()}
          disabled={simulateMutation.isPending}
          className="w-full sm:w-auto"
          data-testid="button-simulate"
        >
          {simulateMutation.isPending ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          Simulate Auto-Pay
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WalletCard wallet={summary?.wallet} isLoading={summaryLoading} />
        <div className="lg:col-span-2">
          <StatsCards summary={summary} isLoading={summaryLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertList
          alerts={alerts}
          isLoading={alertsLoading}
          compact
          onDismiss={(id) => dismissAlertMutation.mutate(id)}
          onResolve={(id, action) => resolveAlertMutation.mutate({ id, action })}
        />
        <SpendingChart subscriptions={subscriptions} isLoading={subscriptionsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <SubscriptionList
            subscriptions={subscriptions}
            isLoading={subscriptionsLoading}
            compact
          />
          <Link href="/subscriptions">
            <Button variant="outline" className="w-full" data-testid="link-view-all-subscriptions">
              View All Subscriptions
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          <TransactionList
            transactions={transactions}
            isLoading={transactionsLoading}
            compact
          />
          <Link href="/transactions">
            <Button variant="outline" className="w-full" data-testid="link-view-all-transactions">
              View All Transactions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
