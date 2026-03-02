'use client';
import { useState, useEffect, useId, useCallback, useRef } from 'react';
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
    <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 shadow-2xl rounded-xl px-4 py-3" style={{ minWidth: 160 }}>
      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2.5 text-sm">
          <span className="w-2 h-2 rounded-full ring-1 ring-white/10" style={{ background: p.color }} />
          <span className="text-xs text-zinc-400 font-medium">Revenue</span>
          <span className="ml-auto text-sm font-bold text-zinc-100 tabular-nums">{fmt(p.value)}</span>
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
    <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 shadow-2xl rounded-xl px-4 py-3" style={{ minWidth: 160 }}>
      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2.5 line-clamp-1">{d.name}</p>
      <p className="text-sm font-bold text-zinc-100 tabular-nums">{fmt(d.value)}</p>
    </div>
  );
}

// ── Custom Pie label ─────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#e4e4e7" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function SalesReportPage() {
  const { fmt, isMounted } = useCurrency();
  const uid         = useId();
  const gradSalesId = `gradSalesRev-${uid}`;
  const [data,       setData]       = useState(null);
  const [loaded,     setLoaded]     = useState(false);
  const [error,      setError]      = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const reportRef = useRef(null);

  const safeFmt = (v) => (isMounted ? fmt(v) : String(v));
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    setLoaded(false);
    setError(false);
    api.get('/reports/sales')
      .then((res) => { setData(res.data); })
      .catch((err) => { console.error('[SalesReport]', err); setError(true); })
      .finally(() => { setLoaded(true); });
  }, [refreshKey]);

  const dailyRevenue      = data?.dailyRevenue      ?? [];
  const revenueByCategory = data?.revenueByCategory ?? [];

  // ── PDF Export ──────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!reportRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      const [{ default: domtoimage }, { jsPDF }] = await Promise.all([
        import('dom-to-image-more'),
        import('jspdf'),
      ]);

      // dom-to-image-more perfectly captures CSS filters like backdrop-blur and lab/oklch colors
      // We set a fixed zinc-900 background just in case the container is transparent
      const imgData = await domtoimage.toPng(reportRef.current, {
        bgcolor: '#18181b', // tailwind zinc-900
        quality: 1.0,
        // Double the scale for crisp text on retina displays
        width: reportRef.current.clientWidth * 2,
        height: reportRef.current.clientHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: `${reportRef.current.clientWidth}px`,
          height: `${reportRef.current.clientHeight}px`,
        }
      });

      const pdf      = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const PAGE_W   = 297;
      const PAGE_H   = 210;
      const ML       = 14;
      const MT_body  = 32;

      // Header block
      pdf.setFillColor(26, 26, 46);
      pdf.rect(0, 0, PAGE_W, 22, 'F');
      pdf.setFillColor(99, 102, 241); // indigo strip
      pdf.rect(0, 22, PAGE_W, 1, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Sales Analytics Report', ML, 14);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(180, 180, 220);
      const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      pdf.text(`Generated: ${timestamp}`, PAGE_W - ML, 14, { align: 'right' });

      // Calculate image dimensions to fit the page block
      const imgProps  = pdf.getImageProperties(imgData);
      const aspectRatio = imgProps.width / imgProps.height;
      const imgW      = PAGE_W - ML * 2;
      const imgH      = imgW / aspectRatio;

      pdf.addImage(imgData, 'PNG', ML, MT_body, imgW, Math.min(imgH, PAGE_H - MT_body - 10));

      // Footer
      pdf.setFillColor(26, 26, 46);
      pdf.rect(0, PAGE_H - 8, PAGE_W, 8, 'F');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(160, 160, 200);
      pdf.text('Generated by Stockenza · stockenza.co.in', PAGE_W / 2, PAGE_H - 3, { align: 'center' });

      pdf.save(`Sales_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('[SalesPDF]', err);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Page header toolbar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-zinc-100 tracking-tight">Sales Analytics</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Revenue trends and category breakdowns</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={!loaded}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-3.5 h-3.5 ${!loaded ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loaded ? 'Refresh' : 'Loading…'}
          </button>

          {/* Download PDF */}
          <button
            onClick={downloadPDF}
            disabled={pdfLoading || !loaded || error}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/40 shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfLoading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating PDF…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
                </svg>
                Download Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Charts grid (captured by dom-to-image-more) ── */}
      <div ref={reportRef} className="grid gap-6 lg:grid-cols-2 p-1">

        {/* ── 1. Revenue Over Time (AreaChart) ───────────────────────────── */}
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
                  <linearGradient id={gradSalesId} x1="0" y1="0" x2="0" y2="1">
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
                <Tooltip content={<AreaTooltip fmt={isMounted ? fmt : (v) => String(v)} />} cursor={{ fill: 'rgba(255,255,255,0.02)', strokeWidth: 0 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill={`url(#${gradSalesId})`}
                  dot={false}
                  activeDot={{ r: 4, fill: '#6366f1', stroke: '#09090b', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ── 2. Revenue by Category (PieChart) ──────────────────────────── */}
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
                  stroke="#18181b" // zinc-900 border between slices
                  strokeWidth={2}
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
    </div>
  );
}
