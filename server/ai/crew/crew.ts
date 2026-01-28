import type { CrewConfig, TaskConfig, TaskResult, CrewResult } from "./types.js";
import { CrewAgent } from "./agent.js";

export class Crew {
  name: string;
  description: string;
  agents: Map<string, CrewAgent>;
  tasks: TaskConfig[];
  verbose: boolean;

  constructor(config: CrewConfig) {
    this.name = config.name;
    this.description = config.description;
    this.agents = new Map();
    this.tasks = config.tasks;
    this.verbose = config.verbose ?? true;

    for (const agentConfig of config.agents) {
      const agent = new CrewAgent(agentConfig);
      this.agents.set(agentConfig.name, agent);
    }
  }

  log(message: string): void {
    if (this.verbose) {
      console.log(`[Crew: ${this.name}] ${message}`);
    }
  }

  async kickoff(inputs: Record<string, any> = {}): Promise<CrewResult> {
    const startTime = Date.now();
    const taskResults: TaskResult[] = [];
    let context = { ...inputs };
    let success = true;

    this.log(`Starting crew execution with ${this.tasks.length} tasks`);
    this.log(`Crew members: ${Array.from(this.agents.keys()).join(", ")}`);

    for (const task of this.tasks) {
      const taskStartTime = Date.now();
      const agent = this.agents.get(task.agent);

      if (!agent) {
        this.log(`ERROR: Agent ${task.agent} not found`);
        success = false;
        taskResults.push({
          taskDescription: task.description,
          agentName: task.agent,
          output: null,
          success: false,
          duration: 0,
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      try {
        this.log(`Assigning task to ${agent.name}: ${task.description}`);
        const output = await agent.execute(task.description, context);
        const duration = Date.now() - taskStartTime;

        taskResults.push({
          taskDescription: task.description,
          agentName: task.agent,
          output,
          success: true,
          duration,
          timestamp: new Date().toISOString(),
        });

        context = { ...context, [task.agent]: output };
        this.log(`${agent.name} completed task in ${duration}ms`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        this.log(`ERROR: ${agent.name} failed - ${errorMsg}`);
        success = false;
        taskResults.push({
          taskDescription: task.description,
          agentName: task.agent,
          output: { error: errorMsg },
          success: false,
          duration: Date.now() - taskStartTime,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    this.log(`Crew execution completed in ${totalDuration}ms`);

    return {
      crewName: this.name,
      success,
      taskResults,
      totalDuration,
      finalOutput: context,
    };
  }

  getAgents(): CrewAgent[] {
    return Array.from(this.agents.values());
  }

  describe(): string {
    const agentDescriptions = this.getAgents()
      .map((a) => `  - ${a.describe()}`)
      .join("\n");
    return `${this.name}: ${this.description}\nAgents:\n${agentDescriptions}`;
  }
}
