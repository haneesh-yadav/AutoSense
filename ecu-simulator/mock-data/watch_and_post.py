import json
import os
import time
from datetime import datetime, timezone

import requests
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000/api/telemetry")
FILE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reading.json")
VEHICLE_ID = os.getenv("VEHICLE_ID", "vehicle-001")


def derive_gear(speed_kph: float) -> str:
    if speed_kph < 5:
        return "N"
    return str(min(6, max(1, int(speed_kph / 25) + 1)))


def post_reading():
    try:
        with open(FILE_PATH) as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to read reading.json: {e}")
        return

    data["vehicleId"] = VEHICLE_ID
    data["gear"] = derive_gear(data.get("speedKph", 0))
    data["timestamp"] = datetime.now(timezone.utc).isoformat()

    try:
        resp = requests.post(BACKEND_URL, json=data, timeout=3)
        print(
            f"[{datetime.now().isoformat()}] "
            f"Posted: speed={data['speedKph']} km/h, "
            f"rpm={data['rpm']}, "
            f"temp={data['engineTempC']}°C, "
            f"battery={data['batteryVoltage']}V  "
            f"(status={resp.status_code})"
        )
    except Exception as e:
        print(f"Failed to post: {e}")


class ReadingHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path == FILE_PATH:
            post_reading()


if __name__ == "__main__":
    print(f"Watching {FILE_PATH} ...")
    print(f"Posting to {BACKEND_URL}")
    post_reading()

    observer = Observer()
    observer.schedule(ReadingHandler(), path=os.path.dirname(FILE_PATH), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
