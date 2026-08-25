import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { HistoricalPoint } from '../types/telemetry';

interface HistoricalChartsProps {
  data: HistoricalPoint[];
}

function timeTick(value: string) {
  return new Date(value).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' });
}

function ChartCard({
  title,
  data,
  dataKey,
  unit,
  color,
}: {
  title: string;
  data: HistoricalPoint[];
  dataKey: keyof HistoricalPoint;
  unit: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-display text-xs tracking-[0.15em] text-text-muted uppercase">
          {title}
        </span>
        <span className="font-mono text-xs text-text-faint">{unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#232B38" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={timeTick}
            stroke="#4A5568"
            fontSize={10}
            tickLine={false}
          />
          <YAxis stroke="#4A5568" fontSize={10} tickLine={false} width={36} />
          <Tooltip
            labelFormatter={(v) => new Date(v).toLocaleTimeString()}
            contentStyle={{ background: '#1A212C', border: '1px solid #232B38', borderRadius: 8 }}
            itemStyle={{ color: '#E8ECF2' }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={`url(#grad-${dataKey})`}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HistoricalCharts({ data }: HistoricalChartsProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-line bg-panel p-6 text-sm text-text-muted">
        Waiting for enough live data to plot trends...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <ChartCard title="Engine Temp" data={data} dataKey="engineTempC" unit="°C" color="#FFB020" />
      <ChartCard title="Battery" data={data} dataKey="batteryVoltage" unit="V" color="#3DDC97" />
      <ChartCard title="RPM" data={data} dataKey="rpm" unit="rpm" color="#4FA8FF" />
    </div>
  );
}
