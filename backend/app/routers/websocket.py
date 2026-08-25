from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.broadcast import broadcast

router = APIRouter()


@router.websocket("/telemetry")
async def telemetry_websocket(ws: WebSocket):
    await broadcast.register(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await broadcast.unregister(ws)
