import json

import redis.asyncio as aioredis
from fastapi import WebSocket

from app.config import settings


class BroadcastService:
    def __init__(self):
        self.redis: aioredis.Redis | None = None
        self.connections: set[WebSocket] = set()

    async def connect(self):
        self.redis = aioredis.from_url(settings.redis_url, decode_responses=True)

    async def disconnect(self):
        for ws in self.connections.copy():
            await ws.close()
        self.connections.clear()

    async def register(self, ws: WebSocket):
        await ws.accept()
        self.connections.add(ws)

    async def unregister(self, ws: WebSocket):
        self.connections.discard(ws)

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        for ws in self.connections.copy():
            try:
                await ws.send_text(payload)
            except Exception:
                self.connections.discard(ws)

    async def publish_reading(self, data: dict):
        msg = {"type": "reading", "data": data}
        await self.broadcast(msg)
        if self.redis:
            await self.redis.publish("telemetry:readings", json.dumps(msg))

    async def publish_fault(self, data: dict):
        msg = {"type": "fault", "data": data}
        await self.broadcast(msg)
        if self.redis:
            await self.redis.publish("telemetry:faults", json.dumps(msg))

    async def publish_fault_clear(self, fault_id: str):
        msg = {"type": "fault-clear", "data": {"id": fault_id}}
        await self.broadcast(msg)
        if self.redis:
            await self.redis.publish("telemetry:faults", json.dumps(msg))


broadcast = BroadcastService()
