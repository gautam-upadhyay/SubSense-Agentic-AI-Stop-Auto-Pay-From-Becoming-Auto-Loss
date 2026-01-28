export interface AgentConfig {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  verbose?: boolean;
}

export interface TaskConfig {
  description: string;
  expectedOutput: string;
  agent: string;
  dependencies?: string[];
}

export interface CrewConfig {
  name: string;
  description: string;
  agents: AgentConfig[];
  tasks: TaskConfig[];
  verbose?: boolean;
}

export interface TaskResult {
  taskDescription: string;
  agentName: string;
  output: any;
  success: boolean;
  duration: number;
  timestamp: string;
}

export interface CrewResult {
  crewName: string;
  success: boolean;
  taskResults: TaskResult[];
  totalDuration: number;
  finalOutput: any;
}
