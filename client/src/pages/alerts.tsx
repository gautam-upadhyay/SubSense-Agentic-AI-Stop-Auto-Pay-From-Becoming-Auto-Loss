import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  Bell,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  History,
  ShieldCheck,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import type { Alert } from "@shared/schema";

export default function Alerts() {
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "price_increase":
        return <TrendingUp className="w-5 h-5" />;
      case "unused_subscription":
        return <Clock className="w-5 h-5" />;
      case "trial_to_paid":
        return <Zap className="w-5 h-5" />;
      case "plan_drift":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "price_increase":
        return "Price Increase";
      case "unused_subscription":
        return "Unused Subscription";
      case "trial_to_paid":
        return "Trial → Paid";
      case "plan_drift":
        return "Plan Drift";
      default:
        return type;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-600 text-white border-0">High Risk</Badge>;
      case "medium":
        return <Badge className="bg-amber-500 text-white border-0">Medium Risk</Badge>;
      case "low":
        return <Badge className="bg-emerald-600 text-white border-0">Low Risk</Badge>;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-amber-500";
      case "low":
        return "border-l-emerald-500";
      default:
        return "border-l-muted";
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      case "medium":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
      case "low":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const pendingAlerts = alerts?.filter((a) => a.status === "pending") || [];
  const resolvedAlerts = alerts?.filter((a) => a.status === "resolved") || [];
  const dismissedAlerts = alerts?.filter((a) => a.status === "dismissed") || [];

  const totalPotentialLoss = pendingAlerts.reduce(
    (acc, a) => acc + a.financialImpact.yearly,
    0
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const renderAlertCard = (alert: Alert, isPending: boolean) => (
    <Collapsible
      key={alert.id}
      open={expandedId === alert.id}
      onOpenChange={(open) => setExpandedId(open ? alert.id : null)}
    >
      <Card
        className={`border-l-4 ${getSeverityColor(alert.severity)} animate-slide-up`}
        data-testid={`alert-card-${alert.id}`}
      >
        <CollapsibleTrigger asChild>
          <div className="p-5 cursor-pointer hover-elevate">
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-lg ${getSeverityBgColor(alert.severity)}`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-lg">{alert.title}</span>
                  {getSeverityBadge(alert.severity)}
                  <Badge variant="outline" className="text-xs">
                    {getAlertTypeLabel(alert.type)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{alert.description}</p>
                <div className="flex items-center gap-6 mt-3 flex-wrap">
                  <div>
                    <span className="text-xs text-muted-foreground">Monthly Loss</span>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(alert.financialImpact.monthly)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Yearly Loss</span>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(alert.financialImpact.yearly)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Detected</span>
                    <p className="font-medium">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedId === alert.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 border-t pt-4">
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <p className="font-medium mb-1">AI Analysis</p>
                  <p className="text-muted-foreground">{alert.aiExplanation}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="text-sm text-muted-foreground">Recommendation: </span>
                <span className="font-medium">{alert.recommendation}</span>
              </div>
              {isPending && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlertMutation.mutate(alert.id)}
                    disabled={dismissAlertMutation.isPending}
                    className="w-full sm:w-auto"
                    data-testid={`button-dismiss-${alert.id}`}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resolveAlertMutation.mutate({ id: alert.id, action: "keep" })}
                    disabled={resolveAlertMutation.isPending}
                    className="w-full sm:w-auto"
                    data-testid={`button-keep-${alert.id}`}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Keep
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => resolveAlertMutation.mutate({ id: alert.id, action: "cancel" })}
                    disabled={resolveAlertMutation.isPending}
                    className="w-full sm:w-auto"
                    data-testid={`button-cancel-${alert.id}`}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel Auto-Pay
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" data-testid="page-alerts">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Alerts</h1>
        <p className="text-muted-foreground">
          Intelligent alerts from our Agentic AI system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/30">
                <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Alerts</p>
                <p className="text-2xl font-bold">{pendingAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potential Yearly Loss</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalPotentialLoss)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{resolvedAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending {pendingAlerts.length > 0 && `(${pendingAlerts.length})`}
          </TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved">
            Resolved {resolvedAlerts.length > 0 && `(${resolvedAlerts.length})`}
          </TabsTrigger>
          <TabsTrigger value="dismissed" data-testid="tab-dismissed">
            Dismissed {dismissedAlerts.length > 0 && `(${dismissedAlerts.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-emerald-600 dark:text-emerald-400" />
                <p className="font-medium text-lg">All Clear!</p>
                <p className="text-muted-foreground">No pending alerts at the moment</p>
              </CardContent>
            </Card>
          ) : (
            pendingAlerts.map((alert) => renderAlertCard(alert, true))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {resolvedAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No resolved alerts yet</p>
              </CardContent>
            </Card>
          ) : (
            resolvedAlerts.map((alert) => renderAlertCard(alert, false))
          )}
        </TabsContent>

        <TabsContent value="dismissed" className="space-y-4">
          {dismissedAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No dismissed alerts</p>
              </CardContent>
            </Card>
          ) : (
            dismissedAlerts.map((alert) => renderAlertCard(alert, false))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
