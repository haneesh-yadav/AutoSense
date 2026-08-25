interface HealthScoreProps {
  score: number;
}

function scoreColor(score: number) {
  if (score >= 80) return 'var(--color-signal-good)';
  if (score >= 50) return 'var(--color-signal-warn)';
  return 'var(--color-signal-critical)';
}

function scoreLabel(score: number) {
  if (score >= 80) return 'Healthy';
  if (score >= 50) return 'Needs Attention';
  return 'Critical';
}

export function HealthScore({ score }: HealthScoreProps) {
  const color = scoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-line bg-panel p-6">
      <span className="font-display text-xs tracking-[0.15em] text-text-muted uppercase">
        Vehicle Health Score
      </span>
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx={60} cy={60} r={54} fill="none" stroke="var(--color-line)" strokeWidth={8} />
          <circle
            cx={60}
            cy={60}
            r={54}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 500ms ease' }}
          />
        </svg>
        <span
          className="absolute font-mono text-4xl font-semibold"
          style={{ color }}
        >
          {Math.round(score)}
        </span>
      </div>
      <span className="text-sm font-medium" style={{ color }}>
        {scoreLabel(score)}
      </span>
    </div>
  );
}
