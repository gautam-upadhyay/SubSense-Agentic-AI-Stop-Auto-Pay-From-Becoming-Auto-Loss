import { Wallet, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import type { Wallet as WalletType } from "@shared/schema";

interface WalletCardProps {
  wallet: WalletType | undefined;
  isLoading: boolean;
}

export function WalletCard({ wallet, isLoading }: WalletCardProps) {
  const [, setLocation] = useLocation();
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6">
          <div className="animate-pulse">
            <div className="h-4 w-20 bg-white/20 rounded mb-4" />
            <div className="h-10 w-40 bg-white/20 rounded mb-2" />
            <div className="h-3 w-24 bg-white/20 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: wallet?.currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card 
      className="overflow-visible cursor-pointer hover-elevate active-elevate-2 transition-transform" 
      onClick={() => setLocation("/transactions")}
      data-testid="card-wallet"
    >
      <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Wallet Balance</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            <span>+2.4%</span>
          </div>
        </div>
        <div className="mb-1">
          <span className="text-4xl font-bold tracking-tight" data-testid="text-wallet-balance">
            {wallet ? formatCurrency(wallet.balance) : "₹0"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm opacity-75">
            Last updated: {wallet ? new Date(wallet.lastUpdated).toLocaleDateString() : "—"}
          </p>
          <div className="flex items-center gap-1 text-xs opacity-75 hover:opacity-100 transition-opacity">
            <span>View transactions</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Card>
  );
}
