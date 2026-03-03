'use client';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const STEPS = [
  {
    num: '01',
    title: 'Add your products',
    body: 'Enter your inventory items — name, cost price, selling price, and stock level. Takes about 30 seconds per product, or import a spreadsheet.',
    time: '⏱ ~30 seconds',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'from-indigo-500 to-indigo-600',
    ringColor: 'rgba(99,102,241,0.2)',
    glowTop: 'rgba(99,102,241,0.3)',
  },
  {
    num: '02',
    title: 'Record your sales',
    body: 'Log orders as they come in. Stockenza automatically decrements your stock and calculates your profit per transaction in real time.',
    time: '⚡ Instant sync',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: 'from-violet-500 to-violet-600',
    ringColor: 'rgba(139,92,246,0.2)',
    glowTop: 'rgba(139,92,246,0.3)',
  },
  {
    num: '03',
    title: 'Watch your dashboard',
    body: 'Your analytics update instantly. See revenue trends, profit per product, inventory value, and alerts for low-stock items — all live.',
    time: '📊 Real-time',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'from-emerald-500 to-emerald-600',
    ringColor: 'rgba(34,197,94,0.2)',
    glowTop: 'rgba(34,197,94,0.3)',
  },
  {
    num: '04',
    title: 'Make smarter decisions',
    body: 'Use real profit data — not guesswork — to decide what to restock, which products to push, and where to cut costs.',
    time: '🧠 Always current',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'from-amber-500 to-amber-600',
    ringColor: 'rgba(245,158,11,0.2)',
    glowTop: 'rgba(245,158,11,0.3)',
  },
];

export default function HowItWorks() {
  const [ref,    inView]    = useInView(0.1); // steps grid
  const [hdrRef, hdrInView] = useInView(0.1); // header + CTA

  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* Radial glow behind steps (only when inView) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: inView ? 1 : 0,
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div ref={hdrRef} className="text-center mb-20">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium mb-4"
            style={{ opacity: hdrInView ? 1 : 0, animation: hdrInView ? 'fadeUp 0.5s both' : 'none' }}
          >
            How it works
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-5"
            style={{ opacity: hdrInView ? 1 : 0, animation: hdrInView ? 'fadeUp 0.55s 80ms both' : 'none' }}
          >
            Up and running in
            <span className="gradient-text"> minutes.</span>
          </h2>
          <p
            className="text-lg text-zinc-500 max-w-xl mx-auto"
            style={{ opacity: hdrInView ? 1 : 0, animation: hdrInView ? 'fadeUp 0.55s 160ms both' : 'none' }}
          >
            No onboarding calls. No manual. Just four simple steps to full business visibility.
          </p>
        </div>

        {/* Steps grid */}
        <div ref={ref} className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Animated gradient connector line (desktop) */}
          <div className="absolute hidden lg:block top-[52px] left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-px z-0"
            style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4), rgba(34,197,94,0.4))' }}
          >
            {/* Travelling beam dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{
                background: 'radial-gradient(circle, #818cf8, rgba(99,102,241,0.3))',
                boxShadow: '0 0 8px rgba(99,102,241,0.8)',
                animation: 'beamTravel 4s ease-in-out infinite',
              }}
            />
          </div>

          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative group"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView
                  ? 'translateY(0) rotateX(0deg)'
                  : 'translateY(32px) rotateX(8deg)',
                perspective: '800px',
                transition: `opacity 0.55s ease ${i * 130}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 130}ms`,
              }}
            >
              <div
                className="relative z-10 rounded-2xl p-6 h-full transition-all duration-300 cursor-default overflow-hidden"
                style={{
                  background: 'rgba(24,24,27,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.07), 0 -2px 20px ${step.glowTop}, 0 16px 40px rgba(0,0,0,0.4)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)';
                }}
              >
                {/* Watermark number */}
                <div
                  className="absolute -right-2 -top-2 text-[96px] font-black leading-none select-none pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.07]"
                  style={{ opacity: 0.04, color: '#fff', lineHeight: 1 }}
                >
                  {step.num}
                </div>

                {/* Icon with dual-ring pulse */}
                <div className="mb-5 relative inline-block">
                  {/* Outer pulse ring */}
                  <div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      boxShadow: `0 0 0 1px ${step.ringColor}`,
                      animation: 'ringPulse 3s ease-in-out infinite',
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                  <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                    {step.icon}
                  </div>
                </div>

                <h3 className="font-semibold text-zinc-200 mb-2 text-base relative z-10">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-4 relative z-10">{step.body}</p>

                {/* Time chip */}
                <span className="inline-block bg-zinc-800 text-zinc-500 text-[10px] rounded-full px-2.5 py-1 relative z-10">
                  {step.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA band */}
        <div
          className="mt-14 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ opacity: hdrInView ? 1 : 0, animation: hdrInView ? 'fadeUp 0.55s 200ms both' : 'none' }}
        >
          <div>
            <p className="text-zinc-200 font-semibold text-base">Ready to see it live?</p>
            <p className="text-zinc-500 text-sm mt-0.5">Set up your account in under 3 minutes — no card needed.</p>
          </div>
          <Link
            href="/register"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 hover:-translate-y-px transition-all duration-200 shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-[0_0_36px_rgba(99,102,241,0.6)]"
          >
            Get started — it&apos;s free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes beamTravel {
          0%   { left: 0%;   opacity: 0; }
          10%  { opacity: 1;            }
          90%  { opacity: 1;            }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.18); opacity: 1;   }
        }
      `}</style>
    </section>
  );
}