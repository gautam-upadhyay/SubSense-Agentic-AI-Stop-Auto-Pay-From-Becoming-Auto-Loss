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

- **January 2026**: Major AI upgrade with LangChain integration:
  - Real AI agent framework with LangChain tools
  - 6 specialized agents with orchestrated pipeline
  - Terminal logging for agent activity (hackathon demo-ready)
  - Human-in-the-loop safety with audit trail
  - New use cases: annual renewals, duplicate services, gym memberships
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
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (Zod-based validation)
- **Current Implementation**: In-memory storage (`MemStorage` class) with interface for database swap
- **Audit Trail**: Logging all user actions and AI recommendations

### Agentic AI System (LangChain-Powered)

The AI uses LangChain for LLM interface and tool execution:

**AI Stack:**
- LangChain (@langchain/core, @langchain/openai)
- OpenAI API (optional, falls back to templates)
- Low-temperature prompts for deterministic finance reasoning

**Agent Pipeline (Orchestration Flow):**
```
DB → Monitor → Detect → Predict → Explain → Recommend → User Approval
```

**Agents Implemented:**
1. **Monitoring Agent**: Observes transactions, detects patterns (price changes, unused, renewals)
2. **Anomaly Detection Agent**: Detects price increases >15%, unused 30+ days, duplicates
3. **Risk Prediction Agent**: Calculates financial loss, assigns severity (high/medium/low)
4. **Reasoning Agent**: Generates natural language explanations (LLM or template-based)
5. **Action Recommendation Agent**: Suggests actions, enforces human-in-the-loop

**LangChain Tools:**
- `getSubscriptions`: Fetch all subscriptions from DB
- `getTransactions`: Fetch transaction history
- `calculateLoss`: Calculate monthly/yearly financial impact
- `getSubscriptionById`: Fetch specific subscription

**Human-in-the-Loop Safety:**
- AI only recommends, never auto-executes
- All actions require user approval via UI
- Full audit trail logging in terminal

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
│   │   ├── agents/          # Agent implementations
│   │   │   ├── monitoringAgent.ts
│   │   │   ├── anomalyAgent.ts
│   │   │   ├── riskAgent.ts
│   │   │   ├── reasoningAgent.ts
│   │   │   └── actionAgent.ts
│   │   ├── tools/           # LangChain tools
│   │   │   └── subscriptionTools.ts
│   │   ├── graph/           # Orchestration
│   │   │   └── orchestrator.ts
│   │   └── runner.ts        # Pipeline entry point
│   ├── routes.ts            # API endpoints with Zod validation
│   ├── storage.ts           # In-memory storage with mock data
│   └── index.ts             # Express server entry
└── shared/
    └── schema.ts            # Data models and Zod schemas
```

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
- **LangChain**: @langchain/core, @langchain/openai for LLM interface
- **OpenAI API**: Optional for dynamic reasoning (falls back to templates)

### Database
- **PostgreSQL**: Required for production (DATABASE_URL environment variable)
- **Drizzle Kit**: Database migrations via `db:push` command

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

## Demo Features

- **Simulate Auto-Pay**: Click the button on the dashboard to trigger a random auto-pay transaction with 30% chance of price increase. Watch terminal for AI agent logs.
- **Terminal Logging**: All agent activity is logged to terminal for hackathon demo visibility.
- **Alert Resolution**: On the AI Alerts page, expand alerts to see AI explanations and take actions (Cancel Auto-Pay, Keep, or Dismiss).
- **Human-in-the-Loop**: All actions require explicit user approval - AI never auto-executes.
- **Theme Toggle**: Switch between light and dark mode.

## One-Line Tech Summary

"SubSense uses React and Tailwind for UI, Express with in-memory storage for backend, and a real Agentic AI layer built with LangChain—ensuring explainable, user-controlled financial protection."
