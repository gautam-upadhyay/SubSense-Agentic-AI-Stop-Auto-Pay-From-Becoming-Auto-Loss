import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  AlertTriangle,
  Clock,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Activity,
} from "lucide-react";
import type { AgentStatus } from "@shared/schema";

interface AgentStatusProps {
  agents: AgentStatus[] | undefined;
  isLoading: boolean;
}

const agentConfig: Record<string, { icon: any; color: string; bgColor: string; description: string }> = {
  "Monitoring Agent": {
    icon: Eye,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Observes all transactions and builds subscription memory",
  },
  "Anomaly Detection Agent": {
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    description: "Detects price increases, trial-to-paid transitions, and plan drift",
  },
  "Usage Analysis Agent": {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    description: "Analyzes service usage frequency and detects unused subscriptions",
  },
  "Risk Prediction Agent": {
    icon: TrendingUp,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    description: "Estimates financial loss and assigns risk levels",
  },
  "Reasoning Agent": {
    icon: MessageSquare,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    description: "Explains what changed, why it matters, and financial impact",
  },
  "Action Recommendation Agent": {
    icon: Lightbulb,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    description: "Suggests actions and executes after user approval",
  },
};

export function AgentStatusCard({ agents, isLoading }: AgentStatusProps) {
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
        return (
          <Badge variant="secondary">
            Idle
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">AI Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-md" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted rounded mb-2" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
                <div className="h-5 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-agents">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Agentic AI System</CardTitle>
          <Badge variant="outline" className="text-xs">
            Observe → Reason → Decide → Act
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents?.map((agent) => {
            const config = agentConfig[agent.name] || {
              icon: Activity,
              color: "text-muted-foreground",
              bgColor: "bg-muted",
              description: "",
            };
            const Icon = config.icon;

            return (
              <div
                key={agent.name}
                className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 hover-elevate"
                data-testid={`agent-${agent.name.toLowerCase().replace(/ /g, '-')}`}
              >
                <div className={`p-2 rounded-md ${config.bgColor}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{agent.name}</span>
                    {getStatusBadge(agent.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {config.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Last run: {new Date(agent.lastRun).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>{agent.observations} observations</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
