# Birthday Reminder Service

A NestJS backend that manages users and automatically sends "Happy Birthday" messages at **9 AM in each user's local timezone** on their birthday.

## Tech Stack

| Layer            | Technology              |
| ---------------- | ----------------------- |
| Runtime          | Node.js 22, TypeScript  |
| Framework        | NestJS + Fastify        |
| Database         | MongoDB + Mongoose      |
| Scheduler        | Agenda (MongoDB-backed) |
| Timezone math    | Luxon                   |
| Validation       | class-validator + Zod   |
| Logging          | Pino (nestjs-pino)      |
| Testing          | Jest                    |
| Containerization | Docker + docker-compose |

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- [Node.js 22+](https://nodejs.org/) _(local dev only)_
- [pnpm](https://pnpm.io/installation) _(local dev only)_

---

## Running with Docker (Production)

This is the recommended way to run the full stack.

### 1. Clone the repo and enter the service directory

```bash
cd birthday-service
```

### 2. Start MongoDB + the app server

```bash
docker compose --profile production up -d --build
```

The API will be available at `http://localhost:3002/api`.
Swagger UI: `http://localhost:3002/documentation`

To stop:

```bash
docker compose --profile production down
```

> MongoDB data is persisted in a named Docker volume (`mongo_data`).

---

## Local Development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start MongoDB only

```bash
docker compose up -d
```

### 3. Copy and fill environment variables

```bash
cp .env.example .env
# Edit .env — defaults are already set for local development
```

### 4. Start the dev server (hot reload on port 3002)

```bash
pnpm run start:dev
```

### Environment Variables

| Variable             | Description                    | Default                                      |
| -------------------- | ------------------------------ | -------------------------------------------- |
| `NODE_ENV`           | `development` / `production`   | `development`                                |
| `SERVICE_NAME`       | Application name shown in logs | `Birthday Reminder`                          |
| `HOST`               | Bind address                   | `localhost`                                  |
| `PORT`               | HTTP port                      | `3002`                                       |
| `WHITELIST`          | Comma-separated CORS origins   | `http://localhost:3002`                      |
| `MONGODB_URI`        | MongoDB connection string      | `mongodb://localhost:27017/birthday_service` |
| `AGENDA_COLLECTION`    | Agenda jobs collection name              | `agendaJobs`                                 |
| `AGENDA_CONCURRENCY`   | Max concurrent Agenda jobs               | `5`                                          |
| `AGENDA_PROCESS_EVERY` | How often Agenda polls for due jobs      | `30 seconds`                                 |

---

## API Reference

All endpoints are prefixed with `/api`. Swagger UI at `/documentation`.

### Create a User

```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "birthday": "1990-04-21",
  "timezone": "Asia/Jakarta"
}
```

Response `201`:

```json
{
  "data": {
    "id": "6629f1a2b3c4d5e6f7a8b9c0",
    "name": "John Doe",
    "email": "john@example.com",
    "birthday": "1990-04-21T00:00:00.000Z",
    "timezone": "Asia/Jakarta",
    "createdAt": "2025-04-21T12:00:00.000Z",
    "updatedAt": "2025-04-21T12:00:00.000Z"
  },
  "statusCode": 201,
  "timestamp": "2025-04-21T12:00:00.000Z"
}
```

### Get All Users

```bash
GET /api/users
```

### Get a User by ID

```bash
GET /api/users/:id
```

### Update a User

```bash
PATCH /api/users/:id
Content-Type: application/json

{
  "timezone": "America/New_York"
}
```

Updating `birthday` or `timezone` automatically reschedules the birthday job.

### Delete a User

```bash
DELETE /api/users/:id
```

Deleting a user also cancels their pending birthday job.

### Health Check

```bash
GET /api/health
```

---

## Running Tests

### Unit tests

```bash
pnpm run test
```

### Watch mode

```bash
pnpm run test:watch
```

### Coverage report

```bash
pnpm run test:cov
```

### Coverage Summary

| Metric     | Coverage |
| ---------- | -------- |
| Statements | 100%     |
| Functions  | 100%     |
| Lines      | 100%     |
| Branches   | 80.9%    |

56 tests across 13 suites — all passing.

---

## Design Decisions & Assumptions

### Scheduler: Agenda over cron polling

Rather than scanning all users on a tight polling interval (e.g. every minute), the service schedules one Agenda job **per user** at the exact fire time: 9 AM in their local timezone on their birthday. This means:

- Zero wasted DB reads between birthdays
- Scales to millions of users — only the jobs due now are touched
- Jobs are persisted in MongoDB, so they survive restarts

On create, the next birthday 9 AM is computed and a job is upserted via `job.unique()` (MongoDB `findOneAndUpdate`) — safe under concurrent requests. On update or delete, the job is cancelled and recreated (or simply cancelled).

After firing, the job **reschedules itself** for the following year without a DB lookup — all necessary data is stored in the job payload (`birthday`, `timezone`).

### Timezone math: Luxon

`computeNextBirthday9AM` builds the candidate date in the user's local zone, then advances by one year if the time has already passed. Luxon handles leap-day birthdays (Feb 29) on non-leap years by landing on Feb 28.

### Email simulation

The assignment permits console-log as the "Happy Birthday" message. `EmailService.sendBirthdayGreeting` logs the message via Pino — it is designed so a real provider (SendGrid, SES, Resend etc.) can be wired in without changing any calling code.

### Partial updates use `$set`

Mongoose 7+ treats a plain object passed to `findOneAndUpdate` as a full replacement. All PATCH operations explicitly wrap the update in `{ $set: { ... } }` to avoid accidental field removal.

### Birthday stored as `Date`, received as ISO 8601 string

The API accepts `birthday` as an ISO 8601 date string (`YYYY-MM-DD`), validates it with `@IsISO8601({ strict: true })`, and stores it as a `Date` in MongoDB. The job payload serialises it back to an ISO string so the job can reschedule without a DB lookup.

### Email uniqueness

`email` is stored lowercase and has a unique index. Duplicate email registration returns a `409 Conflict` via the global exception filter.

---

## Known Limitations

### Polling delay
Agenda works by polling MongoDB on a fixed interval (`AGENDA_PROCESS_EVERY`). With the default of **30 seconds**, a birthday greeting can fire up to 30 seconds after 9 AM. For a daily event this is acceptable, but it is not a true real-time trigger.

### Worker is co-located with the REST API
`BirthdayService` starts the Agenda worker inside the same NestJS process as the HTTP server. Scaling API replicas horizontally means every pod also runs a worker and polls MongoDB. Agenda's MongoDB locking prevents double-sends, but the redundant workers waste resources and add unnecessary load on the database.

### No retry on email failure
If `EmailService.sendBirthdayGreeting` throws, the error is logged and the job still completes — it reschedules itself for next year. A failed send this year is silently lost.

### No same-day backfill
If a user is created after 9 AM on their own birthday, `computeNextBirthday9AM` schedules the job for next year. They receive no greeting today. This is an intentional simplification.

---

## Future Improvements

### Separate the worker into its own process
Extract `BirthdayService` into a standalone NestJS worker app (or a separate microservice). The REST API and the worker can then be scaled independently — API pods handle HTTP traffic only, worker pods handle job processing only — with no wasted resources.

### Replace Agenda with a dedicated queue system
Swap the MongoDB-polling scheduler for a push-based queue (e.g. **BullMQ + Redis** or **AWS SQS**). A separate scheduler service computes the 9 AM fire time per user and enqueues a delayed job; worker consumers process it on delivery with no polling overhead. This eliminates the polling delay and decouples scheduling from execution.

### Wire in a real email provider
`EmailService` is designed for easy replacement. Integrating SendGrid, AWS SES, or Resend requires only changes inside `email.service.ts` — no other code changes needed.

### Retry and dead-letter strategy
Use Agenda's built-in failure handling (`job.fail()` + retry options in `.define()`) to retry a failed send up to N times before moving the job to a dead-letter collection for manual inspection.

### Observability
Expose Prometheus metrics (jobs scheduled, fired, failed, processing latency) and add distributed tracing to make the scheduler behaviour visible in production dashboards.
