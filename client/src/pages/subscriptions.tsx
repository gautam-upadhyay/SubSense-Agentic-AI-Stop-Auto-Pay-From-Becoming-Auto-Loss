import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Calendar,
  CreditCard,
  Pause,
  Play,
  X,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { getMerchantIcon } from "@/lib/merchant-icons";
import type { Subscription } from "@shared/schema";

export default function Subscriptions() {
  const { toast } = useToast();
  const [confirmAction, setConfirmAction] = useState<{
    type: "cancel" | "pause" | "resume";
    subscription: Subscription;
  } | null>(null);

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "cancel" | "pause" | "resume" }) => {
      return apiRequest("PATCH", `/api/subscriptions/${id}`, { action });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      setConfirmAction(null);
      toast({
        title: action === "cancel" ? "Subscription Cancelled" : action === "pause" ? "Subscription Paused" : "Subscription Resumed",
        description: action === "cancel"
          ? "The subscription has been cancelled and auto-pay disabled."
          : action === "pause"
          ? "The subscription has been paused."
          : "The subscription has been resumed.",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-600 text-white">Active</Badge>;
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
        return {
          percentage: change,
          element: (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <TrendingUp className="w-3 h-3" />
              <span>+{change.toFixed(0)}% price increase</span>
            </div>
          ),
        };
      }
    }
    return null;
  };

  const activeSubscriptions = subscriptions?.filter((s) => s.status === "active") || [];
  const pausedSubscriptions = subscriptions?.filter((s) => s.status === "paused") || [];
  const cancelledSubscriptions = subscriptions?.filter((s) => s.status === "cancelled") || [];

  const totalMonthly = activeSubscriptions.reduce((acc, s) => {
    return acc + (s.billingCycle === "monthly" ? s.currentAmount : s.currentAmount / 12);
  }, 0);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" data-testid="page-subscriptions">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage your auto-pay subscriptions and recurring payments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
                <Pause className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paused</p>
                <p className="text-2xl font-bold">{pausedSubscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Spend</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMonthly)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeSubscriptions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Subscriptions</h2>
          <div className="space-y-3">
            {activeSubscriptions.map((sub) => {
              const priceChange = getPriceChange(sub);
              const merchantIcon = getMerchantIcon(sub.merchant);
              return (
                <Card
                  key={sub.id}
                  className={`hover-elevate ${priceChange ? "border-l-4 border-l-red-500" : ""}`}
                  data-testid={`subscription-card-${sub.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${merchantIcon.bgColor}`}>
                        {merchantIcon.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{sub.merchant}</span>
                          {getStatusBadge(sub.status)}
                          {sub.autoPayEnabled && (
                            <Badge variant="outline" className="text-xs">Auto-Pay</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                          <span className="capitalize">{sub.category}</span>
                          <span>•</span>
                          <span className="capitalize">{sub.billingCycle}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Next: {new Date(sub.nextBillingDate).toLocaleDateString()}
                          </span>
                        </div>
                        {priceChange && <div className="mt-1">{priceChange.element}</div>}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{formatCurrency(sub.currentAmount)}</div>
                        <div className="text-sm text-muted-foreground">
                          /{sub.billingCycle === "monthly" ? "month" : "year"}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-menu-${sub.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ type: "pause", subscription: sub })}
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Pause Subscription
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ type: "cancel", subscription: sub })}
                            className="text-destructive"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel Subscription
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {pausedSubscriptions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Paused Subscriptions</h2>
          <div className="space-y-3">
            {pausedSubscriptions.map((sub) => {
              const merchantIcon = getMerchantIcon(sub.merchant);
              return (
                <Card key={sub.id} className="opacity-75" data-testid={`subscription-card-${sub.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${merchantIcon.bgColor}`}>
                        {merchantIcon.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{sub.merchant}</span>
                          {getStatusBadge(sub.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="capitalize">{sub.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-muted-foreground">
                          {formatCurrency(sub.currentAmount)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmAction({ type: "resume", subscription: sub })}
                        data-testid={`button-resume-${sub.id}`}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {cancelledSubscriptions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">Cancelled Subscriptions</h2>
          <div className="space-y-3">
            {cancelledSubscriptions.map((sub) => {
              const merchantIcon = getMerchantIcon(sub.merchant);
              return (
                <Card key={sub.id} className="opacity-50" data-testid={`subscription-card-${sub.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-muted grayscale`}>
                        {merchantIcon.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold line-through">{sub.merchant}</span>
                          {getStatusBadge(sub.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="capitalize">{sub.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-muted-foreground line-through">
                          {formatCurrency(sub.currentAmount)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "cancel"
                ? "Cancel Subscription"
                : confirmAction?.type === "pause"
                ? "Pause Subscription"
                : "Resume Subscription"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "cancel"
                ? `Are you sure you want to cancel ${confirmAction.subscription.merchant}? This will disable auto-pay.`
                : confirmAction?.type === "pause"
                ? `Are you sure you want to pause ${confirmAction?.subscription.merchant}?`
                : `Resume ${confirmAction?.subscription.merchant} subscription?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmAction(null)}
              className="w-full sm:w-auto"
              data-testid="button-cancel-dialog"
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === "cancel" ? "destructive" : "default"}
              onClick={() => {
                if (confirmAction) {
                  updateSubscriptionMutation.mutate({
                    id: confirmAction.subscription.id,
                    action: confirmAction.type,
                  });
                }
              }}
              disabled={updateSubscriptionMutation.isPending}
              className="w-full sm:w-auto"
              data-testid="button-confirm-action"
            >
              {updateSubscriptionMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {confirmAction?.type === "cancel"
                ? "Cancel Subscription"
                : confirmAction?.type === "pause"
                ? "Pause"
                : "Resume"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
