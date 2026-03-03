"use client";
import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   useInView hook (preserved)
───────────────────────────────────────────── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─────────────────────────────────────────────
   STATS array (preserved)
───────────────────────────────────────────── */
const STATS = [
  { value: 500,  suffix: "+",  label: "Businesses",    desc: "trust Stockenza daily",    from: "#6366f1", to: "#818cf8" },
  { value: 2.4,  suffix: "M+", label: "Orders tracked", desc: "and counting",             from: "#10b981", to: "#34d399" },
  { value: 99.9, suffix: "%",  label: "Uptime",         desc: "guaranteed SLA",           from: "#8b5cf6", to: "#a78bfa" },
  { value: 3,    suffix: "min",label: "Setup time",     desc: "to your first insight",    from: "#f59e0b", to: "#fbbf24" },
];

/* ─────────────────────────────────────────────
   AnimatedStat (preserved + enhanced)
───────────────────────────────────────────── */
function AnimatedStat({ value, suffix, label, desc, inView, from, to, index }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const isDecimal = value % 1 !== 0;
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const current = isDecimal
        ? parseFloat((value * ease).toFixed(1))
        : Math.round(value * ease);
      setDisplay(current);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <div
      className="relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 overflow-hidden"
      style={{
        animation: inView
          ? `statCardIn 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 100}ms both`
          : "none",
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-full"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
      />
      {/* Faint inner glow */}
      <div
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full blur-2xl opacity-20"
        style={{ background: from }}
      />
      <p
        className="text-5xl font-bold text-zinc-100 tracking-tight tabular-nums"
        style={{ fontVariantNumeric: "tabular-nums", fontFeatureSettings: '"tnum"' }}
      >
        {display}
        <span style={{ background: `linear-gradient(90deg, ${from}, ${to})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {suffix}
        </span>
      </p>
      <p className="text-sm font-semibold text-zinc-300 mt-2">{label}</p>
      <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>
      {/* Decorative sparkline bars */}
      <div className="flex items-end gap-0.5 h-4 mt-3 opacity-40">
        {[30, 55, 40, 70, 60, 85, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background: `linear-gradient(to top, ${from}, ${to})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SparklineBar — mini chart for terminal
───────────────────────────────────────────── */
function SparkBar({ color, cycle }) {
  const bars = [45, 60, 35, 75, 55, 80];
  return (
    <div className="flex items-end gap-0.5 h-6">
      {bars.map((h, i) => (
        <div
          key={`${cycle}-${i}`}
          className="w-1.5 rounded-sm"
          style={{
            height: `${h}%`,
            backgroundColor: color,
            animation: `barRise 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Feature cards data
───────────────────────────────────────────── */
const FEATURES = [
  {
    icon: "📦",
    title: "Live inventory intelligence",
    body: "Always know what you have, what's running low, and what's tying up capital. Stockenza tracks every unit in real time so you never oversell or over-order.",
    accent: "#6366f1",
    borderClass: "border-l-indigo-500/60",
    dotColor: "bg-indigo-400",
    glowColor: "rgba(99,102,241,0.12)",
  },
  {
    icon: "💸",
    title: "Profit, not just revenue",
    body: "Most tools show you revenue. We show you profit. For every product, every order, every day — so you know which products actually make you money.",
    accent: "#8b5cf6",
    borderClass: "border-l-violet-500/60",
    dotColor: "bg-violet-400",
    glowColor: "rgba(139,92,246,0.12)",
  },
  {
    icon: "⚡",
    title: "Instant setup, zero friction",
    body: "No spreadsheets to migrate. No consultants. Sign up, add your products, and your dashboard is live in under 3 minutes. Seriously.",
    accent: "#10b981",
    borderClass: "border-l-emerald-500/60",
    dotColor: "bg-emerald-400",
    glowColor: "rgba(16,185,129,0.12)",
  },
];

/* ─────────────────────────────────────────────
   HeadlineWords — staggered word entrance
   (must be module-level so React doesn't
    remount it on every parent render)
───────────────────────────────────────────── */
function HeadlineWords({ text, className = "", baseDelay = 0 }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className={`inline-block ${className}`}
          style={{
            animation: `fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) ${baseDelay + i * 70}ms both`,
          }}
        >
          {word}&nbsp;
        </span>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   Main About Component
───────────────────────────────────────────── */
export default function About() {
  const [ref, inView] = useInView(0.2);

  /* Live metrics state */
  const [metrics, setMetrics] = useState([
    { label: "Gross Margin",    base: 68,   value: 68,   unit: "%",  color: "#10b981", delta: "+2.1%", up: true  },
    { label: "Avg Order Value", base: 142,  value: 142,  unit: "$",  color: "#6366f1", delta: "+1.4%", up: true  },
    { label: "Items in Stock",  base: 1204, value: 1204, unit: "",   color: "#8b5cf6", delta: "▼0.4%",  up: false },
  ]);
  const [sparkCycle, setSparkCycle] = useState(0);
  const [syncTime, setSyncTime] = useState(2);

  /* Cursor blink text */
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  /* Nudge live metrics every 3.5 s */
  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          const pct = (Math.random() * 4 - 2) / 100; // ±2%
          const nudge = m.base * pct;
          const next = m.unit === "%"
            ? parseFloat((m.value + nudge).toFixed(1))
            : Math.round(m.value + nudge * 10);
          const up = nudge >= 0;
          return {
            ...m,
            value: next,
            up,
            delta: `${up ? "▲" : "▼"} ${Math.abs(pct * 100).toFixed(1)}%`,
          };
        }),
      );
      setSparkCycle((c) => c + 1);
      setSyncTime(0);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  /* Sync timer */
  useEffect(() => {
    const id = setInterval(() => setSyncTime((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);


  return (
    <section id="about" className="py-32 relative overflow-hidden">

      {/* ── Rotating radial grid ── */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{ transformOrigin: "center", animation: "gridRotate 60s linear infinite" }}
      >
        <div
          className="w-[1000px] h-[1000px] rounded-full"
          style={{
            background: `
              repeating-conic-gradient(
                rgba(99,102,241,0.04) 0deg 1deg,
                transparent 1deg 15deg
              )
            `,
          }}
        />
      </div>

      {/* ── Aurora blobs ── */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "auroraBlob 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "auroraBlob 18s ease-in-out 5s infinite",
        }}
      />

      {/* ── Horizontal scan line ── */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 30%, rgba(139,92,246,0.5) 70%, transparent 100%)",
          animation: "scanLine 8s ease-in-out infinite",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* ── Header ── */}
        <div className="text-center mb-16">
          {/* Shimmer badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-700/60 text-zinc-400 text-xs font-medium mb-5 relative overflow-hidden shimmer-badge"
            style={{ background: "rgba(24,24,27,0.8)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "terminalBlink 1s step-end infinite" }} />
            Platform Overview
          </div>

          {/* Staggered headline */}
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
            <span className="block">
              <HeadlineWords text="Everything your business needs," className="text-zinc-100" baseDelay={50} />
            </span>
            <span className="block mt-1">
              <HeadlineWords text="nothing it" className="text-zinc-100" baseDelay={300} />
              <span
                className="inline-block"
                style={{
                  background: "linear-gradient(90deg, #818cf8, #a78bfa, #6ee7b7, #818cf8)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradientShift 4s linear infinite",
                  animationDelay: "0.5s",
                }}
              >
                &nbsp;doesn&apos;t.
              </span>
            </span>
          </h2>

          <p
            className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed"
            style={{ animation: "fadeUp 0.6s 0.6s both" }}
          >
            Stockenza is a unified business intelligence platform for product-based
            businesses. It connects your inventory, sales, and finances into one
            real-time view — so you always know exactly where you stand.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-24">

          {/* Left: Glassmorphism feature cards */}
          <div className="space-y-5">
            {FEATURES.map((item, i) => (
              <div
                key={item.title}
                className="feature-card group relative flex gap-4 p-5 rounded-xl border-l-2 transition-all duration-300 cursor-default overflow-hidden"
                style={{
                  backdropFilter: "blur(8px)",
                  background: "rgba(24,24,27,0.4)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${item.accent}55`,
                  animation: `fadeUp 0.5s ${i * 130}ms both`,
                  "--accent": item.accent,
                  "--glow": item.glowColor,
                }}
              >
                {/* Hover glow fill */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
                  style={{ background: `radial-gradient(ellipse at 20% 50%, ${item.glowColor}, transparent 70%)` }}
                />

                {/* Pulse dot top-right */}
                <div
                  className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${item.dotColor}`}
                  style={{ animation: "accentPulse 2.4s ease-in-out infinite" }}
                />

                {/* Icon */}
                <span
                  className="text-2xl shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 inline-block"
                >
                  {item.icon}
                </span>

                <div>
                  <h3 className="font-semibold text-zinc-200 mb-1 text-sm">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Live metrics terminal */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "#09090b",
              border: "1px solid rgba(63,63,70,0.8)",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.6), 0 24px 60px rgba(0,0,0,0.5)",
              animation: "fadeUp 0.6s 0.35s both",
            }}
          >
            {/* CRT scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.08) 1px, rgba(0,0,0,0.08) 2px)",
              }}
            />

            {/* Terminal title bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-4 font-mono text-xs text-zinc-400">
                live_metrics.exe{" "}
                <span
                  className="text-indigo-400"
                  style={{ opacity: cursorVisible ? 1 : 0, transition: "opacity 0.05s" }}
                >
                  ▋
                </span>
              </span>
            </div>

            {/* Metric rows */}
            <div className="p-5 space-y-4">
              {metrics.map((m, i) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: "rgba(39,39,42,0.5)",
                    border: "1px solid rgba(63,63,70,0.5)",
                  }}
                >
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500 mb-1 font-mono">{m.label}</p>
                    <p
                      className="text-2xl font-bold tabular-nums transition-all duration-500"
                      style={{ color: m.color, fontVariantNumeric: "tabular-nums" }}
                    >
                      {m.unit === "$" ? "$" : ""}{typeof m.value === "number" && m.unit === "%" ? m.value.toFixed(1) : m.value.toLocaleString()}{m.unit === "%" ? "%" : ""}
                    </p>
                    <span
                      className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        background: m.up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        color: m.up ? "#34d399" : "#f87171",
                      }}
                    >
                      {m.delta}
                    </span>
                  </div>
                  <div className="ml-4">
                    <SparkBar color={m.color} cycle={sparkCycle} />
                  </div>
                </div>
              ))}
            </div>

            {/* Status bar */}
            <div className="px-5 py-2.5 border-t border-zinc-800/60 flex items-center gap-3 font-mono text-[10px] text-zinc-600">
              <span><span className="text-emerald-500">●</span> LIVE</span>
              <span>|</span>
              <span>Synced {syncTime}s ago</span>
              <span>|</span>
              <span>3 active sessions</span>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div
          ref={ref}
          className="relative"
        >
          {/* Radial glow behind stats */}
          <div
            className="absolute inset-0 -z-10 pointer-events-none transition-opacity duration-700"
            style={{
              opacity: inView ? 1 : 0,
              background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.06), transparent)",
            }}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-12 border-t border-zinc-800/60">
            {STATS.map((s, i) => (
              <AnimatedStat key={s.label} {...s} inView={inView} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes auroraBlob {
          0%   { transform: translate(0,0)      scale(1);    opacity: 0.7; }
          33%  { transform: translate(30px,-25px) scale(1.07); opacity: 1;   }
          66%  { transform: translate(-20px,15px) scale(0.95); opacity: 0.8; }
          100% { transform: translate(0,0)      scale(1);    opacity: 0.7; }
        }
        @keyframes gridRotate {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes scanLine {
          0%   { top: -2px;    opacity: 0; }
          10%  { opacity: 1;              }
          90%  { opacity: 0.6;            }
          100% { top: 100%;    opacity: 0; }
        }
        @keyframes terminalBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes gradientShift {
          from { background-position: 0%   center; }
          to   { background-position: 200% center; }
        }
        @keyframes barRise {
          from { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
          to   { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
        }
        @keyframes statCardIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes accentPulse {
          0%,100% { opacity: 0.4; transform: scale(1);   }
          50%      { opacity: 1;   transform: scale(1.4); }
        }
        /* Badge shimmer */
        .shimmer-badge::after {
          content: "";
          position: absolute;
          top: 0; left: -60%; width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
          transform: skewX(-20deg);
          animation: badgeShimmer 3s ease-in-out infinite;
        }
        @keyframes badgeShimmer {
          0%   { left: -60%; }
          100% { left: 140%; }
        }
        /* Feature card hover border + glow */
        .feature-card:hover {
          border-color: rgba(255,255,255,0.1) !important;
          box-shadow: 0 0 0 1px var(--accent, #6366f1)33;
        }
      `}</style>
    </section>
  );
}
