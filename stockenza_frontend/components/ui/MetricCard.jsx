import Skeleton from './Skeleton';

/**
 * Tiny inline sparkline rendered as a pure SVG polyline.
 * `data` is an array of numbers; both axes are normalised to a 40×20 box.
 */
function Sparkline({ data, positive }) {
  if (!data || data.length < 2) return null;

  const w = 52, h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const color = positive ? '#34d399' : '#f87171'; // emerald-400 / red-400

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden="true">
      <polyline
        points={pts}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </svg>
  );
}

/**
 * Trend badge: shows "+5.2%" in green or "-1.4%" in red.
 */
function TrendBadge({ trend }) {
  if (trend === null || trend === undefined || isNaN(trend)) return null;
  const positive = trend >= 0;
  const sign     = positive ? '+' : '';

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
        positive
          ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
          : 'text-red-400 bg-red-400/10 border-red-400/20'
      }`}
    >
      {positive ? (
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      )}
      {sign}{Math.abs(trend).toFixed(1)}%
    </span>
  );
}

export default function MetricCard({
  label, value, sub, color, icon, delay = 0, loaded,
  trend,      // optional: number (e.g. 5.2 or -1.4)
  sparkline,  // optional: number[]
}) {
  const trendPositive = trend !== null && trend !== undefined && trend >= 0;

  return (
    <div
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3"
      style={{ animation: `fadeIn 0.5s ${delay}ms cubic-bezier(0.16,1,0.3,1) both` }}
    >
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
          {icon}
        </div>
      </div>

      {/* Value row */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          {loaded ? (
            <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
          ) : (
            <Skeleton className="h-8 w-32" />
          )}
          {/* Trend badge */}
          {loaded && trend !== undefined && <TrendBadge trend={trend} />}
        </div>

        {/* Sparkline (top-right area of value row) */}
        {loaded && sparkline && sparkline.length >= 2 && (
          <div className="flex-shrink-0 opacity-80">
            <Sparkline data={sparkline} positive={trendPositive} />
          </div>
        )}
      </div>

      {/* Sub-label */}
      {sub && (
        <p className="text-xs text-zinc-400">{sub}</p>
      )}
    </div>
  );
}