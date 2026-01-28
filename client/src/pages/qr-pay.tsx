import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Shield, Smartphone, AlertTriangle } from "lucide-react";
import type { Payment } from "@shared/schema";

export default function QRPayPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const { data: payment, isLoading, error } = useQuery<Payment>({
    queryKey: ["/api/payments", paymentId],
    enabled: !!paymentId,
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async () => {
      setIsConfirming(true);
      const response = await apiRequest("POST", "/api/payments/webhook", {
        paymentId,
        status: "success",
      });
      return response.json();
    },
    onSuccess: () => {
      setIsComplete(true);
      setIsConfirming(false);
    },
    onError: () => {
      setIsConfirming(false);
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-lg font-semibold mb-2">Payment Not Found</h2>
            <p className="text-sm text-muted-foreground">
              This payment link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (payment.status === "success" || isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-600">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your {payment.platform} subscription is now active.
            </p>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{formatCurrency(payment.amount)}</p>
              <p className="text-sm text-muted-foreground">
                Paid to {payment.platform}
              </p>
            </div>
            <Badge className="bg-green-600">Auto-Pay Enabled</Badge>
            <p className="text-xs text-muted-foreground pt-4">
              You can close this page now. Your subscription is active on SubSense.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 to-primary/10 p-4" data-testid="page-qr-pay">
      <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg mb-4">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
          <Shield className="w-4 h-4" />
          <span className="font-medium">Demo Payment – No real money is transferred</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-center text-primary-foreground rounded-t-lg">
            <Smartphone className="w-10 h-10 mx-auto mb-2" />
            <h1 className="text-xl font-bold">SubSense Pay</h1>
            <p className="text-sm opacity-80">UPI Payment</p>
          </div>
          
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Paying to</p>
              <p className="text-lg font-semibold">{payment.platform}</p>
              <p className="text-3xl font-bold">{formatCurrency(payment.amount)}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs">{payment.id.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="capitalize">{payment.billingCycle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Auto-Pay</span>
                <Badge variant="secondary" className="text-xs">Enabled</Badge>
              </div>
            </div>

            <Button
              className="w-full h-14 text-lg"
              onClick={() => confirmPaymentMutation.mutate()}
              disabled={isConfirming}
              data-testid="button-confirm-payment"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Confirm Payment</>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By confirming, you agree to enable auto-pay for future payments.
              SubSense AI will monitor and protect your subscription.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground mt-4">
        <p>Powered by SubSense AI Protection</p>
      </div>
    </div>
  );
}
