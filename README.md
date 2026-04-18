# Inventory Management Web App (MVP)

A Hebrew-first (RTL) inventory management web app for a ready-food business.

---

## What this project does (MVP)
- Manage dishes (inventory items)
- Add/edit dish details (name, price, stock, etc.)
- Soft delete and restore dishes
- Adjust stock safely using add/subtract (cannot go below 0)
- Search + filter + sort inventory list
- Visual stock indicator (green/orange/red)

MVP focuses on **Inventory only** (no login, no sales/orders yet).

---

## Tech Stack
- Frontend: React + TypeScript (Vite), Chakra UI (RTL), React Hook Form + Zod, React Router, TanStack Query
- Backend: Express + TypeScript, Zod, Prisma
- DB: PostgreSQL (Render Postgres)
- Hosting: Render (frontend + backend)

---

## Documentation
All docs are in `/docs`:
- `docs/spec.md` — project specification
- `docs/api.md` — API contract + examples
- `docs/databaseSchema.md` — Postgres table layout
- `docs/dataModels.md` — shared TS models
- `docs/ARCHITECTURE.md` — folder structure and conventions

---

## Getting Started (Local)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be installed and running.

```bash
# 1. Start local Postgres
docker compose up -d

# 2. Copy env file (DATABASE_URL is pre-filled for Docker)
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Run database migrations
npm run --workspace=backend prisma migrate dev

# 5. Start frontend + backend together
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Postgres | localhost:5432 |

---

## Deployment (Planned)
- Render Postgres hosts PostgreSQL
- Render hosts frontend and backend
- CI/CD workflow planned (GitHub Actions)

---

## Future Ideas (Post-MVP)
- Weekly sales/orders management
- Statistics (weekly revenue, best seller)
- Threshold settings per dish
- Stock change history/audit log
