import math
import os
import random
import time
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000/api/telemetry")
VEHICLE_ID = os.getenv("VEHICLE_ID", "vehicle-001")

BASE_LAT = 12.9716
BASE_LNG = 79.1594

t = 0.0

while True:
    t += 0.5
    speed = 40 + 30 * math.sin(t * 0.1) + random.gauss(0, 2)
    speed = max(0, min(220, speed))

    rpm = 1500 + speed * 20 + random.gauss(0, 100)
    rpm = max(0, min(8000, int(rpm)))

    engine_temp = 85 + 10 * math.sin(t * 0.05) + random.gauss(0, 1)
    engine_temp = max(40, min(140, round(engine_temp, 1)))

    battery = 12.6 + 0.5 * math.sin(t * 0.03) + random.gauss(0, 0.05)
    battery = max(9, min(15, round(battery, 2)))

    gear_map = ["N", "1", "2", "3", "4", "5", "6"]
    gear_idx = min(6, max(1, int(speed / 35) + 1))
    gear = gear_map[gear_idx]

    lat = BASE_LAT + math.sin(t * 0.01) * 0.005
    lng = BASE_LNG + math.cos(t * 0.01) * 0.005

    payload = {
        "speedKph": round(speed, 1),
        "rpm": rpm,
        "engineTempC": engine_temp,
        "batteryVoltage": battery,
        "gear": gear,
        "lat": round(lat, 6),
        "lng": round(lng, 6),
        "vehicleId": VEHICLE_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    try:
        resp = requests.post(BACKEND_URL, json=payload, timeout=2)
        print(f"[{datetime.now().isoformat()}] {resp.status_code} speed={speed:.1f} rpm={rpm} temp={engine_temp}")
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] Error: {e}")

    time.sleep(0.5)
