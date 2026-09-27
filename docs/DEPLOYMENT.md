# Production deployment

EXMELLO uses two Vercel Hobby projects and a Neon Free PostgreSQL database.
Visitors use the Next.js website URL; `/api/*` is forwarded by a server route to
FastAPI. Database credentials and the JWT signing key stay on the backend.

## Live services

- Website: https://exmello.vercel.app
- API health: https://exmello-api.vercel.app/api/health
- Neon: `Exmello`, production branch, PostgreSQL 18, Free plan.
- Vercel scope: `aoo2`, Hobby plan.

Verified on 2026-09-27: website and article HTML return 200; same-origin health
and resources work; registration, login, persisted check-in/recommendation,
dashboard, early focus completion rejection, cancellation, and account deletion
pass through the public website API. The disposable test account was deleted and
its token rejected afterward. Local checks: 9 frontend tests, 6 backend tests,
TypeScript and production build pass; npm production audit reports 0 issues.
Browser visual verification was unavailable in this session.

## Projects

| Project | Source root | Runtime |
| --- | --- | --- |
| Website | repository root | Node.js 24, Next.js 16 |
| API | `backend` | Python 3.12, FastAPI |

Both Vercel projects use Singapore (`sin1`); Neon uses `aws-ap-southeast-1`.

## Production environment variables

Website: set `API_INTERNAL_URL` to the backend's stable HTTPS origin, without an
`/api` suffix. Do not use a `NEXT_PUBLIC_` variable for this value.

Backend:

- `DATABASE_URL`: Neon pooled connection string with SSL enabled.
- `MIGRATION_DATABASE_URL`: direct Neon connection string with SSL enabled.
- `DATABASE_POOL_MODE=serverless`: avoids keeping idle SQLAlchemy connections.
- `JWT_SECRET_KEY`: a randomly generated secret of at least 32 characters.
- `APPLY_MIGRATIONS=true`: applies Alembic migrations and idempotent starter content
  during the backend build, before the new deployment receives traffic.
- `CORS_ORIGINS`: the website HTTPS origin.

Deploy the backend first, then the website. Verify `/api/health`, resources,
registration/login, check-ins, dashboard, and deletion through the website URL.
Never commit credentials, `.vercel` metadata, or `.deploy` staging files.

For CLI deployments, commit the source first, then run
`node scripts/prepare-vercel.cjs api` (or `web`). This prints a clean staging
directory, excluding the other service and local caches. Change into that
directory, run `npx vercel@60.1.3 link --yes --scope aoo2 --project exmello-api`
(website: `exmello`), then `npx vercel@60.1.3 deploy --prod --yes --scope aoo2
--local-config vercel.json` on one line. Run from the staging directory itself.
Secrets already saved in Vercel remain associated with the linked project.

GitHub automatic deployment is not connected yet; pushing Git alone does not
publish the website. Connecting it later requires granting Vercel access to the
repository and configuring each project's source root appropriately.

## Preview environments and operations

Production credentials are scoped to production only. Before enabling previews,
create a separate Neon branch and backend deployment, then configure preview
variables against that branch. Do not run preview migrations on production.

Schema migrations must remain compatible with the previous running deployment.
Rolling back Vercel code does not roll back database schema or data. Export a
database backup before destructive migrations and periodically for recovery.

Hobby is intended for personal, non-commercial projects. Free services have usage
quotas; monitor Vercel and Neon dashboards. Neon may suspend idle compute, so the
first request after inactivity can be slower. Do not enable paid upgrades without
the account owner's approval.

Local development still uses `API_INTERNAL_URL=http://127.0.0.1:8000` in
`.env.local` and the PostgreSQL settings in `backend/.env`.
