'use client';
import { useRef, useEffect, useState, useCallback } from 'react';

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Counter (for Reports card) ── */
function Counter({ target, prefix = '', suffix = '', duration = 1400 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const isDecimal = target % 1 !== 0;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(isDecimal ? parseFloat((target * ease).toFixed(1)) : Math.floor(target * ease));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{prefix}{typeof val === 'number' ? val.toLocaleString() : val}{suffix}</span>;
}

const ACCENT_COLORS = {
  indigo:  { icon: 'bg-indigo-500/15 text-indigo-400', tag: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',  topBar: 'rgba(99,102,241,0.7)',  dot: '#818cf8' },
  violet:  { icon: 'bg-violet-500/15 text-violet-400',  tag: 'bg-violet-500/10 text-violet-400 border-violet-500/20',   topBar: 'rgba(139,92,246,0.7)', dot: '#a78bfa' },
  emerald: { icon: 'bg-emerald-500/15 text-emerald-400',tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',topBar: 'rgba(34,197,94,0.7)',  dot: '#34d399' },
  amber:   { icon: 'bg-amber-500/15 text-amber-400',    tag: 'bg-amber-500/10 text-amber-400 border-amber-500/20',     topBar: 'rgba(245,158,11,0.7)', dot: '#fbbf24' },
};

/* ── Live Inventory Visual ── */
function InventoryVisual() {
  const BASE = [['Wireless Headset', 42, 80], ['Keyboard Pro', 8, 15], ['USB Hub X3', 97, 100]];
  const [vals, setVals] = useState(BASE.map(([, v]) => v));
  useEffect(() => {
    const id = setInterval(() => {
      setVals(prev => prev.map((v, i) => {
        const nudge = Math.round((Math.random() * 14 - 7));
        return Math.max(1, Math.min(BASE[i][2], v + nudge));
      }));
    }, 5000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-2.5 mt-4">
      {BASE.map(([name, , max], i) => {
        const v = vals[i];
        const low = v < 15;
        return (
          <div key={name}>
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>{name}</span>
              <span className={low ? 'text-red-400' : 'text-zinc-400'}>{v} units</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${low ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${(v / max) * 100}%`, transition: 'width 0.8s ease' }}
              />
            </div>
            {low && (
              <p className="text-[10px] text-red-400 mt-0.5" style={{ animation: 'lowStockFlicker 1.5s ease-in-out infinite' }}>
                ⚠ Low stock
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Live Orders Visual ── */
const ORDER_POOL = [
  { id: '#4824', name: 'ANC Headphones', rev: '$249', profit: '+$78' },
  { id: '#4823', name: 'Mech Keyboard',  rev: '$189', profit: '+$52' },
  { id: '#4822', name: 'USB Hub X3',     rev: '$59',  profit: '+$18' },
  { id: '#4821', name: 'Webcam Pro',     rev: '$129', profit: '+$41' },
  { id: '#4820', name: 'Headset X',      rev: '$79',  profit: '+$28' },
  { id: '#4819', name: 'Magic Mouse',    rev: '$99',  profit: '+$34' },
];

function OrdersVisual() {
  const [orders, setOrders] = useState(ORDER_POOL.slice(2, 5));
  const [newKey, setNewKey] = useState(null);
  useEffect(() => {
    let idx = 0;
    const id = setInterval(() => {
      const next = ORDER_POOL[idx % ORDER_POOL.length];
      idx++;
      setOrders(prev => [next, ...prev.slice(0, 2)]);
      setNewKey(next.id);
      setTimeout(() => setNewKey(null), 600);
    }, 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-1.5 mt-4 overflow-hidden">
      {orders.map(({ id, name, rev, profit }) => (
        <div
          key={id}
          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg"
          style={{
            background: 'rgba(39,39,42,0.5)',
            animation: id === newKey ? 'orderSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) both' : 'none',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-zinc-600 font-mono">{id}</span>
          </div>
          <span className="text-zinc-300 truncate max-w-[80px]">{name}</span>
          <span className="text-zinc-500">{rev}</span>
          <span className="text-emerald-400 font-semibold">{profit}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Analytics chart — re-triggers on scroll ── */
function AnalyticsVisual() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [fired, setFired] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired) { setVisible(true); setFired(true); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [fired]);

  const BARS = [30, 55, 42, 70, 58, 85, 72, 90, 78, 95, 84, 100];
  const H = 56;
  const W = 8;
  const gap = 4;
  const points = BARS.map((h, i) => `${i * (W + gap) + W / 2},${H - (h / 100) * H}`).join(' ');

  return (
    <div ref={ref} className="mt-4 relative">
      <div className="flex items-end gap-1 h-14 relative">
        {BARS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: visible ? `${h}%` : '0%',
              background: `rgba(34,197,94,${0.3 + (h / 100) * 0.5})`,
              transition: `height 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms`,
            }}
          />
        ))}
        {/* SVG polyline overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
          viewBox={`0 0 ${BARS.length * (W + gap)} ${H}`}
        >
          <polyline
            points={points}
            fill="none"
            stroke="rgba(34,197,94,0.4)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/* ── Reports visual ── */
function ReportsVisual() {
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-4 space-y-2">
      {[
        { label: 'Total Revenue',    target: 48290, prefix: '$', color: 'text-zinc-200' },
        { label: 'Net Profit',       target: 12840, prefix: '$', color: 'text-emerald-400' },
        { label: 'Inventory Value',  target: 31500, prefix: '$', color: 'text-indigo-400' },
      ].map(({ label, target, prefix, color }) => (
        <div key={label} className="flex justify-between text-xs py-2 border-b border-zinc-800/60">
          <span className="text-zinc-500">{label}</span>
          <span className={`font-bold tabular-nums ${color}`}>
            <Counter target={target} prefix={prefix} />
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 pt-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
          style={{ opacity: blink ? 1 : 0.2, transition: 'opacity 0.3s' }}
        />
        <span className="text-[10px] text-zinc-700">Last updated: just now</span>
      </div>
    </div>
  );
}

const TABS = ['All', 'Inventory', 'Orders', 'Analytics', 'Reports'];
const TAB_MAP = { Inventory: 'indigo', Orders: 'violet', Analytics: 'emerald', Reports: 'amber' };

const FEATURES = [
  {
    title: 'Inventory Management',
    desc: 'Track every SKU in real time. Get low-stock alerts before you run out. Know your total inventory value at a glance.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    accent: 'indigo',
    tab: 'Inventory',
    tags: ['Stock levels', 'Low-stock alerts', 'Cost tracking'],
    Visual: InventoryVisual,
  },
  {
    title: 'Order Processing',
    desc: 'Log a sale in seconds. Stock auto-decrements. Profit auto-calculates. Your order history is always up to date.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    accent: 'violet',
    tab: 'Orders',
    tags: ['Auto stock sync', 'Order history', 'Fast entry'],
    Visual: OrdersVisual,
  },
  {
    title: 'Profit Analytics',
    desc: 'See revenue vs profit over time. Break down performance by product. Know your margins with precision.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    accent: 'emerald',
    tab: 'Analytics',
    tags: ['Revenue trends', 'Margin analysis', 'Product P&L'],
    Visual: AnalyticsVisual,
  },
  {
    title: 'Business Reports',
    desc: 'Instant summary of total revenue, net profit, and inventory value. The numbers you actually need to run your business.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    accent: 'amber',
    tab: 'Reports',
    tags: ['Summary stats', 'Date filtering', 'Export ready'],
    Visual: ReportsVisual,
  },
];

export default function Features() {
  const [ref, inView] = useInView(0.1);
  const [activeTab, setActiveTab] = useState('All');
  const [tabUnderX, setTabUnderX] = useState(0);
  const tabRefs = useRef([]);

  const filtered = activeTab === 'All'
    ? FEATURES
    : FEATURES.filter(f => f.tab === activeTab);

  const handleTab = (tab, idx) => {
    setActiveTab(tab);
    const el = tabRefs.current[idx];
    if (el) setTabUnderX(el.offsetLeft);
  };

  // Bento layout: 0 → full, 1+2 → half, 3 → full
  const spanClass = (i, total) => {
    if (total === 1) return 'col-span-2';
    if (total === 4 && (i === 0 || i === 3)) return 'col-span-2';
    return 'col-span-1';
  };

  return (
    <section id="features" className="py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-5">
            Built for how businesses
            <span className="gradient-text"> actually work.</span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-8">
            Four core modules. Infinite visibility. Zero learning curve.
          </p>

          {/* Tab switcher */}
          <div className="relative inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                ref={el => { tabRefs.current[idx] = el; }}
                onClick={() => handleTab(tab, idx)}
                className={[
                  'relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 z-10',
                  activeTab === tab ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300',
                ].join(' ')}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute inset-0 rounded-lg bg-zinc-700/80 -z-10" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bento grid */}
        <div ref={ref} className="grid grid-cols-2 gap-5">
          {filtered.map((f, i) => {
            const c = ACCENT_COLORS[f.accent];
            const span = spanClass(i, filtered.length);
            return (
              <div
                key={f.title}
                className={`${span} group relative rounded-2xl overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1`}
                style={{
                  background: 'rgba(24,24,27,0.5)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(63,63,70,0.8)',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${i * 100}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms, box-shadow 0.3s`,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px ${c.topBar}`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Top gradient accent line */}
                <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${c.topBar}, transparent)` }} />

                <div className="p-6">
                  <div className="flex items-start gap-4 mb-3">
                    {/* Rotated icon */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-0 ${c.icon}`}
                      style={{ transform: 'rotate(3deg)' }}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-100 text-base mb-1">{f.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {f.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-transform duration-150 hover:scale-105 ${c.tag}`}
                      >
                        <span className="w-1 h-1 rounded-full" style={{ background: c.dot }} />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Live visual */}
                  <f.Visual />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes lowStockFlicker {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        @keyframes orderSlideIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
      `}</style>
    </section>
  );
}