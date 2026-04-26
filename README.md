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

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Chakra UI (RTL), React Hook Form + Zod, TanStack Query, React Router |
| Backend | Node.js, Express, TypeScript, Zod validation middleware, Prisma ORM |
| Database | PostgreSQL (Docker locally, Render Postgres in production) |
| Shared | Zod schemas and TypeScript types shared between frontend and backend via npm workspace |
| Hosting | Render (frontend as Static Site, backend as Web Service, Render Postgres) |

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

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Health check | http://localhost:3000/api/health |
| Postgres | localhost:5433 |

---

## Deployment (Render)

Three separate Render services:

| Service | Type | Notes |
|---|---|---|
| `sharons-kitchen-db` | PostgreSQL | Internal connection string used by backend |
| `sharons-kitchen-backend` | Web Service | Build: `npm install && npm run build:shared && cd backend && npx prisma generate && cd .. && npm run build --workspace=backend` · Start: `cd backend && npx prisma migrate deploy && node dist/server.js` |
| `sharons-kitchen-frontend` | Static Site | Build: `npm install && npm run build:shared && npm run build --workspace=frontend` · Publish: `frontend/dist` |

**Environment variables required:**
- Backend: `DATABASE_URL`, `FRONTEND_URL`, `NODE_ENV=production`, `NPM_CONFIG_PRODUCTION=false`
- Frontend: `VITE_API_URL`, `NPM_CONFIG_PRODUCTION=false`

Every `git push` to `main` triggers an automatic redeploy of both services.

---

## Documentation

All docs are in `/docs`:
- `docs/spec.md` — project specification
- `docs/api.md` — API contract + examples
- `docs/databaseSchema.md` — Postgres table layout
- `docs/dataModels.md` — shared TypeScript models
- `docs/ARCHITECTURE.md` — folder structure and conventions

---

## Next Steps

- [ ] **Login & authentication** — protect the admin area with a login page (email + password or social login)
- [ ] **Sign up page** — allow new admin accounts to be created
- [ ] **Customers area** — a separate customer-facing section for browsing the menu
- [ ] **New dish ideas page** — AI-assisted page for generating creative new dish ideas based on existing inventory
- [ ] **Sales management** — add and track individual sales, view sales history
- [ ] **Analytics dashboard** — weekly revenue, best-selling dishes, stock trend charts
- [ ] **Stock change history** — audit log of every stock adjustment
