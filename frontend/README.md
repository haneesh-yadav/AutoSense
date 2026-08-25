# AutoSense — Frontend

React + TypeScript dashboard for live vehicle telemetry: gauges, health score,
fault alerts, trip history, and a live map — fed by the AutoSense backend over
REST and WebSocket.

## Stack

- React 19 + TypeScript, built with Vite
- Zustand for state, TanStack Query for data fetching
- Recharts for charts, React-Leaflet for the trip map
- Tailwind CSS v4

## Project layout

```
frontend/
├── public/              Static assets (favicon, icon sprite)
├── src/
│   ├── assets/           Images and other bundled assets
│   ├── components/       Presentational + widget components
│   │   (GaugeWidget, HealthScore, FaultAlerts, HistoricalCharts,
│   │    StatusBar, TripMap, TripSummary)
│   ├── hooks/             Data hooks (useTelemetryFeed)
│   ├── lib/                API client (api.ts)
│   ├── pages/               Route-level views (Dashboard)
│   ├── store/                Zustand stores (telemetryStore)
│   ├── types/                  Shared TypeScript types (telemetry)
│   ├── App.tsx, main.tsx, index.css, vite-env.d.ts
├── .env.example
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL / VITE_WS_URL at the backend
npm run dev
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |

## Environment variables

See `.env.example`:

- `VITE_API_BASE_URL` — base URL of the FastAPI backend
- `VITE_WS_URL` — WebSocket endpoint for live telemetry
- `VITE_ENABLE_LOCAL_SIMULATOR` — set `true` to generate fake readings locally
  when no backend is running (standalone/demo use only)

## Related

- `../backend` — FastAPI + PostgreSQL + WebSocket API this app talks to
- `../ecu-simulator` — generates/posts sample telemetry for local development
- `../docs` — architecture and API-shape reference docs
