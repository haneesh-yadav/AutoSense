interface GaugeWidgetProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  decimals?: number;
  /** value at which the gauge starts reading as a caution zone */
  warnAt?: number;
  /** value at which the gauge reads as a critical zone */
  criticalAt?: number;
}

// Sweep matches a real automotive dial: ~250 degrees, starting bottom-left.
const START_ANGLE = -125;
const END_ANGLE = 125;
const SWEEP = END_ANGLE - START_ANGLE;

function valueToAngle(value: number, min: number, max: number) {
  const clamped = Math.min(max, Math.max(min, value));
  const ratio = (clamped - min) / (max - min);
  return START_ANGLE + ratio * SWEEP;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function GaugeWidget({
  label,
  value,
  min,
  max,
  unit,
  decimals = 0,
  warnAt,
  criticalAt,
}: GaugeWidgetProps) {
  const cx = 100;
  const cy = 100;
  const radius = 78;
  const needleAngle = valueToAngle(value, min, max);

  const isCritical = criticalAt !== undefined && value >= criticalAt;
  const isWarn = !isCritical && warnAt !== undefined && value >= warnAt;
  const needleColor = isCritical
    ? 'var(--color-signal-critical)'
    : isWarn
      ? 'var(--color-signal-warn)'
      : 'var(--color-signal-data)';

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle = START_ANGLE + (i / 10) * SWEEP;
    const outer = polarToCartesian(cx, cy, radius, angle);
    const inner = polarToCartesian(cx, cy, radius - (i % 5 === 0 ? 12 : 7), angle);
    return { outer, inner, major: i % 5 === 0 };
  });

  const needleTip = polarToCartesian(cx, cy, radius - 20, needleAngle);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 200 190" className="w-full max-w-[190px]">
        {/* base track */}
        <path
          d={arcPath(cx, cy, radius, START_ANGLE, END_ANGLE)}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* active arc up to current value */}
        <path
          d={arcPath(cx, cy, radius, START_ANGLE, needleAngle)}
          fill="none"
          stroke={needleColor}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.8}
        />
        {/* ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.inner.x}
            y1={t.inner.y}
            x2={t.outer.x}
            y2={t.outer.y}
            stroke="var(--color-text-faint)"
            strokeWidth={t.major ? 1.5 : 1}
          />
        ))}
        {/* needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={needleColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <circle cx={cx} cy={cy} r={4} fill={needleColor} />

        {/* digital readout */}
        <text
          x={cx}
          y={cy + 40}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="26"
          fontWeight={600}
          fill="var(--color-text-primary)"
        >
          {value.toFixed(decimals)}
        </text>
        <text
          x={cx}
          y={cy + 58}
          textAnchor="middle"
          fontFamily="var(--font-body)"
          fontSize="11"
          fill="var(--color-text-muted)"
        >
          {unit}
        </text>
      </svg>
      <span className="font-display text-xs tracking-[0.15em] text-text-muted uppercase">
        {label}
      </span>
    </div>
  );
}
