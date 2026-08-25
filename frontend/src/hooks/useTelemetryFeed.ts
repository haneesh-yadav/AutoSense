import { useEffect, useRef } from 'react';
import { useTelemetryStore } from '../store/telemetryStore';
import type { FaultAlert, TelemetryReading } from '../types/telemetry';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws/telemetry';
const RECONNECT_DELAY_MS = 3000;

const ENABLE_SIMULATOR = import.meta.env.VITE_ENABLE_LOCAL_SIMULATOR === 'true';

export function useTelemetryFeed() {
  const setLatest = useTelemetryStore((s) => s.setLatest);
  const setConnectionStatus = useTelemetryStore((s) => s.setConnectionStatus);
  const upsertFault = useTelemetryStore((s) => s.upsertFault);
  const clearFault = useTelemetryStore((s) => s.clearFault);
  const simulatorHandle = useRef<number | null>(null);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let cancelled = false;

    const startSimulator = () => {
      if (simulatorHandle.current !== null) return;
      setConnectionStatus('live');
      simulatorHandle.current = window.setInterval(() => {
        const reading = generateSimulatedReading();
        setLatest(reading);

        if (reading.engineTempC > 110) {
          upsertFault({
            id: 'engine-temp-high',
            code: 'P0217',
            message: 'Engine Temperature High',
            severity: 'critical',
            triggeredAt: reading.timestamp,
            active: true,
          });
        } else {
          clearFault('engine-temp-high');
        }

        if (reading.batteryVoltage < 11.8) {
          upsertFault({
            id: 'battery-low',
            code: 'P0562',
            message: 'Low Battery Voltage',
            severity: 'warn',
            triggeredAt: reading.timestamp,
            active: true,
          });
        } else {
          clearFault('battery-low');
        }
      }, 500);
    };

    const stopSimulator = () => {
      if (simulatorHandle.current !== null) {
        window.clearInterval(simulatorHandle.current);
        simulatorHandle.current = null;
      }
    };

    const connect = () => {
      setConnectionStatus('connecting');
      try {
        socket = new WebSocket(WS_URL);
      } catch {
        if (ENABLE_SIMULATOR) startSimulator();
        return;
      }

      socket.onopen = () => {
        stopSimulator();
        setConnectionStatus('live');
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'reading') setLatest(payload.data as TelemetryReading);
          if (payload.type === 'fault') upsertFault(payload.data as FaultAlert);
          if (payload.type === 'fault-clear') clearFault(payload.data.id as string);
        } catch {
          // Ignore malformed frames rather than crashing the dashboard.
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        setConnectionStatus('offline');
        reconnectTimer = window.setTimeout(() => {
          if (cancelled) return;
          if (ENABLE_SIMULATOR) startSimulator();
          connect();
        }, RECONNECT_DELAY_MS);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      stopSimulator();
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [setLatest, setConnectionStatus, upsertFault, clearFault]);
}

let simTime = 0;
function generateSimulatedReading(): TelemetryReading {
  simTime += 0.5;
  const speedKph = 60 + 40 * Math.sin(simTime / 8) + (Math.random() * 4 - 2);
  const rpm = 1500 + Math.max(0, speedKph) * 35 + (Math.random() * 200 - 100);
  const engineTempC = 92 + 8 * Math.sin(simTime / 20) + (Math.random() * 2);
  const batteryVoltage = 12.6 - Math.max(0, Math.sin(simTime / 30)) * 0.9;

  return {
    timestamp: new Date().toISOString(),
    speedKph: Math.max(0, Math.round(speedKph * 10) / 10),
    rpm: Math.max(700, Math.round(rpm)),
    engineTempC: Math.round(engineTempC * 10) / 10,
    batteryVoltage: Math.round(batteryVoltage * 100) / 100,
    gear: speedKph < 5 ? 'N' : String(Math.min(6, Math.ceil(speedKph / 25))),
    lat: 12.9716 + Math.sin(simTime / 50) * 0.01,
    lng: 79.1594 + Math.cos(simTime / 50) * 0.01,
  };
}
