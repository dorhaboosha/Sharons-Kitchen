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

## Getting Started (Local) — Planned
Local setup scripts are **planned but not implemented yet**:
- `backend/prisma/seed.ts` — seed mock data
- `setup.js` — bootstrap script
- `docker-compose.yml` — local Postgres (optional)

Until then, setup instructions will be added later.

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
