'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useCurrency } from '../../../context/CurrencyContext';
import {
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

// ── Colour palette for the PieChart ─────────────────────────────────────────
const PIE_COLOURS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4'];

// ── Shared card wrapper ──────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
      {subtitle && <p className="text-xs text-zinc-500 mt-0.5 mb-5">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return <div className="h-56 w-full rounded-lg bg-zinc-800 animate-pulse" />;
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div className="h-56 flex flex-col items-center justify-center gap-3 text-zinc-600">
      <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Custom Area tooltip ──────────────────────────────────────────────────────
function AreaTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-zinc-500 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-400">Revenue:</span>
          <span className="font-semibold text-zinc-100">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Custom Pie tooltip ───────────────────────────────────────────────────────
function PieTooltip({ active, payload, fmt }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-zinc-500 mb-1">{d.name}</p>
      <p className="text-sm font-semibold text-zinc-100">{fmt(d.value)}</p>
    </div>
  );
}

// ── Custom Pie label ─────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#e4e4e7" textAnchor="middle" dominantBaseline="central" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function SalesReportPage() {
  const { fmt, isMounted } = useCurrency();
  const [data,   setData]   = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  const safeFmt = (v) => (isMounted ? fmt(v) : String(v));

  useEffect(() => {
    setLoaded(false);
    setError(false);
    api.get('/reports/sales')
      .then((res) => { setData(res.data); })
      .catch(() => { setError(true); })
      .finally(() => { setLoaded(true); });
  }, []);

  const dailyRevenue      = data?.dailyRevenue      ?? [];
  const revenueByCategory = data?.revenueByCategory ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {/* ── 1. Revenue Over Time (AreaChart) ─────────────────────────────── */}
      <ChartCard
        title="Revenue Over Time"
        subtitle="Daily revenue for the last 30 days"
      >
        {!loaded ? (
          <Skeleton />
        ) : error ? (
          <EmptyState message="Could not load sales data." />
        ) : dailyRevenue.length === 0 ? (
          <EmptyState message="No orders recorded in the last 30 days." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyRevenue} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradSalesRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={safeFmt}
                width={80}
              />
              <Tooltip content={<AreaTooltip fmt={isMounted ? fmt : (v) => String(v)} />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#gradSalesRev)"
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1', stroke: '#09090b', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ── 2. Revenue by Category (PieChart) ────────────────────────────── */}
      <ChartCard
        title="Revenue by Category"
        subtitle="Which product categories generate the most revenue"
      >
        {!loaded ? (
          <Skeleton />
        ) : error ? (
          <EmptyState message="Could not load sales data." />
        ) : revenueByCategory.length === 0 ? (
          <EmptyState message="No category data available yet." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={revenueByCategory}
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={42}
                dataKey="value"
                labelLine={false}
                label={PieLabel}
              >
                {revenueByCategory.map((_, i) => (
                  <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip fmt={isMounted ? fmt : (v) => String(v)} />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: '#a1a1aa', fontSize: 12 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

    </div>
  );
}
