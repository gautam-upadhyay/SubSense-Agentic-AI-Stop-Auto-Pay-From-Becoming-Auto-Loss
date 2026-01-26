import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  AlertTriangle,
  Clock,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Activity,
  ArrowRight,
  Bot,
  Brain,
} from "lucide-react";
import type { AgentStatus } from "@shared/schema";

const agentConfig: Record<string, {
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  responsibilities: string[];
}> = {
  "Monitoring Agent": {
    icon: Eye,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Observes all transactions and builds subscription memory over time",
    responsibilities: [
      "Watches for new auto-pay transactions",
      "Identifies recurring payment patterns",
      "Builds historical context for each subscription",
      "Triggers analysis when anomalies are detected",
    ],
  },
  "Anomaly Detection Agent": {
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    description: "Detects price increases, trial-to-paid transitions, and plan drift",
    responsibilities: [
      "Detects price increases >15%",
      "Identifies trial-to-paid transitions",
      "Flags plan drift without user action",
      "Compares current vs historical pricing",
    ],
  },
  "Usage Analysis Agent": {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    description: "Analyzes service usage frequency and detects unused subscriptions",
    responsibilities: [
      "Tracks last usage date for each service",
      "Identifies subscriptions unused for 30+ days",
      "Calculates usage frequency patterns",
      "Flags forgotten subscriptions",
    ],
  },
  "Risk Prediction Agent": {
    icon: TrendingUp,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    description: "Estimates monthly and yearly financial loss and assigns risk levels",
    responsibilities: [
      "Calculates projected monthly loss",
      "Estimates yearly financial impact",
      "Assigns risk severity (High/Medium/Low)",
      "Prioritizes alerts by potential savings",
    ],
  },
  "Reasoning Agent": {
    icon: MessageSquare,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    description: "Explains what changed, why it matters, and the financial impact",
    responsibilities: [
      "Generates human-readable explanations",
      "Contextualizes financial impact",
      "Provides clear reasoning for alerts",
      "Uses AI for natural language generation",
    ],
  },
  "Action Recommendation Agent": {
    icon: Lightbulb,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    description: "Suggests actions and executes only after user approval",
    responsibilities: [
      "Recommends cancel or keep actions",
      "Waits for explicit user approval",
      "Executes approved actions safely",
      "Never takes action without consent",
    ],
  },
};

export default function Agents() {
  const { data: agents, isLoading } = useQuery<AgentStatus[]>({
    queryKey: ["/api/agents/status"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-600 text-white border-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
            Active
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-amber-500 text-white border-0">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            Processing
          </Badge>
        );
      case "idle":
        return <Badge variant="secondary">Idle</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" data-testid="page-agents">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agentic AI System</h1>
        <p className="text-muted-foreground">
          Autonomous agents protecting your subscriptions
        </p>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/20">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">How It Works</h2>
              <p className="text-muted-foreground mb-4">
                Our agentic AI system operates autonomously using a continuous loop:
              </p>
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <Badge variant="outline" className="bg-background">Observe</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-background">Reason</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-background">Decide</Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline" className="bg-background">Act</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                The system monitors your transactions 24/7, detects anomalies using deterministic rules,
                and only acts after your explicit approval.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents?.map((agent) => {
          const config = agentConfig[agent.name] || {
            icon: Bot,
            color: "text-muted-foreground",
            bgColor: "bg-muted",
            description: "",
            responsibilities: [],
          };
          const Icon = config.icon;

          return (
            <Card
              key={agent.name}
              className="hover-elevate"
              data-testid={`agent-card-${agent.name.toLowerCase().replace(/ /g, '-')}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      {getStatusBadge(agent.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Responsibilities
                    </p>
                    <ul className="space-y-1.5">
                      {config.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Last run: {new Date(agent.lastRun).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{agent.observations} observations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {[
                { label: "Transaction Occurs", icon: "💳" },
                { label: "AI Observes", icon: "👁️" },
                { label: "Reason & Analyze", icon: "🧠" },
                { label: "Risk Assessment", icon: "⚠️" },
                { label: "User Decision", icon: "👤" },
                { label: "Action Executed", icon: "✅" },
              ].map((step, i, arr) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl mb-2">
                      {step.icon}
                    </div>
                    <span className="text-xs text-muted-foreground max-w-[80px]">
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
