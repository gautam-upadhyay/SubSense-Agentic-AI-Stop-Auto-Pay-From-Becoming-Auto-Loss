# SubSense - Agentic AI for Subscription Protection

## Overview

SubSense is a FinTech web application that simulates a Paytm/GPay-style payment dashboard with wallet transactions and auto-pay subscriptions. The core differentiator is an Agentic AI system that autonomously protects users from silent financial loss by detecting:

- Silent subscription price increases
- Unused or forgotten subscriptions
- Recurring long-term financial leakage

The AI operates using an agentic loop (Observe → Reason → Decide → Act) while ensuring user approval before any action.

## Recent Changes

- **January 2026**: Complete MVP implementation with:
  - Professional FinTech design with blue primary color, Inter font
  - 5 pages: Dashboard, Subscriptions, Transactions, AI Alerts, AI Agents
  - 6 AI agents with real-time status monitoring
  - Simulate Auto-Pay button for demonstration
  - Light/dark theme toggle
  - Full Zod validation on all write endpoints
  - Open Graph meta tags for SEO
  - react-icons/si for brand logos (Netflix, Spotify, etc.)

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
- **Session Store**: connect-pg-simple for PostgreSQL sessions

### Agentic AI System
The AI uses deterministic, rule-based logic with multiple specialized agents:

1. **Monitoring Agent**: Observes transactions and builds subscription memory
2. **Anomaly Detection Agent**: Detects price increases >15%, trial-to-paid transitions
3. **Usage Analysis Agent**: Analyzes service usage and detects unused subscriptions (30+ days)
4. **Risk Prediction Agent**: Estimates financial loss and assigns risk levels (high/medium/low)
5. **Reasoning Agent**: Explains changes and financial impact with natural language
6. **Action Recommendation Agent**: Suggests actions requiring user approval

### Key Design Patterns
- **Shared Schema**: TypeScript types shared between client and server via `@shared/*` alias
- **Path Aliases**: `@/*` for client source, `@shared/*` for shared code
- **API Client**: Centralized fetch wrapper with React Query integration
- **Component Architecture**: Presentational components with data fetching at page level
- **Merchant Icons**: Centralized icon mapping in `client/src/lib/merchant-icons.tsx`

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
| `/api/simulate/autopay` | POST | Simulate auto-pay transaction |
| `/api/analytics/monthly-trend` | GET | Monthly spending data |

## External Dependencies

### Database
- **PostgreSQL**: Required for production (DATABASE_URL environment variable)
- **Drizzle Kit**: Database migrations via `db:push` command

### UI Component Libraries
- **Radix UI**: Headless accessible components (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-styled component collection
- **Lucide React**: UI icon library
- **react-icons/si**: Brand logo icons (Netflix, Spotify, etc.)

### Build & Development
- **Vite**: Frontend dev server and bundler
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Tailwind class deduplication

## Running the Application

The application runs on port 5000 with the command `npm run dev`. The Express server serves both the API and the Vite-bundled frontend.

## Demo Features

- **Simulate Auto-Pay**: Click the button on the dashboard to trigger a random auto-pay transaction with 30% chance of price increase. The AI agents will analyze and generate alerts.
- **Alert Resolution**: On the AI Alerts page, expand alerts to see AI explanations and take actions (Cancel Auto-Pay, Keep, or Dismiss).
- **Theme Toggle**: Switch between light and dark mode using the toggle in the header.
