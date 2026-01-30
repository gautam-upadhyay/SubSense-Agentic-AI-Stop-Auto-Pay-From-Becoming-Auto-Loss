# Project Overview

This is a full-stack TypeScript project that helps users manage their subscriptions and avoid unwanted charges. It uses a combination of a web frontend, a backend API, and a sophisticated AI agent pipeline to monitor subscriptions, detect anomalies, and recommend actions.

## Main Technologies

*   **Backend:**
    *   **Framework:** Express.js
    *   **Language:** TypeScript
    *   **Runtime:** Node.js with `tsx`
    *   **Database:** `better-sqlite3` with `drizzle-orm`
    *   **AI:** `langchain` with `@langchain/langgraph` and `@langchain/openai`
*   **Frontend:**
    *   **Framework:** React
    *   **Language:** TypeScript
    *   **Build Tool:** Vite
    *   **Styling:** Tailwind CSS with `@radix-ui` components

## Architecture

The project is divided into three main parts:

1.  **`client/`:** A React-based web application that provides the user interface for managing subscriptions, viewing alerts, and interacting with the AI agents.
2.  **`server/`:** An Express.js backend that provides a REST API for the frontend. It also contains the core AI agent pipeline.
3.  **`shared/`:** Contains shared code, such as Zod schemas, that is used by both the client and the server.

The AI pipeline is built using `@langchain/langgraph` and is composed of a series of agents that work together to analyze subscription data and generate recommendations. The pipeline is defined in `server/ai/graph/langgraphOrchestrator.ts` and includes the following steps:

1.  **Data Fetching:** Loads subscriptions and transactions from the database.
2.  **Monitoring:** Observes the data for events like price changes and unused subscriptions.
3.  **Anomaly Detection:** Detects anomalies based on the monitoring results.
4.  **Risk Prediction:** Assesses the risk of detected anomalies.
5.  **Reasoning:** Explains the risks and generates alerts.
6.  **Action:** Recommends actions for the user to take.

# Building and Running

## Prerequisites

*   Node.js
*   npm

## Installation

```bash
npm install
```

## Running the Development Server

To run the development server, which includes both the frontend and backend with hot-reloading, use the following command:

```bash
npm run dev
```

The server will be available at `http://localhost:5001`.

## Building for Production

To build the project for production, use the following command:

```bash
npm run build
```

This will create a `dist` directory with the compiled and bundled code.

## Starting the Production Server

To start the production server, use the following command:

```bash
npm run start
```

# Development Conventions

*   **TypeScript:** The entire project is written in TypeScript.
*   **Linting and Formatting:** The project uses Prettier and ESLint for code formatting and linting. These are likely configured to run on commit or as part of the CI/CD pipeline.
*   **Testing:** There are no explicit test files in the project, but the AI agent pipeline has a simulation mode that can be used for testing and demonstration purposes.
*   **Database Migrations:** Database schema changes are managed using `drizzle-kit`. To push schema changes to the database, use the following command:

    ```bash
    npm run db:push
    ```
