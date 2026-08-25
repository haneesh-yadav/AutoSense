# AutoSense

Real-time vehicle telemetry & diagnostics platform: an ECU (or simulator)
streams readings to a FastAPI backend, which stores them, computes health
scores and fault alerts, and pushes live updates to a React dashboard over
WebSocket.

## Structure

```
autosense/
├── frontend/         React + TypeScript dashboard (Vite)
├── backend/           FastAPI + PostgreSQL + Redis API and WebSocket server
├── ecu-simulator/       Sample telemetry generator for local development
└── docs/                 Architecture and API-shape reference docs
```

Each subproject has its own README with setup instructions:
[`frontend/README.md`](./frontend/README.md) ·
[`backend/README.md`](./backend/README.md) ·
[`ecu-simulator/README.md`](./ecu-simulator/README.md)

## Data flow

```
ECU / ecu-simulator  --POST-->  backend (FastAPI)  --WebSocket-->  frontend (React)
                                     |
                                PostgreSQL / Redis
```

## Quick start (local dev)

```bash
# 1. Backend
cd backend
cp .env.example .env
docker-compose up -d          # PostgreSQL + Redis + API

# 2. Frontend
cd ../frontend
npm install
cp .env.example .env          # point at the backend from step 1
npm run dev

# 3. Feed it sample data
cd ../ecu-simulator
pip install -r requirements.txt
cp .env.example .env
python simulate.py
```

## Docs

See [`docs/`](./docs) for the original backend file-structure reference and
prototype JSON payload shapes used to design the API contract between the
frontend and backend.
