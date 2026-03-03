"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   MiniChart — re-animates on a 4 s loop
───────────────────────────────────────────── */
function MiniChart() {
  const bars = [40, 65, 45, 80, 60, 90, 75, 95, 70, 88, 78, 100];
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-end gap-1 h-12">
      {bars.map((h, i) => (
        <div
          key={`${cycle}-${i}`}
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

/* ─────────────────────────────────────────────
   Counter — counts up when it enters viewport
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   FloatCard — bobs with CSS animation
───────────────────────────────────────────── */
function FloatCard({ children, className = "", delay = "0s" }) {
  return (
    <div
      className={[
        "absolute bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 rounded-xl px-4 py-3",
        "shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
        className,
      ].join(" ")}
      style={{ animation: `floatBob 3.6s ease-in-out ${delay} infinite` }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   HeadlineWord — staggered fade-up per word
───────────────────────────────────────────── */
function HeadlineWords({ text, className = "", baseDelay = 0 }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span
          key={i}
          className={`inline-block ${className}`}
          style={{
            animation: `fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) ${baseDelay + i * 60}ms both`,
          }}
        >
          {word}&nbsp;
        </span>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   Main Hero
───────────────────────────────────────────── */
export default function Hero() {
  const mockupRef = useRef(null);

  /* Perspective tilt on scroll */
  useEffect(() => {
    const el = mockupRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrolled = window.scrollY;
      const tilt = Math.max(0, 6 - scrolled * 0.03);
      el.style.transform = `perspective(1200px) rotateX(${tilt}deg)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const avatars = [
    { initials: "AK", from: "#6366f1", to: "#8b5cf6" },
    { initials: "BM", from: "#8b5cf6", to: "#7c3aed" },
    { initials: "CR", from: "#10b981", to: "#059669" },
    { initials: "DS", from: "#f59e0b", to: "#d97706" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">

      {/* ── Aurora blobs ── */}
      <div
        className="absolute top-[8%] left-[12%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "auroraBlob 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[4%] right-[8%] w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "auroraBlob 14s ease-in-out 3s infinite",
        }}
      />
      <div
        className="absolute top-[42%] left-[48%] w-[380px] h-[380px] -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "auroraBlob 10s ease-in-out 6s infinite",
        }}
      />

      {/* ── Animated scanline grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          animation: "gridDrift 20s linear infinite",
        }}
      />

      {/* ── Hero content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6"
          style={{ animation: "fadeUp 0.5s 0.05s both" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Now in public beta — free forever for small teams
        </div>

        {/* Headline — word-by-word stagger */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          <span className="block">
            <HeadlineWords text="The operating" className="text-zinc-100" baseDelay={100} />
          </span>
          <span className="block">
            <HeadlineWords text="system for your" className="animated-gradient-text" baseDelay={280} />
          </span>
          <span className="block">
            <HeadlineWords text="business." className="text-zinc-100" baseDelay={460} />
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ animation: "fadeUp 0.6s 0.65s both" }}
        >
          Stockenza gives you a live pulse on your inventory, orders, and profit
          — all in one beautifully simple dashboard. Stop guessing. Start growing.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
          style={{ animation: "fadeUp 0.6s 0.8s both" }}
        >
          <Link
            href="/register"
            className="shimmer-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm"
          >
            Start for free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
          style={{
            animation: "heroCardIn 0.9s 0.9s both",
            willChange: "transform",
          }}
        >
          {/* Tilt wrapper */}
          <div ref={mockupRef} style={{ transformOrigin: "center bottom", transition: "transform 0.1s linear" }}>

            {/* Top edge glow line */}
            <div
              className="absolute -top-px left-1/4 right-1/4 h-px pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(139,92,246,0.8), transparent)",
              }}
            />

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

                {/* Stat row — Counter components */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Total Revenue",    target: 48290, prefix: "$", color: "text-indigo-400", up: true  },
                    { label: "Net Profit",        target: 12840, prefix: "$", color: "text-emerald-400", up: true  },
                    { label: "Inventory Value",   target: 31500, prefix: "$", color: "text-violet-400",  up: false },
                  ].map((s) => (
                    <div key={s.label} className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
                      <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                      <p className={`text-xl font-bold ${s.color}`}>
                        <Counter target={s.target} prefix={s.prefix} duration={1800} />
                      </p>
                      <p className={`text-xs mt-1 ${s.up ? "text-emerald-500" : "text-red-400"}`}>
                        {s.up ? "↑ 12.4%" : "↓ 3.1%"} vs last month
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-zinc-300">Profit Trend</p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />Revenue
                      <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2" />Profit
                    </div>
                  </div>
                  <MiniChart />
                </div>

                {/* Table rows — shimmer scan */}
                <div className="mt-4 space-y-2">
                  {[
                    { name: "Wireless Headphones", stock: 42, profit: "+$840" },
                    { name: "Mechanical Keyboard",  stock: 18, profit: "+$620" },
                    { name: "USB-C Hub",             stock: 7,  profit: "+$290" },
                  ].map((row, i) => (
                    <div
                      key={row.name}
                      className="shimmer-row relative flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/30 border border-zinc-800/60 overflow-hidden"
                      style={{ animation: `fadeUp 0.4s ${0.8 + i * 0.1}s both` }}
                    >
                      <span className="text-xs text-zinc-300 font-medium">{row.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.stock < 10 ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                        {row.stock} in stock
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">{row.profit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Floating cards ── */}
          <FloatCard className="-top-5 -left-8 hidden lg:block" delay="0s">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">Revenue up</p>
                <p className="text-xs text-emerald-400">+24% this week</p>
              </div>
            </div>
          </FloatCard>

          <FloatCard className="-bottom-5 -right-8 hidden lg:block" delay="1.8s">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">3 items low stock</p>
                <p className="text-xs text-indigo-400">Restock suggested</p>
              </div>
            </div>
          </FloatCard>
        </div>

        {/* ── Social proof bar ── */}
        <div
          className="mt-12 pt-6 border-t border-zinc-800/40 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-600"
          style={{ animation: "fadeUp 0.6s 1.3s both" }}
        >
          <span className="flex items-center gap-2">
            <span className="flex -space-x-2">
              {avatars.map((av, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${av.from}, ${av.to})` }}
                >
                  {av.initials}
                </div>
              ))}
            </span>
            Trusted by 500+ businesses
          </span>
          <span className="hidden sm:block w-px h-4 bg-zinc-800" />
          <span className="flex items-center gap-1.5">
            {"★★★★★".split("").map((s, i) => (
              <span key={i} className="text-amber-400 text-xs">{s}</span>
            ))}
            <span className="ml-1">4.9/5 rating</span>
          </span>
          <span className="hidden sm:block w-px h-4 bg-zinc-800" />
          <span>No credit card required</span>
        </div>
      </div>

      {/* ── Global keyframes ── */}
      <style jsx global>{`
        /* ── Entrance ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        @keyframes heroCardIn {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* ── MiniChart bar ── */
        @keyframes barRise {
          from { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
          to   { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
        }

        /* ── Aurora blobs ── */
        @keyframes auroraBlob {
          0%   { transform: translate(0px, 0px)   scale(1);    opacity: 0.7; }
          33%  { transform: translate(40px, -30px) scale(1.08); opacity: 1;   }
          66%  { transform: translate(-20px, 20px) scale(0.95); opacity: 0.8; }
          100% { transform: translate(0px, 0px)   scale(1);    opacity: 0.7; }
        }

        /* ── Grid drift ── */
        @keyframes gridDrift {
          from { background-position: 0 0; }
          to   { background-position: 48px 48px; }
        }

        /* ── FloatCard bob ── */
        @keyframes floatBob {
          0%,100% { transform: translateY(0px);  }
          50%      { transform: translateY(-7px); }
        }

        /* ── Animated gradient headline text ── */
        .animated-gradient-text {
          background: linear-gradient(90deg, #818cf8, #a78bfa, #6ee7b7, #818cf8);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 5s linear infinite;
        }
        @keyframes gradientShift {
          from { background-position: 0% center;   }
          to   { background-position: 300% center; }
        }

        /* ── Shimmer CTA button ── */
        .shimmer-btn {
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 24px rgba(99,102,241,0.4);
          transition: box-shadow 0.2s, transform 0.2s;
          animation: btnGlow 2.4s ease-in-out infinite;
        }
        .shimmer-btn:hover {
          box-shadow: 0 0 44px rgba(99,102,241,0.65);
          transform: translateY(-2px);
        }
        .shimmer-btn::after {
          content: "";
          position: absolute;
          top: 0; left: -75%;
          width: 50%; height: 100%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%);
          transform: skewX(-20deg);
          transition: left 0.5s;
        }
        .shimmer-btn:hover::after {
          left: 130%;
          transition: left 0.5s ease;
        }
        @keyframes btnGlow {
          0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.35); }
          50%      { box-shadow: 0 0 36px rgba(99,102,241,0.65); }
        }

        /* ── Table shimmer scan ── */
        .shimmer-row::before {
          content: "";
          position: absolute;
          top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
          animation: shimmerScan 3.5s ease-in-out infinite;
        }
        @keyframes shimmerScan {
          0%   { left: -80%; }
          100% { left: 160%; }
        }
      `}</style>
    </section>
  );
}
