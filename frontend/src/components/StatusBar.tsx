import type { ConnectionStatus } from '../types/telemetry';

interface StatusBarProps {
  status: ConnectionStatus;
  gear?: string;
}

const statusConfig: Record<ConnectionStatus, { label: string; color: string }> = {
  connecting: { label: 'Connecting…', color: 'var(--color-signal-warn)' },
  live: { label: 'Live', color: 'var(--color-signal-good)' },
  offline: { label: 'Offline', color: 'var(--color-signal-critical)' },
};

export function StatusBar({ status, gear }: StatusBarProps) {
  const config = statusConfig[status];

  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="font-display text-lg font-semibold tracking-tight text-text-primary">
          AutoSense
        </span>
        <span className="hidden text-xs text-text-faint sm:inline">Vehicle Monitoring Platform</span>
      </div>
      <div className="flex items-center gap-4">
        {gear && (
          <div className="flex items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1">
            <span className="text-xs text-text-muted">Gear</span>
            <span className="font-mono text-sm font-semibold text-text-primary">{gear}</span>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: config.color, animation: 'pulse-dot 1.6s ease-in-out infinite' }}
          />
          <span className="text-xs font-medium" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>
      </div>
    </header>
  );
}
