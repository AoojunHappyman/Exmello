# EXMELLO FastAPI backend

This backend provides PostgreSQL persistence, account authentication, rule based recommendations, focus session tracking, public resources, and a small dashboard API. [Architecture and schema](ARCHITECTURE.md) documents the data model and the decisions made for the current frontend.

## Requirements

- Python 3.11 or newer
- PostgreSQL 14 or newer
- Node.js only if re-exporting the existing frontend articles into the seed JSON

## Setup (PowerShell)

From `backend/`:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Create a PostgreSQL database and least privilege account, then edit `.env`:

```text
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/exmello
JWT_SECRET_KEY=<a unique random value of at least 32 characters>
JWT_EXPIRE_MINUTES=10080
CORS_ORIGINS=http://localhost:3000
```

`DATABASE_URL` and `JWT_SECRET_KEY` are required. Do not commit `.env`. Use comma separated origins in `CORS_ORIGINS` for more than one frontend URL. The example file contains placeholders only.

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m app.seed
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for interactive API documentation. `GET http://localhost:8000/api/health` checks the database and returns `{"status":"ok"}` when connected.

## API

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Database health |
| POST | `/api/auth/register` | Public | Register and receive JWT |
| POST | `/api/auth/login` | Public | Sign in and receive JWT |
| GET | `/api/auth/me` | Bearer | Current user |
| DELETE | `/api/auth/me` | Bearer | Delete account and owned data |
| POST | `/api/checkins` | Bearer | Save 1–3 concerns, 0–1 need, and one recommendation |
| GET | `/api/checkins` | Bearer | Own check-in history |
| GET | `/api/checkins/{id}` | Bearer | Own check-in |
| GET | `/api/recommendations/{id}` | Bearer | Own recommendation |
| POST | `/api/focus-sessions` | Bearer | Start a focus timer |
| PATCH | `/api/focus-sessions/{id}` | Bearer | Complete or cancel a timer |
| GET | `/api/focus-sessions` | Bearer | Own focus history |
| GET | `/api/resources` | Public | Published guides, optional `category` filter |
| GET | `/api/resources/{id}` | Public | Published guide |
| GET | `/api/dashboard` | Bearer | Own counts and completed focus minutes |

Example check-in request:

```json
{"mood":"stressed","concerns":["cant_remember","running_out_of_time"],"needs":["focus"]}
```

Pass the JWT as `Authorization: Bearer <token>`. Registration accepts `email`, `password`, and optional `full_name`. Starting focus accepts `duration_minutes` (default 25); the response is initially `in_progress`. Send `{"status":"completed"}` when the timer reaches zero, or `{"status":"cancelled"}` if the user stops. Early completion and repeated transitions return 409.

The resource response uses the current frontend article keys (`categoryLabel`, `readingTimeMinutes`, `contentMarkdown`, etc.). Run `node backend/scripts/export_resources.cjs` from the repository root if the frontend's source articles change, then seed a fresh database. Seeding is idempotent and never overwrites database edits.

## Run with the existing frontend

Start the backend on port 8000 and run `npm run dev` in the repository root for Next.js on port 3000. The frontend uses `NEXT_PUBLIC_API_BASE_URL` from the root `.env.local` (default: `http://127.0.0.1:8000`). Published resources always come from the API. Signed-in check-ins, recommendations, focus sessions, and dashboard data use the API and PostgreSQL. Guest check-ins and activity remain in browser storage and are not automatically uploaded when someone signs in. Breathing and reset activities remain browser-only because the API currently tracks focus sessions only.

## Tests

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Tests use an isolated in-memory SQLite database to exercise API contracts, priorities, ownership, and focus transitions. Production runs on PostgreSQL. Apply migrations and seed data before starting the app; tables are intentionally not created on server startup.
