# ContentCaster Architecture

## High-Level Overview

**Frontend** (React/Vite) → **Backend API** (Node/Express) → **Queue** (Redis/BullMQ) → **Worker** (Node/Process) → **Platform APIs** (Mock/Real)  
                                      ↓  
                                **PostgreSQL** (Prisma)

## Environments

- **Simulation**: UI runs with `mockStore` service. No backend/DB required. Logic executes in browser memory.
- **Development**: Docker Compose environment. Local `postgres` and `redis` instances. Hot-reloading enabled.
- **Production**: Full microservices deployment. Optimized Docker images. Strict security policies.

## Data Flow

### Post Creation
1.  User submits content via **Creator Studio**.
2.  `api.ts` sends `POST /posts` payload to **Backend API**.
3.  Backend validates payload and saves to **PostgreSQL** with status `Draft` or `Scheduled`.

### Scheduling
1.  If post is `Scheduled`, Backend calculates delay (`scheduledTime - now`).
2.  Backend adds job to `postPublishQueue` via **BullMQ** with computed delay.
3.  Redis stores the delayed job.

### Execution
1.  **Worker** process polls `postPublishQueue`.
2.  When delay expires, Worker picks up the job.
3.  Worker updates Post status to `Processing` in DB.
4.  Worker executes API call to Social Platform (or simulates it).
5.  On success, Worker updates status to `Published`.

### Status Sync
1.  Frontend polls `/posts` endpoint (or uses WebSockets in future).
2.  UI reflects status change from `Scheduled` → `Processing` → `Published`.

## Queue System

### Queues
- **`postPublishQueue`**: High priority. Handles time-sensitive post publishing.
- **`engagementQueue`**: Handled by Engagement Bot. Processes high-volume interactions (likes/replies).
- **`growthQueue`**: Handled by Growth Bot. Rate-limited to prevent bans (follows/unfollows).
- **`finderQueue`**: Background scraping tasks. Low priority.

### Strategy
- **Retry**: Exponential backoff (e.g., 1s, 2s, 4s) up to 3 attempts.
- **DLQ Behavior**: Failed jobs move to Dead Letter Queue for manual inspection/retry via Admin Dashboard.

## Security Model

- **Token Handling**: 
  - Gemini API Key injected via `process.env`.
  - User session tokens (JWT) passed in Authorization header.
  - Platform OAuth tokens stored encrypted in `users` table.
- **Permission Model**: 
  - **Admin**: Full access.
  - **Monitor**: Read-only + Bot Logs.
  - **Viewer**: Read-only Analytics.

## Scaling Strategy

- **Horizontal Workers**: Worker services are stateless. Scale `worker` container count based on queue depth (CPU/Memory metrics).
- **Sharded Queues**: Redis Cluster can be utilized for distributing queues if throughput exceeds single instance limits.

## Failure Scenarios

- **API Failure**: Frontend displays toast error. Request can be retried by user.
- **DB Failure**: API returns 500. Health checks fail, container restarts. Data persists in Volume.
- **Redis Failure**: Job creation fails. API falls back to DB-only save (marked `PendingQueue`). Recovery script enqueues pending items when Redis is up.
- **Worker Crash**: BullMQ atomic locks ensure job is not lost. Job times out and is picked up by another worker instance.
