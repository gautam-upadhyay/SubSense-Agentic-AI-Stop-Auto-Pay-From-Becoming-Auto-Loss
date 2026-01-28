import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, Receipt, CreditCard } from "lucide-react";
import { getMerchantIcon } from "@/lib/merchant-icons";
import { useLocation } from "wouter";
import type { Transaction } from "@shared/schema";

interface TransactionListProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
  compact?: boolean;
  showTitle?: boolean;
  onItemClick?: (id: string) => void;
}

export function TransactionList({
  transactions,
  isLoading,
  compact = false,
  showTitle = true,
  onItemClick,
}: TransactionListProps) {
  const [, setLocation] = useLocation();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "blocked":
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === "AUTO_PAY") {
      return (
        <Badge variant="outline" className="text-xs">
          Auto-Pay
        </Badge>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
        )}
        <CardContent className={showTitle ? "" : "pt-6"}>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-muted rounded mb-2" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
                <div className="h-5 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayTxns = compact ? transactions?.slice(0, 6) : transactions;

  return (
    <Card data-testid="card-transactions">
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            {transactions && transactions.length > 0 && (
              <Badge variant="secondary">{transactions.length}</Badge>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "pt-6"}>
        {!displayTxns || displayTxns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayTxns.map((txn) => {
              const merchantIcon = getMerchantIcon(txn.merchant);
              return (
                <div
                  key={txn.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover-elevate cursor-pointer active-elevate-2 transition-transform"
                  onClick={() => onItemClick ? onItemClick(txn.id) : setLocation("/transactions")}
                  data-testid={`transaction-item-${txn.id}`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${merchantIcon.bgColor}`}>
                    {merchantIcon.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{txn.merchant}</span>
                      {getTypeBadge(txn.transactionType)}
                      {getStatusIcon(txn.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(txn.date)}</span>
                      <span>•</span>
                      <span className="capitalize">{txn.category}</span>
                    </div>
                  </div>
                  <div className={`font-semibold ${txn.status === "blocked" ? "text-muted-foreground line-through" : ""}`}>
                    <span className="text-red-600 dark:text-red-400">
                      -{formatCurrency(txn.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
