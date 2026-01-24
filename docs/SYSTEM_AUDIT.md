
# ContentCaster System Audit Report

**Date:** October 26, 2023
**Type:** Pre-Production Architecture Review
**Scope:** Frontend (React/Vite), Backend (Node/Express), AI Services, and Data Layer.

---

## 1. EXECUTIVE SUMMARY

The current ContentCaster codebase operates as a **"Thick Client"** application. Approximately 85% of the business logic, including campaign intelligence, bot orchestration simulations, and strategy optimization, currently resides in the frontend memory (`src/services/mockStore.ts`).

While a skeleton backend exists (`backend/src`), it is primarily used for basic CRUD and queuing demonstrations.

**Critical Path to Production:** The primary engineering challenge is porting the sophisticated TypeScript logic from the React frontend into stateless Node.js microservices backed by a relational database (PostgreSQL) and a job queue (Redis/BullMQ).

---

## 2. FEATURE INVENTORY

### A. Campaign Intelligence
*   **Description:** Manages multi-channel campaigns, budget pacing, and attribution.
*   **Current Logic:** `src/services/campaignIntelligence.ts`
*   **State:** In-memory `mockStore.campaigns`.
*   **Production Req:** Needs background cron jobs to recalculate "Burn Rate" and "Pacing" daily based on real ad spend API data.

### B. Bot Automation (The "Swarm")
*   **Description:** Autonomous agents (Creator, Engagement, Finder, Growth) that execute actions based on configuration.
*   **Current Logic:** 
    *   Frontend: `src/services/mockStore.ts` (Simulated `setInterval` loops).
    *   Backend: `backend/src/services/botEngine.ts` (Skeleton logic).
*   **Production Req:** Move all orchestration logic (`OrchestrationPolicy.ts`, `RuleEngine.ts`) to `backend/src/executors/botExecutor.ts`.

### C. AI Content Engine
*   **Description:** Generates posts, variants, and optimizations.
*   **Current Logic:** `src/services/geminiService.ts`.
*   **Security Risk:** Currently calls Google Gemini API directly from the browser (`process.env.API_KEY`).
*   **Production Req:** Create a backend proxy (`POST /api/ai/generate`) to hold API keys securely server-side.

### D. Media Pipeline
*   **Description:** Uploads, analyzes, and generates platform variants (crops/filters).
*   **Current Logic:** `src/services/mediaVariantService.ts` uses Browser Canvas API.
*   **Production Req:** 
    *   **Storage:** S3/MinIO (Already in `docker-compose`).
    *   **Processing:** Move heavy image processing to a backend worker using `sharp` or `ffmpeg` to avoid freezing the user's browser for video tasks.

### E. Governance & Compliance
*   **Description:** "Black Box" recorder for decisions and human-approval workflows.
*   **Current Logic:** `src/services/ai/governance/*` (In-memory `DecisionAuditLog`).
*   **Production Req:** Needs an immutable, append-only database table (`AuditLog`) and a transactional approval API.

### F. Strategy Memory (Learning)
*   **Description:** Long-term memory of what worked (Patterns).
*   **Current Logic:** `src/services/ai/memory/*` (In-memory arrays).
*   **Production Req:** Vector Database (pgvector or Pinecone) to store and retrieve `StrategyPatterns` efficiently.

---

## 3. MOCK VS. REAL MATRIX

| Subsystem | Current Implementation | Status | Production Target |
| :--- | :--- | :--- | :--- |
| **Authentication** | `lib/mockAuth.ts` | 🔴 Mocked | OAuth2 / JWT (Auth0 or Cognito) |
| **Database** | `mockStore.ts` (Arrays) | 🔴 In-Memory | PostgreSQL (Prisma) |
| **File Storage** | Browser Blob URLs | 🟡 Hybrid | AWS S3 / MinIO |
| **Bot Scheduling** | `setInterval` (Browser) | 🔴 Unstable | Redis + BullMQ (Delayed Jobs) |
| **AI Generation** | Client-side SDK call | 🟠 Insecure | Server-side Gateway |
| **Audit Logs** | Array push | 🔴 Volatile | TimescaleDB or Postgres Table |
| **Analytics** | Random Generation | 🔴 Mocked | Aggregation Pipeline (SQL) |

---

## 4. DATA MODEL REQUIREMENTS (Schema Definition)

To replace `mockStore`, the PostgreSQL database must support the following schema (Prisma notation):

### Core
*   **Tenant/Organization:** Support multi-tenancy.
*   **User:** RBAC roles (Admin, Operator, Viewer).
*   **PlatformConnection:** OAuth tokens for X, LinkedIn, etc.

### Campaigns
*   **Campaign:** `id`, `budgetConfig` (JSON), `objective` (Enum), `status`.
*   **CampaignMetric:** Time-series data for spend/impressions.

### Automation
*   **Bot:** `type` (Enum), `config` (JSONB), `state` (JSONB), `enabled`.
*   **BotLog:** `level`, `message`, `botId`, `timestamp`.

### Governance & AI
*   **DecisionAudit:** `source` (Rule/AI), `reasoning`, `snapshot` (JSONB), `approvalStatus`.
*   **StrategyPattern:** `patternSignature` (Hash), `confidenceScore`, `successCount`.
*   **LearningEvent:** `context`, `action`, `outcomeScore`.

### Content
*   **MediaAsset:** `s3Key`, `metadata` (JSONB), `hash`.
*   **Post:** `content`, `variants` (JSONB), `scheduledFor`, `status`, `approvalChain` (JSONB).

---

## 5. SERVICE ARCHITECTURE

The production backend should be split into:

1.  **API Gateway (Node/Express):**
    *   Handles REST requests from React.
    *   Enforces AuthZ/AuthN.
    *   Routes `/ai/*` requests.

2.  **Orchestrator Service (Worker):**
    *   Runs the `OrchestrationPolicy` checks.
    *   Prevents conflicts between bots.
    *   Manages "Quiet Hours" and "Global Stops".

3.  **Execution Workers (BullMQ):**
    *   **`post-worker`**: Publishes content to social APIs.
    *   **`bot-worker`**: Executes bot logic (Like/Follow/Reply).
    *   **`analytics-worker`**: Aggregates data nightly.

4.  **Learning Service (Async):**
    *   Analyzes `Campaign` outcomes.
    *   Updates `StrategyMemory`.

---

## 6. MIGRATION RISKS

### 🔴 High Risk
*   **Bot Logic Porting:** The complex logic in `mockStore.ts` (fatigue detection, asset selection) relies on instant access to the entire state tree. Porting this to stateless DB queries requires careful query optimization to avoid N+1 issues.
*   **Canvas to Server-Side:** Image variants generated in the browser via Canvas might look different when generated by `sharp` on the server. Visual regression testing is needed.

### 🟡 Medium Risk
*   **Governance Integrity:** Ensuring that *every* AI decision is logged transactionally. If the DB write for the log fails, the action must abort.

### 🟢 Low Risk
*   **UI Components:** The React layer is well-decoupled. Switching `api.ts` to point to real endpoints should be transparent to the UI components.

---

## 7. RECOMMENDED ROADMAP

1.  **Foundation (Week 1):** Setup PostgreSQL + Prisma Schema. Implement JWT Auth.
2.  **Asset Layer (Week 2):** Connect S3/MinIO. Build `MediaController` to replace `mockStore` media logic.
3.  **Command & Control (Week 3):** Port `BotConfig` and `GlobalPolicy` to DB. Connect `BotManager` UI to API.
4.  **The Brain (Week 4):** Move `geminiService` to backend. Implement `StrategyMemory` in Postgres.
5.  **The Muscle (Week 5):** Deploy BullMQ workers. Port `orchestrationPolicy.ts` to backend.
6.  **Switchover (Week 6):** Update frontend `api.ts` to use production endpoints. Disable `mockStore`.
