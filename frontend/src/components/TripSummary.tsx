import type { TripSummary as TripSummaryType } from '../types/telemetry';

interface TripSummaryProps {
  trip?: TripSummaryType;
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="font-mono text-lg font-semibold text-text-primary">
        {value} <span className="text-xs font-normal text-text-muted">{unit}</span>
      </span>
    </div>
  );
}

export function TripSummary({ trip }: TripSummaryProps) {
  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <span className="font-display text-xs tracking-[0.15em] text-text-muted uppercase">
        Current Trip
      </span>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Distance" value={trip ? trip.distanceKm.toFixed(1) : '—'} unit="km" />
        <Stat label="Avg Speed" value={trip ? trip.avgSpeedKph.toFixed(0) : '—'} unit="km/h" />
        <Stat label="Idle Time" value={trip ? trip.idleMinutes.toFixed(0) : '—'} unit="min" />
        <Stat label="Fuel Used" value={trip ? trip.fuelUsedLiters.toFixed(1) : '—'} unit="L" />
      </div>
    </div>
  );
}
