# המטבחון של שרון — Kitchen Inventory Management

A Hebrew-first (RTL) inventory management web app for a ready-food business, built as a full-stack monorepo.

---

## What the app does

### Inventory Management

- Add, edit, and soft-delete dishes (with restore support)
- Adjust stock safely via add/subtract (cannot go below 0)
- Search, filter (active / inactive / all), and sort inventory (by name, quantity, or price)
- Color-coded stock status rows: green (in stock), orange (low stock 1–5), red (out of stock), gray (inactive)
- Stock legend bar explaining each color
- Backend guards: inactive dishes cannot be edited or have their stock adjusted

### UI & UX

- Branded theme derived from the store logo (powder blue + dark chocolate brown)
- Full-page background image with white overlay
- Heebo font, RTL layout throughout
- Store logo as favicon
- Responsive design — works on mobile and desktop
- All modals and dialogs styled consistently with the brand theme

---

## Tech Stack

| Layer    | Technology                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------ |
| Frontend | React 18, TypeScript, Vite, Chakra UI (RTL), React Hook Form + Zod, TanStack Query, React Router |
| Backend  | Node.js, Express, TypeScript, Zod validation middleware, Prisma ORM                              |
| Database | PostgreSQL (Docker locally, Render Postgres in production)                                       |
| Shared   | Zod schemas and TypeScript types shared between frontend and backend via npm workspace           |
| Hosting  | Render (frontend as Static Site, backend as Web Service, Render Postgres)                        |

---

## Monorepo Structure

```
sharons-kitchen/
├── frontend/        React + Vite app
├── backend/         Express API server
├── shared/          Shared Zod schemas and TypeScript types
├── docs/            Project documentation
└── openspec/        Feature proposals and task tracking
```

---

## Getting Started (Local)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be installed and running.

```bash
# 1. Start local Postgres (runs on port 5433)
docker compose up -d

# 2. Copy env file
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Run database migrations
cd backend && npx prisma migrate dev

# 5. Create the first operator account (interactive prompt)
npm run create-user

# 6. Start frontend + backend together
cd .. && npm run dev
```

| Service      | URL                              |
| ------------ | -------------------------------- |
| Frontend     | http://localhost:5173            |
| Backend API  | http://localhost:3000/api        |
| Health check | http://localhost:3000/api/health |
| Postgres     | localhost:5433                   |

---

## Deployment (Render)

Day-to-day operations — deploys, migrations, backups & restore, accounts,
monitoring, incident playbook — are in [`docs/OPERATIONS.md`](docs/OPERATIONS.md).

Three separate Render services:

| Service                    | Type                 | Notes                                                                                                           |
| -------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `sharons-kitchen-db`       | PostgreSQL           | Internal connection string used by backend                                                                      |
| `sharons-kitchen-backend`  | Web Service (Docker) | Dockerfile: `backend/Dockerfile`, build context: repo root. The image runs `prisma migrate deploy` then starts. |
| `sharons-kitchen-frontend` | Static Site          | Build: `npm install && npm run build:shared && npm run build --workspace=frontend` · Publish: `frontend/dist`   |

Build the backend image locally with:

```bash
docker build -f backend/Dockerfile -t sharons-kitchen-backend .
```

**Environment variables required:**

- Backend: `DATABASE_URL`, `FRONTEND_URL`, `NODE_ENV=production`
- Frontend: `VITE_API_URL`, `NPM_CONFIG_PRODUCTION=false`

There is no API token to set — authentication is per-user (see below). The
backend image sets `NODE_ENV=production` and installs only production
dependencies, so the old `NPM_CONFIG_PRODUCTION=false` workaround is no longer
needed for it. The `prisma` CLI is a runtime dependency (used by
`migrate deploy`). For a multi-instance deploy, move the migrate step to a
Render pre-deploy command so instances don't race.

The backend validates its environment on startup and exits with a clear message
if `DATABASE_URL` or `FRONTEND_URL` is missing/invalid in production.
`FRONTEND_URL` must be the exact browser origin (scheme + host, no trailing
slash).

Create operator accounts against the production database with the shell of the
backend service (or locally with its `DATABASE_URL`):

```bash
node dist/scripts/createUser.js
# or non-interactively:
CREATE_USER_EMAIL=you@example.com CREATE_USER_NAME="Your Name" \
  CREATE_USER_PASSWORD='a-long-password' node dist/scripts/createUser.js
```

Every `git push` to `main` triggers an automatic redeploy of both services.

---

## Authentication

Per-user accounts with server-side sessions.

- **Accounts** live in the `users` table. Passwords are stored only as an
  argon2id hash. There is no public sign-up — create accounts with
  `npm run create-user` (locally) or `node dist/scripts/createUser.js` (in the
  deployed backend's shell). Set a user's `is_active` to `false` to disable it.
- **Login** — `POST /api/auth/login` with `{ email, password }` returns an
  opaque session token. The frontend keeps it in `localStorage` and sends it as
  `Authorization: Bearer <token>`. Only the token's SHA-256 hash is stored in
  the `sessions` table, so a leak of that table cannot be replayed.
- **Sessions** last 30 days, sliding forward at most once a day while in use.
  `POST /api/auth/logout` deletes the row — a real, immediate revocation.
  Deleting a user's rows in `sessions` logs them out everywhere.
- `/api/health` stays open; every other `/api` route requires a valid session.
  `POST /api/auth/login` has its own tighter rate limit.

Transport is a bearer token (not a cookie) so the two-origin Render setup — a
static site and a separate API service — needs no shared parent domain or CSRF
handling. Moving to httpOnly-cookie sessions is worthwhile once the app is
served from a single registrable domain.

---

## Next Steps

- [x] **Login gate (interim)** — shared-password bearer credential on the whole API
- [x] **Real authentication** — per-user accounts, argon2id-hashed passwords, revocable server-side sessions, logout (see "Authentication" above)
- [ ] **Sign up page** — self-serve / invite-based account creation (accounts are CLI-only for now)
- [ ] **httpOnly-cookie sessions** — once the app is served from a single registrable domain
- [ ] **Customers area** — a separate customer-facing section for browsing the menu
- [ ] **New dish ideas page** — AI-assisted page for generating creative new dish ideas based on existing inventory
- [ ] **Sales management** — add and track individual sales, view sales history
- [ ] **Analytics dashboard** — weekly revenue, best-selling dishes, stock trend charts
- [ ] **Stock change history** — audit log of every stock adjustment
