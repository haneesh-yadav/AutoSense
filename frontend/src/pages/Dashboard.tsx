import { useTelemetryFeed } from '../hooks/useTelemetryFeed';
import { useTelemetryStore } from '../store/telemetryStore';
import { useTripSummaries } from '../lib/api';
import { StatusBar } from '../components/StatusBar';
import { GaugeWidget } from '../components/GaugeWidget';
import { HealthScore } from '../components/HealthScore';
import { FaultAlerts } from '../components/FaultAlerts';
import { TripMap } from '../components/TripMap';
import { HistoricalCharts } from '../components/HistoricalCharts';
import { TripSummary } from '../components/TripSummary';

export function Dashboard() {
  useTelemetryFeed();

  const latest = useTelemetryStore((s) => s.latest);
  const history = useTelemetryStore((s) => s.history);
  const faults = useTelemetryStore((s) => s.faults);
  const healthScore = useTelemetryStore((s) => s.healthScore);
  const connectionStatus = useTelemetryStore((s) => s.connectionStatus);

  // Falls back gracefully if the backend endpoint isn't up yet.
  const { data: trips } = useTripSummaries();
  const latestTrip = trips?.[trips.length - 1];

  return (
    <div className="min-h-screen">
      <StatusBar status={connectionStatus} gear={latest?.gear} />

      <main className="mx-auto flex max-w-7xl flex-col gap-5 p-6">
        {/* Gauges */}
        <section className="rounded-lg border border-line bg-panel-raised p-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <GaugeWidget
              label="Speed"
              value={latest?.speedKph ?? 0}
              min={0}
              max={220}
              unit="km/h"
            />
            <GaugeWidget
              label="RPM"
              value={latest?.rpm ?? 0}
              min={0}
              max={8000}
              unit="rpm"
              warnAt={6000}
              criticalAt={7000}
            />
            <GaugeWidget
              label="Engine Temp"
              value={latest?.engineTempC ?? 0}
              min={40}
              max={140}
              unit="°C"
              decimals={1}
              warnAt={100}
              criticalAt={110}
            />
            <GaugeWidget
              label="Battery"
              value={latest?.batteryVoltage ?? 0}
              min={9}
              max={15}
              unit="V"
              decimals={2}
              warnAt={12.2}
              criticalAt={11.8}
            />
          </div>
        </section>

        {/* Health, Alerts, Map */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          <div className="flex flex-col gap-5 lg:col-span-1">
            <HealthScore score={healthScore} />
            <FaultAlerts faults={faults} />
          </div>
          <div className="lg:col-span-3">
            <TripMap lat={latest?.lat ?? 12.9716} lng={latest?.lng ?? 79.1594} />
          </div>
        </section>

        <TripSummary trip={latestTrip} />

        <section>
          <HistoricalCharts data={history} />
        </section>
      </main>
    </div>
  );
}
