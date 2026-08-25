export interface TelemetryReading {
  timestamp: string;
  speedKph: number;
  rpm: number;
  engineTempC: number;
  batteryVoltage: number;
  gear: string;
  lat: number;
  lng: number;
}

export type FaultSeverity = 'warn' | 'critical';

export interface FaultAlert {
  id: string;
  code: string;
  message: string;
  severity: FaultSeverity;
  triggeredAt: string;
  active: boolean;
}

export interface TripSummary {
  tripId: string;
  distanceKm: number;
  avgSpeedKph: number;
  idleMinutes: number;
  fuelUsedLiters: number;
  startedAt: string;
  endedAt: string;
}

export interface HistoricalPoint {
  timestamp: string;
  engineTempC: number;
  batteryVoltage: number;
  rpm: number;
}

export type ConnectionStatus = 'connecting' | 'live' | 'offline';
