from app.models.telemetry import TelemetryReading


def compute_health_score(
    engine_temp_c: float,
    battery_voltage: float,
    active_fault_count: int = 0,
) -> int:
    score = 100

    if engine_temp_c > 110:
        score -= 35
    elif engine_temp_c > 100:
        score -= 15

    if battery_voltage < 11.8:
        score -= 25
    elif battery_voltage < 12.2:
        score -= 10

    score -= active_fault_count * 10

    return max(0, min(100, score))
