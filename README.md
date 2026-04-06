# Finance Dashboard — Full-Stack Assignment (MERN)

Backend API and minimal React client for a **finance dashboard** with **role-based access control (RBAC)**, **financial records CRUD**, **aggregated dashboard metrics**, **validation**, **tests**, and **OpenAPI (Swagger)** documentation.

This README is written for **reviewers and assessors**: it maps the submission to the assignment expectations, explains where to find each concern in the repo, and documents how to run and verify the system locally.

## Engineering highlights (USP)

These are the main **design and quality** choices we want reviewers to notice first:

| Theme | What we did | Where |
|-------|----------------|--------|
| **Modular backend** | Each domain (`auth`, `users`, `records`, `dashboard`) lives in its own **module** with a consistent pipeline: routes → validation → controller → **policy** → service → repository → model. | `server/src/modules/*/` |
| **RBAC as policies** | Access rules are **centralized** in `*.policy.js` files and enforced through one `authorize()` middleware — not duplicated `if (role === …)` across controllers. | `server/src/modules/*/*.policy.js`, `server/src/middleware/authorize.js` |
| **Automated tests** | **Integration** tests hit the real Express app over HTTP (Supertest) with an isolated MongoDB (**mongodb-memory-server**). **Unit** tests cover policy and dashboard aggregation logic. Together they lock auth, CRUD, permission boundaries, dashboard, and admin user flows. | `server/tests/integration/`, `server/tests/unit/` |
| **Rate limiting** | Two tiers: a **global** limiter on the API plus a **stricter** limiter on **auth** routes (login/register) to reduce abuse and credential-stuffing noise. | `server/src/middleware/rateLimiter.js`, wired in `server/src/app.js` |

**Numbers (defaults in code):** general API **100 requests / 15 minutes** per IP; auth endpoints **10 requests / 15 minutes** per IP (adjust for production).

---

## Table of contents

1. [Engineering highlights (USP)](#engineering-highlights-usp)
2. [How to review this submission](#how-to-review-this-submission)
3. [Assignment alignment](#assignment-alignment)
4. [Tech stack](#tech-stack)
5. [Prerequisites](#prerequisites)
6. [Repository layout](#repository-layout)
7. [Setup (step by step)](#setup-step-by-step)
8. [Environment variables](#environment-variables)
9. [Running the application](#running-the-application)
10. [Seeding demo data](#seeding-demo-data)
11. [API documentation](#api-documentation)
12. [Authentication](#authentication)
13. [REST API summary](#rest-api-summary)
14. [Access control (RBAC)](#access-control-rbac)
15. [Data model (high level)](#data-model-high-level)
16. [Backend architecture](#backend-architecture)
17. [Validation and errors](#validation-and-errors)
18. [Testing](#testing)
19. [Design decisions and assumptions](#design-decisions-and-assumptions)
20. [Troubleshooting](#troubleshooting)
21. [Scripts reference](#scripts-reference)

---

## How to review this submission

| What to evaluate | Where to look |
|------------------|---------------|
| API routes and HTTP layer | `server/src/app.js` (mounts), `server/src/modules/*/*.routes.js` |
| RBAC / policies | `server/src/modules/*/*.policy.js`, `server/src/middleware/authorize.js` |
| Business logic | `server/src/modules/*/*.service.js` |
| Persistence / queries | `server/src/modules/*/*.repository.js`, `server/src/modules/*/*.model.js` |
| Input validation | `server/src/modules/*/*.validation.js`, `server/src/middleware/validate.js` |
| Auth (JWT) | `server/src/modules/auth/`, `server/src/middleware/authenticate.js` |
| Dashboard aggregations | `server/src/modules/dashboard/dashboard.service.js` |
| Errors | `server/src/shared/errors/`, `server/src/middleware/errorHandler.js` |
| API docs (OpenAPI) | `server/src/config/swagger.js`, JSDoc on `*.routes.js`, UI at `/api-docs` |
| Integration tests | `server/tests/integration/*.test.js` |
| Unit tests | `server/tests/unit/*.test.js` |
| Seed data | `server/seed/seed.js` |
| Client (dashboard UI) | `client/src/` (pages, components, `api/client.js`) |

**Suggested review order:** README → `server/src/app.js` → one module end-to-end (e.g. `records`: routes → validation → controller → policy → service → repository → model) → `dashboard.service.js` → tests → optional: run locally with seed + Swagger.

---

## Assignment alignment

| Requirement | Implementation |
|-------------|----------------|
| User and role management | Users collection with `role` (`viewer` / `analyst` / `admin`) and `status` (`active` / `inactive`). Admin-only user listing, read, update, deactivate. Registration creates users (default role `viewer` unless your flow sets otherwise via admin). |
| Financial records | Mongoose `Record` model: amount, type (income/expense), category (enum), date, description, audit fields, soft delete. CRUD + list with filters (type, category, date range, sort, pagination). |
| Dashboard summary APIs | Endpoints for totals, category breakdown, monthly trend, recent activity, and a combined overview — implemented with MongoDB aggregation in `dashboard.service.js`. |
| Access control | Enforced in `authorize()` using per-resource policy functions; viewer cannot create/update/delete records; analyst can create and update **own** records; admin full record + user management. |
| Validation and errors | Zod schemas per route; consistent JSON error shape via `AppError` subclasses and `errorHandler`. |
| Persistence | MongoDB via Mongoose (not in-memory). |
| Optional enhancements | JWT auth, pagination, soft delete, rate limiting, integration + unit tests, Swagger UI. |

**Assumption documented:** the assignment text suggests a “viewer” might only see the dashboard; here the **viewer** can **read** financial records and **recent activity**, but cannot create/edit/delete or access **summary** analytics endpoints (see [Access control](#access-control-rbac)). This is stated under [Assumptions](#design-decisions-and-assumptions).

---

## Tech stack

| Layer | Choice |
|-------|--------|
| API | Node.js, Express |
| Database | MongoDB (Mongoose ODM) |
| Validation | Zod |
| Auth | JWT (`jsonwebtoken`), bcrypt password hashing |
| API docs | `swagger-jsdoc` + `swagger-ui-express` |
| Client | React (Vite), Tailwind CSS, Axios |
| Tests | Jest, Supertest, mongodb-memory-server |

---

## Prerequisites

- **Node.js** (LTS recommended)
- **MongoDB** running locally or a reachable **MongoDB URI** (Atlas, etc.)
- **npm** (or compatible client)

---

## Repository layout

```text
zorvyn_backend/
├── README.md                 # This file
├── package.json              # Root scripts: dev, seed, test
├── server/
│   ├── .env.example          # Copy to .env
│   ├── src/
│   │   ├── app.js            # Express app, middleware chain, route mounts, Swagger
│   │   ├── server.js         # Entry: DB connect, listen, shutdown
│   │   ├── config/           # env, logger, swagger, database
│   │   ├── middleware/       # auth, authorize, validate, rate limit, errors
│   │   ├── modules/
│   │   │   ├── auth/         # register, login, me
│   │   │   ├── users/        # admin user management
│   │   │   ├── records/      # financial records CRUD + policies
│   │   │   └── dashboard/    # aggregations
│   │   └── shared/           # errors, constants, asyncHandler
│   ├── tests/
│   │   ├── integration/      # HTTP API tests (Supertest)
│   │   ├── unit/               # Policy / service unit tests
│   │   ├── fixtures/
│   │   ├── setup.js          # In-memory Mongo for tests
│   │   └── env.js
│   ├── seed/seed.js          # Idempotent demo users + records
│   └── docs/api.rest         # Optional REST Client examples
├── client/
│   ├── .env.example
│   └── src/                  # Pages, components, AuthContext, API client
```

---

## Setup (step by step)

1. **Clone** the repository and open the project root.

2. **Install dependencies** (root installs are minimal; server and client have their own `package.json`):

   ```bash
   npm install
   cd server && npm install && cd ../client && npm install && cd ..
   ```

3. **Configure environment:**

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

   Edit `server/.env`: set `MONGODB_URI` to your database and `JWT_SECRET` to a long random string for local dev. Ensure `CORS_ORIGIN` matches your Vite dev server (default `http://localhost:5173`).

4. **Start MongoDB** (if local): e.g. `mongod` or Docker, matching `MONGODB_URI`.

5. **Seed** (optional but recommended for demo login):

   ```bash
   npm run seed
   ```

6. **Run** full stack:

   ```bash
   npm run dev
   ```

---

## Environment variables

### Server (`server/.env`)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `development` / `production` |
| `PORT` | HTTP port (e.g. `5001` if `5000` is in use — e.g. macOS AirPlay) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs — **change for any shared/deployed environment** |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `24h`) |
| `CORS_ORIGIN` | Allowed browser origin for the React app (e.g. `http://localhost:5173`) |

### Client (`client/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Base URL for API calls (e.g. `http://localhost:5001/api/v1`) |

---

## Running the application

| Command | Description |
|---------|-------------|
| `npm run dev` | Runs **server** (nodemon) and **client** (Vite) together |
| `npm run dev:server` | Backend only: `cd server && npm run dev` |
| `npm run dev:client` | Frontend only: `cd client && npm run dev` |

**URLs (defaults):**

| Service | URL |
|---------|-----|
| REST API base | `http://localhost:<PORT>/api/v1` |
| Swagger UI | `http://localhost:<PORT>/api-docs` |
| Health check | `GET http://localhost:<PORT>/health` |
| React app (Vite) | `http://localhost:5173` |

---

## Seeding demo data

```bash
npm run seed
```

Creates **three users** (admin, analyst, viewer) and **sample financial records** for exploration. Credentials are printed in the console (see [Demo credentials](#demo-credentials)).

Re-running seed is safe for the intended idempotent design (see `server/seed/seed.js`).

---

## API documentation

- **Swagger UI:** `http://localhost:<PORT>/api-docs` (same host as the API).
- **OpenAPI** is generated from JSDoc on `server/src/modules/**/*.routes.js` plus `server/src/config/swagger.js`.
- Operations document **request bodies**, **query/path parameters**, and **role access** where applicable.
- **Authorize** in Swagger: obtain a JWT from `POST /api/v1/auth/login`, then use **Bearer** token.

Additional examples: `server/docs/api.rest` (VS Code REST Client or similar).

---

## Authentication

1. `POST /api/v1/auth/register` — create account (password hashed server-side).
2. `POST /api/v1/auth/login` — returns JWT + user payload.
3. Send `Authorization: Bearer <token>` for protected routes.
4. `GET /api/v1/auth/me` — current user (requires token).

---

## REST API summary

Base path: `/api/v1`.

### Auth

| Method | Path | Notes |
|--------|------|--------|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Authenticated |

### Users (admin only)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/users` | Query: pagination, filter by `role`, `status` |
| GET | `/users/:id` | |
| PATCH | `/users/:id` | Update name, role, status |
| DELETE | `/users/:id` | Deactivate user |

### Records

| Method | Path | Notes |
|--------|------|--------|
| POST | `/records` | Create (admin, analyst) |
| GET | `/records` | List + filters: type, category, date range, sort, pagination |
| GET | `/records/:id` | |
| PATCH | `/records/:id` | Admin: any; analyst: own only |
| DELETE | `/records/:id` | Admin only (soft delete) |

### Dashboard

| Method | Path | Notes |
|--------|------|--------|
| GET | `/dashboard/summary` | Totals / net (admin, analyst) |
| GET | `/dashboard/category-breakdown` | Per-category totals |
| GET | `/dashboard/monthly-trend` | Query: `months` |
| GET | `/dashboard/recent-activity` | Query: `limit` (all roles) |
| GET | `/dashboard/overview` | Combined payload (admin, analyst) |

---

## Access control (RBAC)

Policies live next to each module (`*.policy.js`) and are invoked via `authorize(policy, action)`.

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View / list records | Yes | Yes | Yes |
| Create records | No | Yes | Yes |
| Update record | No | Own only | Any |
| Delete records | No | No | Yes |
| Summary dashboard endpoints (`summary`, `category-breakdown`, `monthly-trend`, `overview`) | No | Yes | Yes |
| Recent activity | Yes | Yes | Yes |
| User management | No | No | Yes |

**Implementation detail:** analyst **update** compares the authenticated user to `record.createdBy` (supports populated or raw ObjectId).

---

## Data model (high level)

### User (`User`)

- `email`, `password` (hashed, not returned in JSON by default), `name`
- `role`: `viewer` | `analyst` | `admin`
- `status`: `active` | `inactive`
- `lastLoginAt`, timestamps

### Record (`Record`)

- `amount` (positive number), `type`: income | expense
- `category`: fixed enum (see `server/src/shared/constants.js`)
- `date` (not in the future), `description` (optional)
- `createdBy`, `updatedBy`
- Soft delete: `isDeleted`, `deletedAt`, `deletedBy`

Indexes on common query paths (date, type, category, creator) — see `record.model.js`.

---

## Backend architecture

**Request flow:**

`Route → authenticate (if needed) → validate (Zod) → authorize (policy) → controller → service → repository → model`

**Cross-cutting middleware** (see `server/src/app.js`): security headers (Helmet), CORS, request ID, body parser, logging, general rate limit, auth-specific rate limit on login/register.

---

## Validation and errors

- **Zod** validates `body`, `query`, and `params` per route.
- Central **error handler** returns a stable JSON structure with `code`, `message`, and optional `details` for validation fields.

Example error shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "body.amount", "message": "Number must be greater than 0" }
    ]
  }
}
```

---

## Testing

From repository root:

```bash
npm test
```

Or:

```bash
cd server && npm test
```

**What runs:**

- **Integration tests** — real HTTP calls via Supertest against the Express app; MongoDB via **mongodb-memory-server** (downloads a MongoDB binary on first run; may take a minute).
- **Unit tests** — policy and aggregation logic in isolation.

**Coverage areas:** auth, records CRUD, permission boundaries, dashboard access, user management.

Optional:

```bash
cd server && npm run test:coverage
```

---

## Design decisions and assumptions

- **JWT only** (no refresh token) for simplicity.
- **Roles** stored on the user document as a fixed enum.
- **Soft delete** for records for auditability.
- **Floating-point** amounts acceptable for assignment scope; categories are a **fixed enum** (not free-form tags).
- **User “delete”** is **deactivation** (`status: inactive`), not hard delete.
- **Viewer** may **read** records and **recent activity**; summary/analytics endpoints restricted to analyst/admin — documented as an explicit product assumption.

---

## Troubleshooting

| Issue | Suggestion |
|-------|------------|
| Port already in use | Change `PORT` in `server/.env` and align `VITE_API_URL` in `client/.env`. |
| Mongo connection refused | Ensure MongoDB is running and `MONGODB_URI` is correct. |
| CORS errors from browser | Set `CORS_ORIGIN` to the exact Vite origin (scheme + host + port). |
| `429 Too Many Requests` | Global rate limiter; wait for the window or adjust limits in dev (`server/src/middleware/rateLimiter.js`). |
| Tests timeout on first run | mongodb-memory-server downloads binaries; ensure network access; re-run `npm test`. Hook timeout is set in `server/tests/setup.js`. |

---

## Scripts reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Concurrently start API + Vite client |
| `npm run dev:server` | API only |
| `npm run dev:client` | Client only |
| `npm run seed` | Run database seeder |
| `npm test` | Run server Jest suite |

---

## Demo credentials

After `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `admin123` |
| Analyst | `analyst@example.com` | `analyst123` |
| Viewer | `viewer@example.com` | `viewer123` |

---

## License / usage

This project is submitted for **skills assessment** as described in the assignment brief. Not intended as production software without hardening (secrets, monitoring, backups, etc.).
