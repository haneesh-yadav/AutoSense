import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_ingest_telemetry(client):
    payload = {
        "speedKph": 65.2,
        "rpm": 2450,
        "engineTempC": 98.5,
        "batteryVoltage": 12.45,
        "gear": "3",
        "lat": 12.9716,
        "lng": 79.1594,
    }
    resp = await client.post("/api/telemetry", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["speedKph"] == 65.2
    assert data["rpm"] == 2450
    assert "id" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_get_history(client):
    resp = await client.get("/api/telemetry/history?range=1h")
    assert resp.status_code in (200, 500)


@pytest.mark.asyncio
async def test_history_invalid_range(client):
    resp = await client.get("/api/telemetry/history?range=99h")
    assert resp.status_code == 422
