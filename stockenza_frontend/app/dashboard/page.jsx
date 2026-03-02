'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import { useCurrency } from '../../context/CurrencyContext';

import { useCountUp } from '../../hooks/useCountUp';
import MetricCard from '../../components/ui/MetricCard';
import RevenueProfitChart from '../../app/dashboard/RevenueProfitChart';
import PnLTable from '../../app/dashboard/PnLTable';

const DATE_RANGES = [
  { label: 'Today',    value: 'today'    },
  { label: '7 Days',   value: '7days'    },
  { label: '30 Days',  value: '30days'   },
  { label: '1 Year',   value: '1year'    },
  { label: 'All Time', value: 'all-time' },
];

/**
 * Returns { startDate, endDate } ISO strings for the CURRENT period
 * and { prevStart, prevEnd } for the PREVIOUS period of the same duration.
 */
function getDateRange(range) {
  if (range === 'all-time') {
    return { startDate: null, endDate: null, prevStart: null, prevEnd: null };
  }

  const now   = new Date();
  const end   = new Date(now);
  const start = new Date(now);

  if (range === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (range === '7days')  { start.setDate(start.getDate() - 7); }
  else if (range === '30days') { start.setDate(start.getDate() - 30); }
  else if (range === '1year')  { start.setFullYear(start.getFullYear() - 1); }

  // Duration in ms → shift back to get previous window
  const durationMs = end.getTime() - start.getTime();
  const prevEnd    = new Date(start.getTime() - 1);         // 1 ms before current start
  const prevStart  = new Date(prevEnd.getTime() - durationMs);

  return {
    startDate: start.toISOString(),
    endDate:   end.toISOString(),
    prevStart: prevStart.toISOString(),
    prevEnd:   prevEnd.toISOString(),
  };
}

function buildQs({ startDate, endDate }) {
  if (!startDate || !endDate) return '';
  return `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
}

/** pct change helper; returns null if denominator is 0 */
function pctChange(current, previous) {
  if (!previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * "14:00" → "2 PM"  |  "00:00" → "12 AM"  |  "12:00" → "12 PM"
 */
function formatHourLabel(hourKey) {
  const h = parseInt(hourKey, 10);
  if (h === 0)  return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

/**
 * Converts backend { granularity, data } into Recharts-ready rows.
 */
function transformChartData(granularity, rawData, dateRange) {
  if (granularity === 'hour') {
    return rawData.map((d) => ({ ...d, month: formatHourLabel(d.date) }));
  }

  if (dateRange === '7days') {
    return rawData.map((d) => {
      const dt = new Date(d.date + 'T00:00:00');
      return { ...d, month: dt.toLocaleString('en-US', { month: 'short', day: 'numeric' }) };
    });
  }

  // Monthly aggregation for 30days / 1year / all-time
  const buckets = {};
  rawData.forEach((d) => {
    const dt      = new Date(d.date + 'T00:00:00Z');
    const key     = dt.toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    const sortKey = dt.getUTCFullYear() * 100 + dt.getUTCMonth();
    if (!buckets[key]) buckets[key] = { month: key, revenue: 0, profit: 0, _sortKey: sortKey };
    buckets[key].revenue += d.revenue;
    buckets[key].profit  += d.profit;
  });

  return Object.values(buckets)
    .sort((a, b) => a._sortKey - b._sortKey)
    .map(({ _sortKey, ...rest }) => ({
      ...rest,
      revenue: Math.round(rest.revenue * 100) / 100,
      profit:  Math.round(rest.profit  * 100) / 100,
    }));
}

export default function DashboardPage() {
  const { fmt, isMounted } = useCurrency();
  const [dateRange, setDateRange] = useState('30days');

  const [inventory,    setInventory]    = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [prevSummary,  setPrevSummary]  = useState(null);
  const [chartData,    setChartData]    = useState([]);
  const [pnlRows,      setPnlRows]      = useState([]);
  const [loaded,       setLoaded]       = useState(false);

  const fetchAll = useCallback(async () => {
    setLoaded(false);
    try {
      const dates  = getDateRange(dateRange);
      const qs     = buildQs({ startDate: dates.startDate, endDate: dates.endDate });
      const prevQs = buildQs({ startDate: dates.prevStart, endDate: dates.prevEnd });

      const requests = [
        api.get('/inventory'),
        api.get(`/reports/summary${qs}`),
        api.get(`/reports/chart${qs}`),
        api.get(`/reports/pnl${qs}`),
      ];

      // Only fetch previous period if a real date range is set
      if (prevQs) {
        requests.push(api.get(`/reports/summary${prevQs}`));
      }

      const [invRes, summaryRes, chartRes, pnlRes, prevSummaryRes] = await Promise.all(requests);

      setInventory(invRes.data);
      setSummary(summaryRes.data);
      setPrevSummary(prevSummaryRes?.data ?? null);
      setPnlRows(pnlRes.data);

      const { granularity, data: rawChart } = chartRes.data;
      setChartData(transformChartData(granularity, rawChart, dateRange));

    } catch (e) { console.error(e); }
    finally     { setLoaded(true); }
  }, [dateRange]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalRevenue = summary?.totalRevenue   ?? 0;
  const totalProfit  = summary?.totalProfit    ?? 0;
  const stockValue   = summary?.inventoryValue ?? 0;
  const orderCount   = summary?.orderCount     ?? 0;
  const totalCost    = pnlRows.reduce((s, r) => s + r.cost, 0);

  const prevRevenue  = prevSummary?.totalRevenue  ?? 0;
  const prevProfit   = prevSummary?.totalProfit   ?? 0;
  const prevOrders   = prevSummary?.orderCount    ?? 0;

  // Period-over-period % change (null if previous period has no data or all-time)
  const revenueTrend = pctChange(totalRevenue, prevRevenue);
  const profitTrend  = pctChange(totalProfit,  prevProfit);
  const orderTrend   = pctChange(orderCount,   prevOrders);

  // Sparkline data: last N revenue data points from the chart
  const sparklineData = chartData.length >= 2 ? chartData.map((d) => d.revenue) : null;

  const lowStockItems = inventory.filter((i) => i.quantity > 0 && i.quantity <= 5);
  const outOfStock    = inventory.filter((i) => i.quantity === 0);

  const animRevenue = useCountUp(totalRevenue, 1200, loaded);
  const animProfit  = useCountUp(totalProfit,  1200, loaded);
  const animStock   = useCountUp(stockValue,   1200, loaded);

  const chartSubtitle =
    dateRange === 'today'  ? 'Hourly performance breakdown'  :
    dateRange === '7days'  ? 'Daily performance breakdown'   :
                             'Monthly performance breakdown';

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Business overview &amp; analytics</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
            {DATE_RANGES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDateRange(value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  dateRange === value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isMounted && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-500">
              <span>Currency</span>
              <span className="font-semibold text-zinc-300">
                {fmt(0).replace(/[\d,.\s]/g, '').trim() || '…'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total revenue"
          value={isMounted ? fmt(animRevenue) : '—'}
          sub={`${orderCount} orders`}
          color="text-indigo-400"
          delay={0}
          loaded={loaded && isMounted}
          trend={revenueTrend}
          sparkline={sparklineData}
          icon={<svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <MetricCard
          label="Net profit"
          value={isMounted ? fmt(animProfit) : '—'}
          sub={totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin` : 'No sales yet'}
          color={totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}
          delay={80}
          loaded={loaded && isMounted}
          trend={profitTrend}
          icon={<svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <MetricCard
          label="Stock value"
          value={isMounted ? fmt(animStock) : '—'}
          sub={`${inventory.length} products tracked`}
          color="text-violet-400"
          delay={160}
          loaded={loaded && isMounted}
          icon={<svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
        <MetricCard
          label="Alerts"
          value={`${lowStockItems.length + outOfStock.length}`}
          sub={`${outOfStock.length} out of stock · ${lowStockItems.length} low`}
          color={outOfStock.length > 0 ? 'text-red-400' : lowStockItems.length > 0 ? 'text-amber-400' : 'text-emerald-400'}
          delay={240}
          loaded={loaded}
          trend={orderTrend}
          icon={<svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
      </div>

      <RevenueProfitChart
        loaded={loaded}
        chartData={chartData}
        fmt={fmt}
        isMounted={isMounted}
        subtitle={chartSubtitle}
        dateRange={dateRange}
      />

      <PnLTable
        loaded={loaded}
        pnlRows={pnlRows}
        isMounted={isMounted}
        fmt={fmt}
        totalRevenue={totalRevenue}
        totalCost={totalCost}
        totalProfit={totalProfit}
      />
    </AppLayout>
  );
}