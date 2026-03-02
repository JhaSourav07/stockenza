'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
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

// ── Premium Valuation Tooltip ─────────────────────────────────────────────────
function BarTooltip({ active, payload, label, fmt, prefix }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 rounded-xl px-4 py-3 shadow-2xl"
      style={{ minWidth: 160 }}
    >
      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2.5">
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/10"
            style={{ background: p.fill }}
          />
          <span className="text-xs text-zinc-400 font-medium">{prefix || p.name}</span>
          <span className="ml-auto text-sm font-bold text-zinc-100 tabular-nums">
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Premium Low-Stock Tooltip ─────────────────────────────────────────────────
function LowStockTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const qty    = payload[0].value;
  const colour = qty <= 2 ? '#f43f5e' : qty <= 5 ? '#f59e0b' : '#38bdf8';
  const urgency = qty <= 2 ? 'Critical' : qty <= 5 ? 'Low' : 'Watch';
  return (
    <div
      className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 rounded-xl px-4 py-3 shadow-2xl"
      style={{ minWidth: 160 }}
    >
      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2.5 truncate max-w-[140px]">
        {label}
      </p>
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/10" style={{ background: colour }} />
        <span className="text-xs text-zinc-400 font-medium">Stock</span>
        <span className="ml-auto text-sm font-bold text-zinc-100 tabular-nums">{qty} units</span>
      </div>
      <div className="flex items-center justify-end">
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{ color: colour, background: `${colour}1a`, border: `1px solid ${colour}44` }}
        >
          {urgency}
        </span>
      </div>
    </div>
  );
}

// Truncate long names on the horizontal bar chart Y-axis
function truncate(str, n = 16) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function InventoryReportPage() {
  const { fmt, isMounted } = useCurrency();
  const [data,        setData]        = useState(null);
  const [loaded,      setLoaded]      = useState(false);
  const [error,       setError]       = useState(false);
  const [pdfLoading,  setPdfLoading]  = useState(false);
  const [refreshKey,  setRefreshKey]  = useState(0);

  const reportRef = useRef(null);

  const safeFmt = (v) => (isMounted ? fmt(v) : String(v));
  const refresh  = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    setLoaded(false);
    setError(false);
    api.get('/reports/inventory')
      .then((res) => { setData(res.data); })
      .catch(() => { setError(true); })
      .finally(() => { setLoaded(true); });
  }, [refreshKey]);

  const valuationByCategory = data?.valuationByCategory ?? [];
  const lowStockItems       = data?.lowStockItems       ?? [];

  // ── PDF Export ──────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!reportRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(reportRef.current, {
        scale:           2,           // 2× for retina sharpness
        useCORS:         true,
        backgroundColor: '#18181b',   // zinc-900
        logging:         false,
      });

      const imgData  = canvas.toDataURL('image/png');
      const pdf      = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const PAGE_W   = 297;           // A4 landscape width
      const PAGE_H   = 210;           // A4 landscape height
      const ML       = 14;
      const MT_body  = 32;            // leave room for the header

      // ── Header bar ──
      pdf.setFillColor(26, 26, 46);
      pdf.rect(0, 0, PAGE_W, 22, 'F');

      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 22, PAGE_W, 1, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Inventory Health Report', ML, 14);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(180, 180, 220);
      const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      pdf.text(`Generated: ${timestamp}`, PAGE_W - ML, 14, { align: 'right' });

      // ── Chart image ──
      const aspectRatio = canvas.width / canvas.height;
      const imgW        = PAGE_W - ML * 2;
      const imgH        = imgW / aspectRatio;
      const yOffset     = MT_body;

      pdf.addImage(imgData, 'PNG', ML, yOffset, imgW, Math.min(imgH, PAGE_H - yOffset - 10));

      // ── Footer ──
      pdf.setFillColor(26, 26, 46);
      pdf.rect(0, PAGE_H - 8, PAGE_W, 8, 'F');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(160, 160, 200);
      pdf.text('Generated by Stockenza · stockenza.co.in', PAGE_W / 2, PAGE_H - 3, { align: 'center' });

      pdf.save(`Inventory_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('[InventoryPDF]', err);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Page header toolbar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-zinc-100 tracking-tight">Inventory Health</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Stock valuation and depletion risk overview</p>
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

      {/* ── Charts grid (captured by html2canvas) ── */}
      <div ref={reportRef} className="grid gap-6 lg:grid-cols-2 p-1">

        {/* ── 1. Inventory Valuation by Category (vertical BarChart) ─────── */}
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
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
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

        {/* ── 2. Top-5 Low Stock Items (horizontal BarChart) ───────────── */}
        <ChartCard
          title="Top 5 Low Stock Items"
          subtitle="Items closest to depletion (quantity > 0)"
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
                <Tooltip
                  content={<LowStockTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {lowStockItems.map((item, i) => {
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
    </div>
  );
}
