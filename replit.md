# SubSense - Agentic AI for Subscription Protection

## Overview

SubSense is a FinTech web application that simulates a Paytm/GPay-style payment dashboard with wallet transactions and auto-pay subscriptions. The core differentiator is an Agentic AI system that autonomously protects users from silent financial loss by detecting:

- Silent subscription price increases (>15% threshold)
- Unused or forgotten subscriptions (30/60/90 day inactivity)
- Upcoming annual renewals
- Duplicate/overlapping subscriptions
- Offline memberships (gym, classes)

The AI operates using an agentic loop (Observe → Reason → Decide → Act) while ensuring user approval before any action.

## Recent Changes

- **January 2026**: SQLite Database + LangGraph + CrewAI-Style Upgrade:
  - Migrated from in-memory storage to SQLite database with Drizzle ORM
  - Integrated LangGraph (@langchain/langgraph) for state machine orchestration
  - Added CrewAI-inspired multi-agent framework for team-based orchestration
  - Database persistence for subscriptions, transactions, alerts, audit logs
  - Human-in-the-loop safety with full audit trail in database
  - 10 subscriptions including Fitness First gym membership
  - Professional FinTech design with blue primary color, Inter font

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **State Management**: TanStack React Query for server state
- **Charts**: Recharts for data visualization
- **Theme**: Light/dark mode support with CSS variables
- **Icons**: Lucide React for UI icons, react-icons/si for brand logos

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints under `/api/*`
- **Build Tool**: esbuild for server bundling, Vite for client
- **Validation**: Zod schemas for request body validation

### Data Storage
- **Database**: SQLite with better-sqlite3 driver
- **ORM**: Drizzle ORM with SQLite dialect
- **Schema Location**: `server/db/schema.ts` (Drizzle schema) + `shared/schema.ts` (Zod types)
- **Storage Layer**: `server/sqliteStorage.ts` implementing `IStorage` interface
- **Audit Trail**: Persisted to `audit_logs` table with all user actions and AI recommendations

### Agentic AI System

The AI system supports two orchestration modes:

#### LangGraph Orchestration (Primary)
Uses LangGraph state machine for deterministic agent pipeline:

**AI Stack:**
- @langchain/langgraph for state graph orchestration
- @langchain/core for LLM abstractions
- @langchain/openai for OpenAI integration (optional, falls back to templates)

**State Machine Flow:**
```
START → fetchData → monitoring → anomalyDetection → [conditional]
                                                     ├── riskPrediction → reasoning → action → END
                                                     └── END (if no anomalies)
```

**Graph Nodes:**
1. `fetchData`: Load subscriptions and transactions from SQLite
2. `monitoring`: Observe patterns (price changes, unused, renewals)
3. `anomalyDetection`: Detect anomalies with conditional routing
4. `riskPrediction`: Calculate financial impact and severity
5. `reasoning`: Generate natural language explanations
6. `action`: Create alerts and recommendations

#### CrewAI-Style Orchestration (Alternative)
Team-based multi-agent framework inspired by CrewAI:

**Crew Members:**
1. **Monitoring Specialist**: Observes subscription activity
2. **Anomaly Detective**: Finds hidden patterns
3. **Risk Assessor**: Quantifies financial risk
4. **Explanation Expert**: Generates human-readable explanations
5. **Action Advisor**: Recommends protective actions

**Task Pipeline:**
- Tasks executed sequentially with context passing
- Each agent receives output from previous agents
- Final output contains all recommendations

**Human-in-the-Loop Safety:**
- AI only recommends, never auto-executes
- All actions require user approval via UI
- Full audit trail in SQLite database

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui base components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── wallet-card.tsx
│   │   │   ├── stats-cards.tsx
│   │   │   ├── subscription-list.tsx
│   │   │   ├── transaction-list.tsx
│   │   │   ├── alert-list.tsx
│   │   │   ├── spending-chart.tsx
│   │   │   └── agent-status.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── dashboard.tsx
│   │   │   ├── subscriptions.tsx
│   │   │   ├── transactions.tsx
│   │   │   ├── alerts.tsx
│   │   │   └── agents.tsx
│   │   ├── lib/             # Utilities
│   │   │   ├── queryClient.ts
│   │   │   └── merchant-icons.tsx
│   │   └── App.tsx          # Root with routing and providers
│   └── index.html           # Entry point with SEO meta tags
├── server/
│   ├── ai/                  # Agentic AI Layer
│   │   ├── agents/          # Individual agent implementations
│   │   │   ├── monitoringAgent.ts
│   │   │   ├── anomalyAgent.ts
│   │   │   ├── riskAgent.ts
│   │   │   ├── reasoningAgent.ts
│   │   │   └── actionAgent.ts
│   │   ├── crew/            # CrewAI-style framework
│   │   │   ├── types.ts     # Crew/Agent/Task types
│   │   │   ├── agent.ts     # Base CrewAgent class
│   │   │   ├── crew.ts      # Crew orchestrator
│   │   │   ├── subscriptionCrew.ts  # Subscription protection crew
│   │   │   └── index.ts     # Exports
│   │   ├── graph/           # LangGraph orchestration
│   │   │   ├── langgraphOrchestrator.ts  # State machine pipeline
│   │   │   └── orchestrator.ts           # Legacy orchestrator
│   │   ├── tools/           # LangChain tools
│   │   │   └── subscriptionTools.ts
│   │   └── runner.ts        # Pipeline entry point (uses LangGraph)
│   ├── db/                  # Database layer
│   │   ├── schema.ts        # Drizzle ORM schema
│   │   ├── init.ts          # Database initialization and seeding
│   │   └── index.ts         # Database connection
│   ├── routes.ts            # API endpoints with Zod validation
│   ├── storage.ts           # IStorage interface + MemStorage
│   ├── sqliteStorage.ts     # SQLite implementation of IStorage
│   └── index.ts             # Express server entry
├── shared/
│   └── schema.ts            # Data models and Zod schemas
└── subsense.db              # SQLite database file
```

## Database Schema

**Tables:**
- `subscriptions`: 10 subscriptions with merchant, amount, billing cycle, status
- `transactions`: Auto-pay transactions with merchant, amount, date
- `alerts`: AI-generated alerts with type, severity, financial impact
- `audit_logs`: User actions and AI recommendations
- `wallet`: User wallet balance
- `agent_statuses`: Status of each AI agent

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/summary` | GET | Dashboard stats, wallet, alerts count |
| `/api/wallet` | GET | Wallet balance and currency |
| `/api/subscriptions` | GET | All subscriptions |
| `/api/subscriptions/:id` | PATCH | Update subscription (cancel/pause/resume) |
| `/api/transactions` | GET | Transaction history |
| `/api/alerts` | GET | AI-generated alerts |
| `/api/alerts/:id/resolve` | POST | Resolve alert (cancel/keep) |
| `/api/alerts/:id/dismiss` | POST | Dismiss alert |
| `/api/agents/status` | GET | AI agent statuses |
| `/api/agents/run` | POST | Manually trigger AI pipeline |
| `/api/simulate/autopay` | POST | Simulate auto-pay transaction |
| `/api/analytics/monthly-trend` | GET | Monthly spending data |

## External Dependencies

### AI/ML
- **LangGraph**: @langchain/langgraph for state machine orchestration
- **LangChain**: @langchain/core, @langchain/openai for LLM interface
- **OpenAI API**: Optional for dynamic reasoning (falls back to templates)

### Database
- **SQLite**: better-sqlite3 for local persistence
- **Drizzle ORM**: Type-safe ORM with SQLite dialect
- **uuid**: For generating unique IDs

### UI Component Libraries
- **Radix UI**: Headless accessible components
- **shadcn/ui**: Pre-styled component collection
- **Lucide React**: UI icon library
- **react-icons/si**: Brand logo icons

### Build & Development
- **Vite**: Frontend dev server and bundler
- **esbuild**: Server bundling

## Running the Application

The application runs on port 5000 with the command `npm run dev`. The Express server serves both the API and the Vite-bundled frontend.

Database is automatically initialized and seeded on first run.

## Demo Features

- **Simulate Auto-Pay**: Click the button on the dashboard to trigger a random auto-pay transaction with 30% chance of price increase. Watch terminal for LangGraph pipeline logs.
- **Terminal Logging**: All agent activity is logged to terminal for hackathon demo visibility.
- **Alert Resolution**: On the AI Alerts page, expand alerts to see AI explanations and take actions (Cancel Auto-Pay, Keep, or Dismiss).
- **Human-in-the-Loop**: All actions require explicit user approval - AI never auto-executes.
- **Theme Toggle**: Switch between light and dark mode.
- **Database Persistence**: All data persists across server restarts in SQLite.

## One-Line Tech Summary

"SubSense uses React and Tailwind for UI, Express with SQLite persistence for backend, and a real Agentic AI layer built with LangGraph + CrewAI-style orchestration—ensuring explainable, user-controlled financial protection."
