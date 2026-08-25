import pytest

from app.services.health_score import compute_health_score


def test_health_score_healthy():
    score = compute_health_score(engine_temp_c=90, battery_voltage=13.0)
    assert score == 100


def test_health_score_high_temp():
    score = compute_health_score(engine_temp_c=115, battery_voltage=13.0)
    assert score == 65


def test_health_score_low_battery():
    score = compute_health_score(engine_temp_c=90, battery_voltage=11.5)
    assert score == 75


def test_health_score_both_bad():
    score = compute_health_score(engine_temp_c=115, battery_voltage=11.5)
    assert score == 40


def test_health_score_with_faults():
    score = compute_health_score(engine_temp_c=90, battery_voltage=13.0, active_fault_count=3)
    assert score == 70


def test_health_score_min_floor():
    score = compute_health_score(engine_temp_c=115, battery_voltage=11.5, active_fault_count=10)
    assert score == 0
