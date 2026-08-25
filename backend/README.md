# AutoSense — Backend

FastAPI + PostgreSQL (TimescaleDB) + Redis service that ingests vehicle
telemetry, computes health scores and fault alerts, and streams live data to
the frontend over REST and WebSocket.

## Stack

- FastAPI (ASGI, `uvicorn`)
- SQLAlchemy + Alembic migrations, PostgreSQL/TimescaleDB
- Redis-backed WebSocket broadcast
- JWT auth
- Twilio / Firebase for notifications

## Project layout

```
backend/
├── app/
│   ├── main.py            FastAPI app factory, router mounting, lifespan
│   ├── config.py           Settings loaded from environment
│   ├── database.py          SQLAlchemy engine/session, TimescaleDB setup
│   ├── models/                SQLAlchemy tables (telemetry, fault, trip)
│   ├── schemas/                 Pydantic request/response shapes
│   ├── routers/                   API routes (telemetry, trips, auth, websocket)
│   ├── services/                    Business logic (health_score, alert_engine,
│   │                                 notifications, broadcast)
│   ├── auth/                          JWT handling + auth dependencies
│   └── tests/                          Pytest suite
├── alembic/                Database migrations
├── alembic.ini
├── docker-compose.yml       API + PostgreSQL + Redis
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Getting started

```bash
cp .env.example .env        # fill in DB / JWT / Twilio / Firebase values
docker-compose up           # API + PostgreSQL + Redis
```

Or run locally without Docker:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

## Tests

```bash
pytest
```

## Environment variables

See `.env.example` for the full list: `DATABASE_URL`, `JWT_SECRET`,
`JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`, `REDIS_URL`, Twilio credentials, and
`FIREBASE_CREDENTIALS_PATH`.

## Related

- `../frontend` — React dashboard this API serves
- `../ecu-simulator` — posts sample telemetry to `/api/telemetry` for local dev
- `../docs` — architecture and API-shape reference docs
