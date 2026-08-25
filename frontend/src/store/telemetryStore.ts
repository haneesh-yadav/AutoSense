import { create } from 'zustand';
import type { TelemetryReading, FaultAlert, ConnectionStatus, HistoricalPoint } from '../types/telemetry';

interface TelemetryState {
  latest: TelemetryReading | null;
  history: HistoricalPoint[];
  faults: FaultAlert[];
  healthScore: number;
  connectionStatus: ConnectionStatus;

  setLatest: (reading: TelemetryReading) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  upsertFault: (fault: FaultAlert) => void;
  clearFault: (id: string) => void;
}

const MAX_HISTORY_POINTS = 120;

// Simple weighted health score derived from the current reading.
// Real scoring should happen on the backend; this is a client-side
// placeholder so the widget renders something meaningful before the
// backend endpoint is wired up.
function computeHealthScore(reading: TelemetryReading, activeFaultCount: number): number {
  let score = 100;
  if (reading.engineTempC > 110) score -= 35;
  else if (reading.engineTempC > 100) score -= 15;
  if (reading.batteryVoltage < 11.8) score -= 25;
  else if (reading.batteryVoltage < 12.2) score -= 10;
  score -= activeFaultCount * 10;
  return Math.max(0, Math.min(100, score));
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  latest: null,
  history: [],
  faults: [],
  healthScore: 100,
  connectionStatus: 'connecting',

  setLatest: (reading) =>
    set((state) => {
      const nextHistory = [
        ...state.history,
        {
          timestamp: reading.timestamp,
          engineTempC: reading.engineTempC,
          batteryVoltage: reading.batteryVoltage,
          rpm: reading.rpm,
        },
      ].slice(-MAX_HISTORY_POINTS);

      const activeFaultCount = state.faults.filter((f) => f.active).length;

      return {
        latest: reading,
        history: nextHistory,
        healthScore: computeHealthScore(reading, activeFaultCount),
      };
    }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  upsertFault: (fault) =>
    set((state) => {
      const existingIndex = state.faults.findIndex((f) => f.id === fault.id);
      const nextFaults = [...state.faults];
      if (existingIndex >= 0) nextFaults[existingIndex] = fault;
      else nextFaults.unshift(fault);
      return { faults: nextFaults };
    }),

  clearFault: (id) =>
    set((state) => ({
      faults: state.faults.map((f) => (f.id === id ? { ...f, active: false } : f)),
    })),
}));
