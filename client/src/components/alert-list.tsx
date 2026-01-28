import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  X,
  Check,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import type { Alert } from "@shared/schema";

interface AlertListProps {
  alerts: Alert[] | undefined;
  isLoading: boolean;
  onDismiss?: (id: string) => void;
  onResolve?: (id: string, action: "cancel" | "keep") => void;
  compact?: boolean;
  showTitle?: boolean;
}

export function AlertList({
  alerts,
  isLoading,
  onDismiss,
  onResolve,
  compact = false,
  showTitle = true,
}: AlertListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        return <TrendingUp className="w-4 h-4" />;
      case "unused_subscription":
        return <Clock className="w-4 h-4" />;
      case "trial_to_paid":
        return <Zap className="w-4 h-4" />;
      case "plan_drift":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <Badge className="bg-red-600 text-white border-0">
            High Risk
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-500 text-white border-0">
            Medium Risk
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-emerald-600 text-white border-0">
            Low Risk
          </Badge>
        );
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

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">AI Alerts</CardTitle>
          </CardHeader>
        )}
        <CardContent className={showTitle ? "" : "pt-6"}>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-lg border animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-muted rounded" />
                  <div className="flex-1">
                    <div className="h-4 w-40 bg-muted rounded mb-2" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingAlerts = alerts?.filter((a) => a.status === "pending");
  const displayAlerts = compact ? pendingAlerts?.slice(0, 3) : pendingAlerts;

  return (
    <Card data-testid="card-alerts">
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">AI Alerts</CardTitle>
              {pendingAlerts && pendingAlerts.length > 0 && (
                <Badge variant="destructive">{pendingAlerts.length}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "pt-6"}>
        {!displayAlerts || displayAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">All Clear!</p>
            <p className="text-sm">No pending alerts at the moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayAlerts.map((alert) => (
              <Collapsible
                key={alert.id}
                open={expandedId === alert.id}
                onOpenChange={(open) => setExpandedId(open ? alert.id : null)}
              >
                <div
                  className={`rounded-lg border border-l-4 ${getSeverityColor(alert.severity)} bg-card animate-slide-up`}
                  data-testid={`alert-item-${alert.id}`}
                >
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover-elevate rounded-t-lg">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-md ${
                            alert.severity === "high"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                              : alert.severity === "medium"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                              : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{alert.title}</span>
                            {getSeverityBadge(alert.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">
                              Est. yearly loss:{" "}
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                {formatCurrency(alert.financialImpact.yearly)}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedId === alert.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t pt-4">
                      <div className="bg-muted/50 rounded-md p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs">🤖</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">AI Analysis</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.aiExplanation}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                          Recommendation: <span className="font-medium text-foreground">{alert.recommendation}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {onDismiss && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDismiss(alert.id)}
                              className="w-full sm:w-auto"
                              data-testid={`button-dismiss-${alert.id}`}
                            >
                              Dismiss
                            </Button>
                          )}
                          {onResolve && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onResolve(alert.id, "keep")}
                                className="w-full sm:w-auto"
                                data-testid={`button-keep-${alert.id}`}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Keep
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => onResolve(alert.id, "cancel")}
                                className="w-full sm:w-auto"
                                data-testid={`button-cancel-${alert.id}`}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel Auto-Pay
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
