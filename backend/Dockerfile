# syntax=docker/dockerfile:1

# Backend image for the npm-workspaces monorepo. Build context is the REPO ROOT:
#   docker build -f backend/Dockerfile -t sharons-kitchen-backend .

# ---------- base ----------
FROM node:22-slim AS base
# Prisma needs OpenSSL on the slim image.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---------- production dependencies (backend workspace only) ----------
FROM base AS prod-deps
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci --omit=dev --workspace=@sharons-kitchen/backend --include-workspace-root

# ---------- build ----------
FROM base AS build
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci
COPY shared ./shared
COPY backend ./backend
RUN npm run build --workspace=@sharons-kitchen/shared \
  && npx prisma generate --schema backend/prisma/schema.prisma \
  && npm run build --workspace=@sharons-kitchen/backend

# ---------- runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
RUN useradd --system --uid 1001 --create-home app

# production node_modules, then the Prisma client generated during the build
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

# workspace manifests + compiled output
COPY package.json ./
COPY shared/package.json ./shared/
COPY --from=build /app/shared/dist ./shared/dist
COPY backend/package.json ./backend/
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/prisma ./backend/prisma

USER app
WORKDIR /app/backend
EXPOSE 3000

# Apply migrations, then start. For multi-instance deploys move the migrate
# step to a platform pre-deploy hook so instances don't race.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
