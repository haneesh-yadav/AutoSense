import type { FaultAlert } from '../types/telemetry';

interface FaultAlertsProps {
  faults: FaultAlert[];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function FaultAlerts({ faults }: FaultAlertsProps) {
  const active = faults.filter((f) => f.active);
  const recentlyCleared = faults.filter((f) => !f.active).slice(0, 3);

  return (
    <div className="flex h-full flex-col rounded-lg border border-line bg-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-xs tracking-[0.15em] text-text-muted uppercase">
          Fault Alerts
        </span>
        {active.length > 0 && (
          <span className="rounded-full bg-signal-critical/15 px-2 py-0.5 font-mono text-xs text-signal-critical">
            {active.length} active
          </span>
        )}
      </div>

      {active.length === 0 && recentlyCleared.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-6 text-center text-sm text-text-muted">
          No faults detected. All systems nominal.
        </div>
      )}

      <ul className="scrollbar-thin flex flex-1 flex-col gap-2 overflow-y-auto">
        {active.map((fault) => (
          <li
            key={fault.id}
            className="flex items-start gap-3 rounded-md border border-line bg-panel-raised px-3 py-2"
          >
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  fault.severity === 'critical' ? 'var(--color-signal-critical)' : 'var(--color-signal-warn)',
                animation: 'pulse-dot 1.4s ease-in-out infinite',
              }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">⚠ {fault.message}</p>
              <p className="font-mono text-xs text-text-muted">
                {fault.code} · {formatTime(fault.triggeredAt)}
              </p>
            </div>
          </li>
        ))}
        {recentlyCleared.map((fault) => (
          <li
            key={fault.id}
            className="flex items-start gap-3 rounded-md border border-line/50 px-3 py-2 opacity-50"
          >
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-signal-good" />
            <div className="flex-1">
              <p className="text-sm text-text-muted line-through">{fault.message}</p>
              <p className="font-mono text-xs text-text-faint">Cleared</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
