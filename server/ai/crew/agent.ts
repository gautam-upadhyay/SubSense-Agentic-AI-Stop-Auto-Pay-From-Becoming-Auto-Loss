import type { AgentConfig } from "./types.js";

export class CrewAgent {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  verbose: boolean;

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.role = config.role;
    this.goal = config.goal;
    this.backstory = config.backstory;
    this.verbose = config.verbose ?? true;
  }

  log(message: string): void {
    if (this.verbose) {
      console.log(`[${this.name}] ${message}`);
    }
  }

  async execute(task: string, context: Record<string, any>): Promise<any> {
    this.log(`Starting task: ${task}`);
    this.log(`Goal: ${this.goal}`);
    return { task, context, agent: this.name };
  }

  describe(): string {
    return `${this.name} (${this.role}): ${this.goal}`;
  }
}
