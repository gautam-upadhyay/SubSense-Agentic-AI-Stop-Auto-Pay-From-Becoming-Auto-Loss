import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  QrCode,
  Smartphone,
  CreditCard,
  Shield,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";
import {
  SiNetflix,
  SiAmazon,
  SiSpotify,
  SiApple,
  SiYoutube,
  SiAdobe,
  SiDropbox,
  SiNotion,
  SiLinkedin,
  SiAmazonaws,
} from "react-icons/si";
import { FaDumbbell, FaGraduationCap, FaCloud, FaGamepad } from "react-icons/fa";
import type { Payment } from "@shared/schema";

const platformData: Record<string, { name: string; logo: string; monthlyPrice: number; yearlyPrice: number; category: string }> = {
  "netflix": { name: "Netflix", logo: "netflix", monthlyPrice: 649, yearlyPrice: 6999, category: "Entertainment" },
  "amazon-prime": { name: "Amazon Prime", logo: "amazon", monthlyPrice: 299, yearlyPrice: 1499, category: "Shopping" },
  "spotify": { name: "Spotify", logo: "spotify", monthlyPrice: 119, yearlyPrice: 1189, category: "Entertainment" },
  "youtube-premium": { name: "YouTube Premium", logo: "youtube", monthlyPrice: 129, yearlyPrice: 1290, category: "Entertainment" },
  "apple-tv": { name: "Apple TV+", logo: "apple", monthlyPrice: 99, yearlyPrice: 999, category: "Entertainment" },
  "aws": { name: "AWS", logo: "aws", monthlyPrice: 2999, yearlyPrice: 29999, category: "Cloud Services" },
  "adobe-creative": { name: "Adobe Creative", logo: "adobe", monthlyPrice: 4999, yearlyPrice: 49999, category: "Productivity" },
  "dropbox": { name: "Dropbox", logo: "dropbox", monthlyPrice: 999, yearlyPrice: 9999, category: "Storage" },
  "notion": { name: "Notion", logo: "notion", monthlyPrice: 800, yearlyPrice: 8000, category: "Productivity" },
  "linkedin-premium": { name: "LinkedIn Premium", logo: "linkedin", monthlyPrice: 2499, yearlyPrice: 17999, category: "Professional" },
  "fitness-first": { name: "Fitness First", logo: "gym", monthlyPrice: 2999, yearlyPrice: 29999, category: "Fitness" },
  "coursera": { name: "Coursera Plus", logo: "education", monthlyPrice: 3999, yearlyPrice: 39999, category: "Education" },
  "google-one": { name: "Google One", logo: "cloud", monthlyPrice: 130, yearlyPrice: 1300, category: "Storage" },
  "xbox-game-pass": { name: "Xbox Game Pass", logo: "gaming", monthlyPrice: 499, yearlyPrice: 4999, category: "Gaming" },
};

const getPlatformIcon = (logo: string, size: string = "w-12 h-12") => {
  switch (logo) {
    case "netflix": return <SiNetflix className={`${size} text-red-600`} />;
    case "amazon": return <SiAmazon className={`${size} text-orange-500`} />;
    case "spotify": return <SiSpotify className={`${size} text-green-500`} />;
    case "youtube": return <SiYoutube className={`${size} text-red-500`} />;
    case "apple": return <SiApple className={`${size} text-gray-800 dark:text-gray-200`} />;
    case "aws": return <SiAmazonaws className={`${size} text-orange-400`} />;
    case "adobe": return <SiAdobe className={`${size} text-red-500`} />;
    case "dropbox": return <SiDropbox className={`${size} text-blue-500`} />;
    case "notion": return <SiNotion className={`${size} text-gray-800 dark:text-gray-200`} />;
    case "linkedin": return <SiLinkedin className={`${size} text-blue-600`} />;
    case "gym": return <FaDumbbell className={`${size} text-purple-500`} />;
    case "education": return <FaGraduationCap className={`${size} text-blue-600`} />;
    case "cloud": return <FaCloud className={`${size} text-blue-500`} />;
    case "gaming": return <FaGamepad className={`${size} text-green-600`} />;
    default: return <Zap className={`${size} text-primary`} />;
  }
};

export default function PaymentPage() {
  const { platform: platformId } = useParams<{ platform: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "qr" | "card">("qr");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);

  const platform = platformId ? platformData[platformId] : null;

  const amount = platform 
    ? (billingCycle === "monthly" ? platform.monthlyPrice : platform.yearlyPrice)
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const initiatePaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payments/initiate", {
        platform: platform?.name,
        amount,
        billingCycle,
        paymentMethod,
      });
      return response.json();
    },
    onSuccess: (data: Payment) => {
      setCurrentPayment(data);
      if (paymentMethod === "qr") {
        // QR code payment - show QR
      } else if (paymentMethod === "upi") {
        // Simulate UPI processing
        setTimeout(() => {
          confirmPaymentMutation.mutate(data.id);
        }, 2000);
      } else {
        // Card payment - simulate processing
        setTimeout(() => {
          confirmPaymentMutation.mutate(data.id);
        }, 2000);
      }
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Unable to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await apiRequest("POST", "/api/payments/confirm", {
        paymentId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Payment Successful!",
        description: `${platform?.name} subscription activated with auto-pay enabled.`,
      });
      setLocation("/subscriptions");
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Unable to confirm payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Poll for payment status if QR payment
  const { data: paymentStatus } = useQuery<Payment>({
    queryKey: ["/api/payments", currentPayment?.id],
    enabled: !!currentPayment && paymentMethod === "qr" && currentPayment.status === "pending",
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (paymentStatus?.status === "success") {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Payment Successful!",
        description: `${platform?.name} subscription activated with auto-pay enabled.`,
      });
      setLocation("/subscriptions");
    }
  }, [paymentStatus?.status]);

  if (!platform) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Platform not found</p>
        <Button variant="outline" onClick={() => setLocation("/marketplace")} className="mt-4">
          Go to Marketplace
        </Button>
      </div>
    );
  }

  const isProcessing = initiatePaymentMutation.isPending || confirmPaymentMutation.isPending;
  const showQRCode = currentPayment && paymentMethod === "qr" && currentPayment.status === "pending";

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6" data-testid="page-payment">
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-lg border border-amber-500/20">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">Demo Payment – No real money is transferred</span>
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={() => setLocation("/marketplace")}
        className="gap-2"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Button>

      {showQRCode ? (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-center text-primary-foreground">
            <h2 className="text-xl font-bold mb-2">Scan QR to Pay</h2>
            <p className="text-sm opacity-80">Use any UPI app to scan and pay</p>
          </div>
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-xl shadow-lg">
                {currentPayment.qrCode ? (
                  <img 
                    src={currentPayment.qrCode} 
                    alt="Payment QR Code" 
                    className="w-48 h-48"
                    data-testid="img-qr-code"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
              <p className="text-sm text-muted-foreground">
                Paying to: {platform.name}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for payment...
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <p>Or open this link on your phone:</p>
              <a 
                href={`/qr-pay/${currentPayment.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {window.location.origin}/qr-pay/{currentPayment.id}
              </a>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setCurrentPayment(null)}
              data-testid="button-cancel-qr"
            >
              Cancel & Choose Another Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  {getPlatformIcon(platform.logo)}
                </div>
                <div>
                  <CardTitle className="text-xl">{platform.name}</CardTitle>
                  <Badge variant="outline">{platform.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Billing Cycle</Label>
                <RadioGroup
                  value={billingCycle}
                  onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="monthly"
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      billingCycle === "monthly" ? "border-primary bg-primary/5" : "border-muted"
                    }`}
                  >
                    <div>
                      <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                      <p className="font-medium">Monthly</p>
                      <p className="text-lg font-bold">{formatCurrency(platform.monthlyPrice)}</p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="yearly"
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      billingCycle === "yearly" ? "border-primary bg-primary/5" : "border-muted"
                    }`}
                  >
                    <div>
                      <RadioGroupItem value="yearly" id="yearly" className="sr-only" />
                      <p className="font-medium">Yearly</p>
                      <p className="text-lg font-bold">{formatCurrency(platform.yearlyPrice)}</p>
                      <Badge className="mt-1 bg-green-600">Save {Math.round((1 - platform.yearlyPrice / (platform.monthlyPrice * 12)) * 100)}%</Badge>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as "upi" | "qr" | "card")}
                  className="space-y-3"
                >
                  <Label
                    htmlFor="qr"
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === "qr" ? "border-primary bg-primary/5" : "border-muted"
                    }`}
                  >
                    <RadioGroupItem value="qr" id="qr" className="sr-only" />
                    <div className="p-2 rounded-lg bg-muted">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Scan QR Code</p>
                      <p className="text-sm text-muted-foreground">Pay using any UPI app</p>
                    </div>
                    <Badge variant="secondary">Recommended</Badge>
                  </Label>

                  <Label
                    htmlFor="upi"
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-muted"
                    }`}
                  >
                    <RadioGroupItem value="upi" id="upi" className="sr-only" />
                    <div className="p-2 rounded-lg bg-muted">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">UPI ID</p>
                      <p className="text-sm text-muted-foreground">Enter your UPI ID</p>
                    </div>
                  </Label>

                  <Label
                    htmlFor="card"
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === "card" ? "border-primary bg-primary/5" : "border-muted"
                    }`}
                  >
                    <RadioGroupItem value="card" id="card" className="sr-only" />
                    <div className="p-2 rounded-lg bg-muted">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Debit / Credit Card</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              {paymentMethod === "upi" && (
                <div className="space-y-2">
                  <Label htmlFor="upi-id">UPI ID</Label>
                  <Input
                    id="upi-id"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    data-testid="input-upi-id"
                  />
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      data-testid="input-card-number"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-expiry">Expiry</Label>
                      <Input
                        id="card-expiry"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        data-testid="input-card-expiry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-cvv">CVV</Label>
                      <Input
                        id="card-cvv"
                        placeholder="123"
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        data-testid="input-card-cvv"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(amount)}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>{formatCurrency(amount * 0.18)}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(amount * 1.18)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Auto-pay will be enabled for future payments</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>Protected by SubSense AI - we'll alert you of any issues</span>
            </div>
          </div>

          <Button
            className="w-full h-12 text-lg"
            onClick={() => initiatePaymentMutation.mutate()}
            disabled={isProcessing}
            data-testid="button-pay"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay {formatCurrency(amount * 1.18)}</>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
