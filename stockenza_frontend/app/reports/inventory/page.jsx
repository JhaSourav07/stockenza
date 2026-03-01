'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { useCurrency } from '../../../context/CurrencyContext';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Cell,
  ResponsiveContainer,
} from 'recharts';

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
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Custom tooltip (shared) ──────────────────────────────────────────────────
function BarTooltip({ active, payload, label, fmt, prefix }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-zinc-500 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-zinc-400">{prefix || p.name}:</span>
          <span className="font-semibold text-zinc-100">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Low-stock tooltip (shows raw qty) ───────────────────────────────────────
function LowStockTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-zinc-500 mb-2">{label}</p>
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-zinc-400">Quantity:</span>
        <span className="font-semibold text-zinc-100">{payload[0].value} units</span>
      </div>
    </div>
  );
}

// Truncate long names on the horizontal bar chart Y-axis
function truncate(str, n = 16) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function InventoryReportPage() {
  const { fmt, isMounted } = useCurrency();
  const [data,   setData]   = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  const safeFmt = (v) => (isMounted ? fmt(v) : String(v));

  useEffect(() => {
    setLoaded(false);
    setError(false);
    api.get('/reports/inventory')
      .then((res) => { setData(res.data); })
      .catch(() => { setError(true); })
      .finally(() => { setLoaded(true); });
  }, []);

  const valuationByCategory = data?.valuationByCategory ?? [];
  const lowStockItems       = data?.lowStockItems       ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {/* ── 1. Inventory Valuation by Category (vertical BarChart) ───────── */}
      <ChartCard
        title="Inventory Valuation by Category"
        subtitle="Total monetary value of unsold stock grouped by category"
      >
        {!loaded ? (
          <Skeleton />
        ) : error ? (
          <EmptyState message="Could not load inventory data." />
        ) : valuationByCategory.length === 0 ? (
          <EmptyState message="No inventory items found." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={valuationByCategory}
              margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
              barSize={28}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                tickFormatter={(v) => truncate(v, 12)}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={safeFmt}
                width={80}
              />
              <Tooltip
                content={
                  <BarTooltip
                    fmt={isMounted ? fmt : (v) => String(v)}
                    prefix="Value"
                  />
                }
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {valuationByCategory.map((_, i) => (
                  <Cell key={i} fill="#10b981" fillOpacity={0.85 - i * 0.08} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ── 2. Top-5 Low Stock Items (horizontal BarChart) ───────────────── */}
      <ChartCard
        title="Top 5 Low Stock Items"
        subtitle="Items closest to depletion (quantity &gt; 0)"
      >
        {!loaded ? (
          <Skeleton />
        ) : error ? (
          <EmptyState message="Could not load inventory data." />
        ) : lowStockItems.length === 0 ? (
          <EmptyState message="All items are well stocked." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              layout="vertical"
              data={lowStockItems}
              margin={{ top: 5, right: 20, bottom: 0, left: 0 }}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={110}
                tickFormatter={(v) => truncate(v, 16)}
              />
              <Tooltip content={<LowStockTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {lowStockItems.map((item, i) => {
                  // Colour by urgency: very low (≤2) = rose, low (≤5) = amber, else sky
                  const colour =
                    item.value <= 2 ? '#f43f5e' :
                    item.value <= 5 ? '#f59e0b' : '#38bdf8';
                  return <Cell key={i} fill={colour} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

    </div>
  );
}
