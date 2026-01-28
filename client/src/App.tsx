import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Dashboard from "@/pages/dashboard";
import Subscriptions from "@/pages/subscriptions";
import Transactions from "@/pages/transactions";
import Alerts from "@/pages/alerts";
import Agents from "@/pages/agents";
import Marketplace from "@/pages/marketplace";
import PaymentPage from "@/pages/payment";
import QRPayPage from "@/pages/qr-pay";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/pay/:platform" component={PaymentPage} />
      <Route path="/qr-pay/:paymentId" component={QRPayPage} />
      <Route path="/subscriptions" component={Subscriptions} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/agents" component={Agents} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="subsense-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <header className="sticky top-0 z-50 flex items-center justify-between gap-2 p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
