import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, AlertTriangle, Calendar, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMerchantIcon } from "@/lib/merchant-icons";
import type { Subscription } from "@shared/schema";

interface SubscriptionListProps {
  subscriptions: Subscription[] | undefined;
  isLoading: boolean;
  onCancel?: (id: string) => void;
  onPause?: (id: string) => void;
  compact?: boolean;
  showTitle?: boolean;
}

export function SubscriptionList({
  subscriptions,
  isLoading,
  onCancel,
  onPause,
  compact = false,
  showTitle = true,
}: SubscriptionListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-emerald-600 text-white">Active</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getPriceChange = (sub: Subscription) => {
    if (sub.previousAmount && sub.previousAmount !== sub.currentAmount) {
      const change = ((sub.currentAmount - sub.previousAmount) / sub.previousAmount) * 100;
      if (change > 0) {
        return (
          <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            +{change.toFixed(0)}%
          </span>
        );
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Subscriptions</CardTitle>
          </CardHeader>
        )}
        <CardContent className={showTitle ? "" : "pt-6"}>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-md" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-muted rounded mb-2" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displaySubs = compact ? subscriptions?.slice(0, 5) : subscriptions;

  return (
    <Card data-testid="card-subscriptions">
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Subscriptions</CardTitle>
            {subscriptions && subscriptions.length > 0 && (
              <Badge variant="secondary">{subscriptions.length}</Badge>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "pt-6"}>
        {!displaySubs || displaySubs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No subscriptions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displaySubs.map((sub) => {
              const merchantIcon = getMerchantIcon(sub.merchant);
              return (
                <div
                  key={sub.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover-elevate"
                  data-testid={`subscription-item-${sub.id}`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-md ${merchantIcon.bgColor}`}>
                    {merchantIcon.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{sub.merchant}</span>
                      {getPriceChange(sub)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{sub.billingCycle}</span>
                      {sub.nextBillingDate && (
                        <>
                          <span>•</span>
                          <span>Next: {new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(sub.currentAmount)}</div>
                    <div className="text-xs text-muted-foreground">
                      /{sub.billingCycle === "monthly" ? "mo" : "yr"}
                    </div>
                  </div>
                  {getStatusBadge(sub.status)}
                  {(onCancel || onPause) && sub.status === "active" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-subscription-menu-${sub.id}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onPause && (
                          <DropdownMenuItem onClick={() => onPause(sub.id)}>
                            <span className="text-amber-600">Pause Subscription</span>
                          </DropdownMenuItem>
                        )}
                        {onCancel && (
                          <DropdownMenuItem onClick={() => onCancel(sub.id)}>
                            <span className="text-destructive">Cancel Subscription</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
