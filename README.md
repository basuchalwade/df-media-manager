
# ContentCaster Enterprise Monorepo

Production-grade architecture for Social Media Automation.

## 🏗 System Architecture

*   **Services**:
    *   `api-gateway`: REST API + Policy Enforcement Point.
    *   `worker-executor`: Async job processor (Bots, Publishing).
*   **Infrastructure**:
    *   PostgreSQL (Data & Audit).
    *   Redis (Message Broker).

## 🚀 Setup Instructions

### 1. Prerequisites
*   Node.js v18+
*   PostgreSQL running locally (or Docker).
*   Redis running locally (or Docker).

### 2. Installation
```bash
# Install dependencies for all workspaces
npm install
```

### 3. Database Setup
```bash
# Create .env from example
cp .env.example .env

# Push Schema to DB
npm run db:push

# (Optional) Seed Initial Data
npm run db:seed
```

### 4. Running Services (Terminal 1)
Start the Backend Gateway and Worker:
```bash
npm run start:all
```
*   Gateway: http://localhost:3000
*   Worker: (Background Process)

### 5. Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
*   Dashboard: http://localhost:5173

## 🔒 Security Notes
*   **Policy Gateway**: All API requests pass through `src/middleware/policy.middleware.ts`.
*   **Audit Logs**: Every bot action is recorded in `DecisionAudit` table.
*   **Secrets**: Platform OAuth tokens are encrypted at rest (implement encryption util in `packages/auth-utils`).
