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
cd backend && npx prisma migrate dev --name init

# 5. Start frontend + backend together
npm run dev
```

| Service      | URL                              |
| ------------ | -------------------------------- |
| Frontend     | http://localhost:5173            |
| Backend API  | http://localhost:3000/api        |
| Health check | http://localhost:3000/api/health |
| Postgres     | localhost:5433                   |

---

## Deployment (Render)

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

- Backend: `DATABASE_URL`, `FRONTEND_URL`, `API_ACCESS_TOKEN`, `NODE_ENV=production`
- Frontend: `VITE_API_URL`, `NPM_CONFIG_PRODUCTION=false`

The backend image sets `NODE_ENV=production` and installs only production
dependencies, so the old `NPM_CONFIG_PRODUCTION=false` workaround is no longer
needed for it. The `prisma` CLI is a runtime dependency (used by
`migrate deploy`). For a multi-instance deploy, move the migrate step to a
Render pre-deploy command so instances don't race.

The backend validates its environment on startup and exits with a clear message
if `DATABASE_URL`, `FRONTEND_URL`, or `API_ACCESS_TOKEN` is missing/invalid in
production. `FRONTEND_URL` must be the exact browser origin (scheme + host, no
trailing slash). Generate `API_ACCESS_TOKEN` with e.g. `openssl rand -base64 32`.

Every `git push` to `main` triggers an automatic redeploy of both services.

---

## Authentication (interim)

The admin API is gated by a **single shared password**, not per-user accounts
yet. The operator enters it once on the login screen; the frontend stores it in
`localStorage` and sends it as `Authorization: Bearer <token>` on every request.
The backend compares it (constant-time) against `API_ACCESS_TOKEN`.

- The password is **never** in the built frontend bundle — only in the backend
  environment and each authorized browser.
- `/api/health` stays open; everything else under `/api` requires the token.
- In development, if `API_ACCESS_TOKEN` is unset the API runs unauthenticated
  with a startup warning.

This is a stopgap. Real per-user accounts with httpOnly-cookie sessions are on
the Next Steps list below.

---

## Next Steps

- [x] **Login gate (interim)** — shared-password bearer credential on the whole API (see "Authentication" above)
- [ ] **Real authentication** — per-user accounts, hashed passwords, httpOnly-cookie sessions, logout
- [ ] **Sign up page** — allow new admin accounts to be created
- [ ] **Customers area** — a separate customer-facing section for browsing the menu
- [ ] **New dish ideas page** — AI-assisted page for generating creative new dish ideas based on existing inventory
- [ ] **Sales management** — add and track individual sales, view sales history
- [ ] **Analytics dashboard** — weekly revenue, best-selling dishes, stock trend charts
- [ ] **Stock change history** — audit log of every stock adjustment
