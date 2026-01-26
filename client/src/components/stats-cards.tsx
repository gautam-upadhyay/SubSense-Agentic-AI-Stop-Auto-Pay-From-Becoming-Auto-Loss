import { CreditCard, TrendingUp, AlertTriangle, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardSummary } from "@shared/schema";

interface StatsCardsProps {
  summary: DashboardSummary | undefined;
  isLoading: boolean;
}

export function StatsCards({ summary, isLoading }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      label: "Active Subscriptions",
      value: summary?.activeSubscriptions ?? 0,
      subtext: `${summary?.totalSubscriptions ?? 0} total`,
      icon: CreditCard,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Monthly Spend",
      value: summary ? formatCurrency(summary.monthlySpend) : "₹0",
      subtext: `${summary ? formatCurrency(summary.yearlyProjectedSpend) : "₹0"}/year`,
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Pending Alerts",
      value: summary?.pendingAlerts ?? 0,
      subtext: summary?.riskScore === "high" ? "High risk" : summary?.riskScore === "medium" ? "Medium risk" : "Low risk",
      icon: AlertTriangle,
      color: summary?.pendingAlerts ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400",
      bgColor: summary?.pendingAlerts ? "bg-red-100 dark:bg-red-900/30" : "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Potential Savings",
      value: summary ? formatCurrency(summary.potentialSavings) : "₹0",
      subtext: "Per year",
      icon: PiggyBank,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="animate-pulse">
                <div className="h-4 w-24 bg-muted rounded mb-3" />
                <div className="h-8 w-20 bg-muted rounded mb-2" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover-elevate" data-testid={`card-stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{stat.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
