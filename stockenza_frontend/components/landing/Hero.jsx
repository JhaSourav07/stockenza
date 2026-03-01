"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ── Animated mini chart bars ── */
function MiniChart() {
  const bars = [40, 65, 45, 80, 60, 90, 75, 95, 70, 88, 78, 100];
  return (
    <div className="flex items-end gap-1 h-12">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-indigo-500/70"
          style={{
            height: `${h}%`,
            animation: `barRise 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Animated counter ── */
function Counter({ target, prefix = "", suffix = "", duration = 1800 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / (duration / 16);
      const tick = () => {
        start = Math.min(start + step, target);
        setValue(Math.floor(start));
        if (start < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── Floating stat card ── */
function FloatCard({ children, className = "" }) {
  return (
    <div
      className={[
        "absolute bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 rounded-xl px-4 py-3",
        "shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* ── Ambient glows ── */}
      <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] -translate-x-1/2 rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />

      {/* ── Dot grid ── */}
      <div className="absolute inset-0 dot-grid opacity-[0.35] pointer-events-none" />

      {/* ── Hero content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6"
          style={{ animation: "fadeIn 0.5s 0.1s both" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Now in public beta — free forever for small teams
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
          style={{ animation: "fadeIn 0.6s 0.2s both" }}
        >
          <span className="text-zinc-100">The operating</span>
          <br />
          <span className="gradient-text">system for your</span>
          <br />
          <span className="text-zinc-100">business.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ animation: "fadeIn 0.6s 0.35s both" }}
        >
          Stockenza gives you a live pulse on your inventory, orders, and profit
          — all in one beautifully simple dashboard. Stop guessing. Start
          growing.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
          style={{ animation: "fadeIn 0.6s 0.5s both" }}
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-200"
          >
            Start for free
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800/60 text-zinc-300 font-medium text-sm border border-zinc-700 hover:bg-zinc-700/60 hover:border-zinc-600 hover:-translate-y-0.5 transition-all duration-200"
          >
            See how it works
          </a>
        </div>

        {/* ── Dashboard mockup ── */}
        <div
          className="relative mx-auto max-w-4xl"
          style={{ animation: "heroCardIn 0.8s 0.6s both" }}
        >
          {/* Main card */}
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/80">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="ml-4 flex-1 max-w-xs mx-auto">
                <div className="bg-zinc-800 rounded-md px-3 py-1 text-xs text-zinc-500 text-center">
                  www.stockenza.co.in/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6">
              {/* Stat row */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  {
                    label: "Total Revenue",
                    value: "$48,290",
                    color: "text-indigo-400",
                    up: true,
                  },
                  {
                    label: "Net Profit",
                    value: "$12,840",
                    color: "text-emerald-400",
                    up: true,
                  },
                  {
                    label: "Inventory Value",
                    value: "$31,500",
                    color: "text-violet-400",
                    up: false,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50"
                  >
                    <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p
                      className={`text-xs mt-1 ${s.up ? "text-emerald-500" : "text-red-400"}`}
                    >
                      {s.up ? "↑ 12.4%" : "↓ 3.1%"} vs last month
                    </p>
                  </div>
                ))}
              </div>

              {/* Chart area */}
              <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/30">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-zinc-300">
                    Profit Trend
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Revenue
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2" />
                    Profit
                  </div>
                </div>
                <MiniChart />
              </div>

              {/* Table preview */}
              <div className="mt-4 space-y-2">
                {[
                  { name: "Wireless Headphones", stock: 42, profit: "+$840" },
                  { name: "Mechanical Keyboard", stock: 18, profit: "+$620" },
                  { name: "USB-C Hub", stock: 7, profit: "+$290" },
                ].map((row, i) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/30 border border-zinc-800/60"
                    style={{ animation: `fadeIn 0.4s ${0.8 + i * 0.1}s both` }}
                  >
                    <span className="text-xs text-zinc-300 font-medium">
                      {row.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.stock < 10 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}
                    >
                      {row.stock} in stock
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {row.profit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Floating cards ── */}
          <FloatCard
            className="-top-5 -left-8 hidden lg:block"
            style={{ animation: "float 6s ease-in-out infinite" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  Revenue up
                </p>
                <p className="text-xs text-emerald-400">+24% this week</p>
              </div>
            </div>
          </FloatCard>

          <FloatCard className="-bottom-5 -right-8 hidden lg:block">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  3 items low stock
                </p>
                <p className="text-xs text-indigo-400">Restock suggested</p>
              </div>
            </div>
          </FloatCard>
        </div>

        {/* Social proof */}
        <div
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-600"
          style={{ animation: "fadeIn 0.6s 1.1s both" }}
        >
          <span className="flex items-center gap-2">
            <span className="flex -space-x-2">
              {[
                "bg-indigo-500",
                "bg-violet-500",
                "bg-emerald-500",
                "bg-amber-500",
              ].map((c, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full ${c} border-2 border-zinc-950 flex items-center justify-center text-[9px] font-bold text-white`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </span>
            Trusted by 500+ businesses
          </span>
          <span className="hidden sm:block w-px h-4 bg-zinc-800" />
          <span className="flex items-center gap-1.5">
            {"★★★★★".split("").map((s, i) => (
              <span key={i} className="text-amber-400 text-xs">
                {s}
              </span>
            ))}
            <span className="ml-1">4.9/5 rating</span>
          </span>
          <span className="hidden sm:block w-px h-4 bg-zinc-800" />
          <span>No credit card required</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes heroCardIn {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes barRise {
          from {
            transform: scaleY(0);
            transform-origin: bottom;
            opacity: 0;
          }
          to {
            transform: scaleY(1);
            transform-origin: bottom;
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
