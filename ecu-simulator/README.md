# AutoSense — ECU Simulator

Generates and posts sample vehicle telemetry to the backend so the dashboard
can be developed and demoed without real hardware.

## Contents

```
ecu-simulator/
├── simulate.py            Continuous synthetic telemetry generator
│                           (speed, RPM, temp, battery, GPS) posted on a loop
├── requirements.txt
├── .env.example
└── mock-data/              File-based alternative: edit reading.json and
    ├── watch_and_post.py    watch_and_post.py posts it on every save
    ├── reading.json
    └── requirements.txt
```

## Usage

### Continuous simulator

```bash
cd ecu-simulator
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set BACKEND_URL / VEHICLE_ID
python simulate.py
```

### File-watch mock data

Useful for hand-crafting specific readings/fault scenarios:

```bash
cd ecu-simulator/mock-data
pip install -r requirements.txt
python watch_and_post.py   # edit reading.json to trigger a new post
```

## Environment variables

- `BACKEND_URL` — telemetry ingest endpoint (default
  `http://localhost:8000/api/telemetry`)
- `VEHICLE_ID` — vehicle identifier attached to each reading

## Related

- `../backend` — receives the posted readings
- `../frontend` — visualizes them live
