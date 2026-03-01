import { useId } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from '../../components/ui/Skeleton';

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-zinc-500 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-400 capitalize">{p.dataKey}:</span>
          <span className="font-semibold text-zinc-100">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
// Fix #7 — context-aware message per date range instead of one generic string
function EmptyState({ dateRange }) {
  const message =
    dateRange === 'today'  ? 'No orders today — check back after your first sale' :
    dateRange === '7days'  ? 'No orders in the last 7 days'                       :
    dateRange === '30days' ? 'No orders in the last 30 days'                      :
    dateRange === '1year'  ? 'No orders in the last year'                         :
                             'No orders yet — make your first sale to see trends';

  return (
    <div className="h-52 flex flex-col items-center justify-center gap-2 text-zinc-600">
      <svg
        className="w-8 h-8 opacity-30"
        fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
/**
 * Props:
 *   loaded     {boolean}  — whether data has finished loading
 *   chartData  {Array}    — transformed chart rows with { month, revenue, profit }
 *   fmt        {Function} — currency formatter from useCurrency()
 *   isMounted  {boolean}  — from useCurrency(); guards pre-hydration flash
 *   subtitle   {string}   — "Daily performance breakdown" | "Monthly performance breakdown"
 *   dateRange  {string}   — current range key, used for empty-state messaging
 */
export default function RevenueProfitChart({
  loaded,
  chartData,
  fmt,
  isMounted,
  subtitle,
  dateRange,
}) {
  // Fix #8 — unique SVG gradient IDs per component instance.
  // Global IDs in SVG <defs> are shared across the entire DOM, so if this
  // component is ever rendered twice (modal, comparison view, etc.) the second
  // instance steals the gradient from the first, breaking both visually.
  const uid       = useId();
  const gradRevId = `gradRevenue-${uid}`;
  const gradProId = `gradProfit-${uid}`;

  // Fix #4 — safe formatter that never returns an empty string before hydration.
  // CurrencyContext.fmt() intentionally returns '' pre-mount to prevent a flash
  // of the wrong currency symbol. But Recharts renders the YAxis immediately,
  // so a blank formatter causes invisible tick labels on first paint.
  // Falling back to a plain number keeps the axis readable during that window.
  const safeFmt = (v) => {
    if (!isMounted) return String(v);
    return fmt(v) || String(v);
  };

  // Same guard for the tooltip formatter
  const tooltipFmt = isMounted ? fmt : (v) => String(v);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Revenue &amp; Profit</h2>
          {/* Fix #1 — dynamic subtitle driven by dateRange from parent */}
          <p className="text-xs text-zinc-600 mt-0.5">
            {subtitle ?? 'Performance breakdown'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Profit
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      {!loaded ? (
        <Skeleton className="h-52 w-full" />

      ) : chartData.length === 0 ? (
        // Fix #7 — date-range-aware empty state message
        <EmptyState dateRange={dateRange} />

      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>

            {/* Fix #8 — instance-scoped gradient IDs via useId() */}
            <defs>
              <linearGradient id={gradRevId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id={gradProId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

            {/* Fix #3 — preserveStartEnd prevents label crowding/overlap
                on large datasets (30 days = 30 ticks, 1 year = 12 ticks) */}
            <XAxis
              dataKey="month"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            {/* Fix #5 — width={90} instead of 70 to avoid clipping wide
                currency formats like ₹1,23,456 or € 12.840,00 (de-DE)   */}
            {/* Fix #4 — safeFmt never returns empty string pre-hydration  */}
            <YAxis
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={safeFmt}
              width={90}
            />

            <Tooltip content={<CustomTooltip fmt={tooltipFmt} />} />

            {/* Fix #6 — explicit activeDot styling so the hover indicator
                matches the dark theme instead of Recharts' default blue */}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              fill={`url(#${gradRevId})`}
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1', stroke: '#09090b', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2}
              fill={`url(#${gradProId})`}
              dot={false}
              activeDot={{ r: 4, fill: '#10b981', stroke: '#09090b', strokeWidth: 2 }}
            />

          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}