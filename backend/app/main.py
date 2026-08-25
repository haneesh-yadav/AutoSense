from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import telemetry, trips, auth, websocket
from app.services.broadcast import broadcast


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await broadcast.connect()
    yield
    await broadcast.disconnect()
    await broadcast.redis.close()


app = FastAPI(title="AutoSense API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(telemetry.router, prefix="/api/telemetry", tags=["telemetry"])
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(websocket.router, prefix="/ws", tags=["websocket"])
