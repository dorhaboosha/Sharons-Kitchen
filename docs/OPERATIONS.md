# Operations Runbook

How this app is deployed and run, and what to do when something needs
attention. Written for a single operator; keep it short and current.

The [README](../README.md) covers local setup and the interface. This file is
about **production**.

---

## 1. System map

Everything runs on [Render](https://dashboard.render.com), configured through the
dashboard (there is no `render.yaml` yet — see §11).

| Service                    | Type                 | What it is                                                              |
| -------------------------- | -------------------- | ----------------------------------------------------------------------- |
| `sharons-kitchen-db`       | PostgreSQL           | The database. Backend connects over the **internal** connection string. |
| `sharons-kitchen-backend`  | Web Service (Docker) | The API. Image built from `backend/Dockerfile`, context = repo root.    |
| `sharons-kitchen-frontend` | Static Site          | The React app. Built from source, served as static files.               |

Request flow: browser → `sharons-kitchen-frontend` (HTML/JS) → `fetch` calls to
`sharons-kitchen-backend` → `sharons-kitchen-db`.

The backend container command is:

```
npx prisma migrate deploy && node dist/server.js
```

so **every backend deploy applies pending database migrations before the new
code starts**.

---

## 2. Environment variables

Set these in each service's **Environment** tab. Changing one triggers a
redeploy of that service.

### Backend (`sharons-kitchen-backend`)

| Variable       | Example                                           | Notes                                                                                                              |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL` | _(from the DB service's "Internal Database URL")_ | Secret. Use the **internal** URL — same region, no egress, faster.                                                 |
| `FRONTEND_URL` | `https://sharons-kitchen-frontend.onrender.com`   | The exact browser origin of the frontend. Scheme + host, no trailing slash, no path. Used for the CORS allow-list. |
| `NODE_ENV`     | `production`                                      | Must be exactly `production`. The app refuses to boot on anything else it doesn't recognise.                       |

The backend **validates these on startup** and exits with a printed list if any
are missing or malformed. If the service is crash-looping right after a config
change, open the logs — the reason is at the top.

There is **no API token**. Authentication is per-user (§8).

### Frontend (`sharons-kitchen-frontend`)

| Variable                | Example                                        | Notes                                                        |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| `VITE_API_URL`          | `https://sharons-kitchen-backend.onrender.com` | Baked into the bundle at build time. No trailing slash.      |
| `NPM_CONFIG_PRODUCTION` | `false`                                        | So the build can install devDependencies (Vite, TypeScript). |

Build command: `npm install && npm run build:shared && npm run build --workspace=frontend`
· Publish directory: `frontend/dist`

### Database (`sharons-kitchen-db`)

No variables to set. Note the **region** — the backend service must be in the
same region to use the internal URL.

---

## 3. Deploying

A push to the deployment branch (`main`) auto-deploys the backend and the
frontend. They deploy independently and are **not** coordinated, so when a
change spans both (a new API field the UI needs), expect a minute or two where
one is ahead of the other. For a breaking change, deploy the backend first.

**Watch a deploy:** service → **Events** / **Logs**. The backend is healthy once
the log shows `Server running on port <port> (production)` and
`GET /api/health` returns `{"success":true,"data":{"status":"ok"}}`.

**Manual deploy / redeploy:** service → **Manual Deploy** → _Deploy latest commit_
or _Clear build cache & deploy_.

### Rollback

Backend or frontend: service → **Events** → find the last good deploy →
**Rollback to this deploy**. This redeploys the old image/build; it does **not**
touch the database. If the bad deploy ran a migration, see §4.

---

## 4. Database migrations

Migrations live in `backend/prisma/migrations/`, each a folder with a
hand-authored `migration.sql`. They are authored locally and committed; they run
**automatically** on the next backend deploy (`prisma migrate deploy` in the
container command).

### Before a deploy that includes a migration

1. Check what will run: locally, with the prod `DATABASE_URL` in your shell,
   ```bash
   npx prisma migrate status --schema backend/prisma/schema.prisma
   ```
2. **Take a manual backup** (§5). Non-negotiable for anything that drops or
   rewrites a column.
3. Deploy. Watch the logs for `... migrations have been applied` before the
   server line.

### If a migration fails

The container command stops at the failed migration and the old version keeps
serving (the new one never becomes healthy). The database may be
**partially migrated** and Prisma marks the migration as failed.

1. Don't keep redeploying. Look at the log for the failing statement.
2. Decide: fix forward (a corrected migration) or restore from the backup you
   took in step 2.
3. To clear a failed-migration record after you've reconciled the DB by hand:
   `npx prisma migrate resolve --applied <migration_name>` or
   `--rolled-back <migration_name>` (with the prod URL in your shell). Be sure
   the actual schema matches what you're claiming.

### Multi-instance note

If the backend is ever scaled past one instance, two containers can run
`migrate deploy` at the same time on a deploy. Before scaling up, move the
migrate step out of the container command into a Render **Pre-Deploy Command**
so it runs once.

---

## 5. Database backups & restore

### Automatic

Render takes automatic daily backups of the Postgres instance. Retention and
point-in-time recovery depend on the plan tier — check
`sharons-kitchen-db` → **Backups** / **Recovery** and know what you actually
have. Free-tier databases have minimal backups and expire; a paid instance is
required for anything real.

### Manual backup (before a risky change)

Use the **External Database URL** (DB service → _Connect_ → External).

```bash
pg_dump "<EXTERNAL_DATABASE_URL>" --format=custom --no-owner --no-privileges \
  --file "sk-$(date +%Y%m%d-%H%M).dump"
```

Keep the file somewhere off Render (your machine, cloud drive). A dump of this
database is small.

### Restore

Restoring on Render **provisions a new database**; you then repoint
`DATABASE_URL` on the backend at it. Steps:

1. DB service → **Recovery** → pick a backup / timestamp → create the new
   instance.
2. Backend service → **Environment** → set `DATABASE_URL` to the new instance's
   internal URL → save (redeploys).
3. Verify (`/api/health`, log in, check a few dishes).
4. Once confident, delete the old instance.

To restore a **manual dump** instead:

```bash
pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname "<TARGET_DATABASE_URL>" sk-YYYYMMDD-HHMM.dump
```

### Restore drill — do this once a quarter

A backup you have never restored is not a backup.

```bash
# spin up a throwaway local postgres, bound to loopback only, random password
export PGPASSWORD=$(openssl rand -hex 16)
docker run --rm -d --name sk-restore-test -e POSTGRES_PASSWORD="$PGPASSWORD" \
  -e POSTGRES_DB=sk -p 127.0.0.1:5544:5432 postgres:16
sleep 5
# credential-free URL — pg_restore reads the password from PGPASSWORD
pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname "postgresql://postgres@localhost:5544/sk" sk-YYYYMMDD-HHMM.dump
# point the app at it and click around (the app takes one DATABASE_URL)
export DATABASE_URL="postgresql://postgres:$PGPASSWORD@localhost:5544/sk"
npm run dev --workspace=backend
# cleanup
docker rm -f sk-restore-test
unset PGPASSWORD DATABASE_URL
```

Note how long it took and whether the row counts look right.

---

## 6. Secret rotation

- **Database password** — rotate from the DB service (Render regenerates the
  connection strings). Update `DATABASE_URL` on the backend. Brief downtime
  while it redeploys.
- **A leaked session token** — delete that row (§8, "force-logout"). To be
  safe across an unknown leak, `TRUNCATE sessions;` — everyone re-logs in.
- **A leaked operator password** — set a new hash for that user (re-run
  `createUser.js` after deleting the row, or add a change-password path later),
  and clear their sessions.

---

## 7. Operator accounts

Accounts are the `users` table. No self-serve sign-up.

### Create

Backend service → **Shell**:

```bash
node dist/scripts/createUser.js
```

Prompts for email, name, and password (input hidden). `CREATE_USER_EMAIL` /
`CREATE_USER_NAME` / `CREATE_USER_PASSWORD` are read if set, for non-interactive
use — but a password passed that way is visible in shell history and process
listings, so prefer the prompt. Password minimum is 10 characters
(`shared/src/schemas/password.ts`).

### Disable / re-enable

Set `is_active`. Easiest is Prisma Studio from your machine with the prod URL:

```bash
DATABASE_URL="<EXTERNAL_DATABASE_URL>" npx prisma studio --schema backend/prisma/schema.prisma
```

or a SQL console:

```sql
UPDATE users SET is_active = false WHERE email = 'name@example.com';
```

A disabled user's existing sessions stop working on the next request.

### Force-logout

```sql
DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = 'name@example.com');
```

Sessions otherwise last 30 days, sliding forward while in use.

---

## 8. Monitoring & alerting

### Have now

- **Health check:** `GET /api/health` — open, no auth, returns
  `{"success":true,"data":{"status":"ok"}}`. Set this as the backend service's
  **Health Check Path** in Render so a wedged instance gets restarted. It is
  **liveness only** — the process is up and Express is answering. It does **not**
  touch the database, so a green health check does not rule out a DB outage
  (that would show as failing API calls). Add a bounded DB-readiness check here
  if you ever need one.

### Worth adding (not wired yet)

- **Uptime monitor** — point [UptimeRobot](https://uptimerobot.com) (free) or
  similar at `/api/health` every 5 min with email/SMS alerts. This is the single
  highest-value addition: you find out the site is down before your mom does.
- **Error tracking** — [Sentry](https://sentry.io) has a free tier. Add
  `@sentry/node` to the backend and `@sentry/react` to the frontend, initialise
  with a DSN env var, and unhandled errors + slow requests show up with stack
  traces. Until then, backend errors are only in Render's log stream (which is
  not retained long on lower tiers).
- **Log retention** — lower Render tiers keep logs only briefly. If you need
  history, add a log drain, or scrape `console.error` into Sentry as above.

---

## 9. Staging environment (recommended)

Right now every change goes straight to production. Before the app grows a real
user base, stand up a parallel stack:

- A `staging` branch.
- `sharons-kitchen-db-staging`, `sharons-kitchen-backend-staging`,
  `sharons-kitchen-frontend-staging`, each deploying from `staging`, with their
  own env vars (staging `FRONTEND_URL` / `VITE_API_URL`, a separate database).
- Workflow: merge to `staging` → migrations and code run there first → click
  through → fast-forward `main`.

This is the safe place to find out a migration is wrong.

---

## 10. Incident playbook

**Backend won't start after a deploy**
Logs, first lines. Usually the env-var validator: a missing/renamed variable, or
`FRONTEND_URL` with a trailing slash or a `www.` mismatch. Fix the variable;
it redeploys.

**Frontend loads but every API call fails (CORS error in console)**
`FRONTEND_URL` on the backend doesn't exactly match the origin the browser is
on. Match it character for character (scheme, host, no slash). Redeploy backend.

**Everyone is bounced to the login screen**
Expected right after the auth cutover (old tokens are invalid — log back in). If
it happens later, the backend can't reach the database (check DB service status
and `DATABASE_URL`) or `sessions` was cleared.

**"too many connections" / intermittent 500s under light use**
Postgres connection limit on small plans. Ensure only one backend instance and
one Prisma client (the code already keeps a single client). If it persists, add
a pooler (Render offers one) or bump the DB plan.

**First request after idle is very slow**
Free/low-tier services sleep. A paid instance or the uptime monitor in §8
(pinging every 5 min) keeps it warm.

**A migration ran and the data looks wrong**
§4 "if a migration fails" and §5 "restore". This is what the pre-deploy backup
is for.

---

## 11. Periodic checklist

**Before any deploy that changes the database**

- [ ] `prisma migrate status` against prod — know what will run
- [ ] Manual backup taken and downloaded off Render
- [ ] Watched the deploy logs through "migrations applied" + "Server running"
- [ ] Smoke test: health, login, list dishes, one edit

**Monthly**

- [ ] `npm audit` (CI also runs it) — triage anything `high`+
- [ ] Dependabot PRs reviewed and merged
- [ ] Confirm automatic backups are actually being taken (DB → Backups)
- [ ] Skim Render logs / Sentry for recurring errors

**Quarterly**

- [ ] Restore drill (§5) — restore the latest backup somewhere and verify it
- [ ] Review operator accounts — remove anyone who no longer needs access
- [ ] Revisit this file; fix anything that's drifted

**Once, when there's time**

- [ ] Adopt a `render.yaml` Blueprint so service config is in the repo, not
      only in the dashboard
- [ ] Stand up the staging stack (§9)
- [ ] Wire the uptime monitor and Sentry (§8)
