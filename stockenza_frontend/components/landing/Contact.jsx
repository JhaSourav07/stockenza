'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const SUBJECTS = ['General Inquiry', 'Pricing', 'Feature Request', 'Bug Report', 'Partnership'];
const MAX_CHARS = 500;

/* ── Confetti dot ── */
function ConfettiDot({ x, y, color, delay }) {
  return (
    <div
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{
        left: '50%', top: '50%',
        background: color,
        animation: `confettiPop 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
        '--tx': `${x}px`, '--ty': `${y}px`,
      }}
    />
  );
}

const CONFETTI = [
  { x: -60, y: -50, color: '#818cf8', delay: 0   },
  { x:  60, y: -40, color: '#34d399', delay: 60  },
  { x: -40, y:  60, color: '#fbbf24', delay: 30  },
  { x:  50, y:  55, color: '#a78bfa', delay: 90  },
  { x:  -5, y: -70, color: '#f87171', delay: 45  },
  { x:  20, y:  70, color: '#6ee7b7', delay: 120 },
  { x: -70, y:  10, color: '#c084fc', delay: 15  },
  { x:  75, y:  -5, color: '#fb923c', delay: 75  },
];

const TESTIMONIALS = [
  { initials: 'AR', from: '#6366f1', to: '#818cf8', name: 'Arjun R.', stars: 5, quote: "Setup took literally 2 minutes. The profit tracking is everything." },
  { initials: 'PS', from: '#10b981', to: '#34d399', name: 'Priya S.', stars: 5, quote: "Finally understand which products actually make money." },
  { initials: 'KM', from: '#f59e0b', to: '#fbbf24', name: 'Karan M.', stars: 5, quote: "Switched from spreadsheets. Never looking back." },
];

export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [status, setStatus]   = useState('idle'); // idle | sending | sent | error
  const [focused, setFocused] = useState('');
  const [errMsg, setErrMsg]   = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrMsg('');
    try {
      await axios.post(`${API}/messages/contact`, {
        name:    form.name,
        email:   form.email,
        message: `[${form.subject}] ${form.message}`,
      });
      setStatus('sent');
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setErrMsg(msg);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const inputBase = [
    'w-full px-4 py-3 rounded-xl text-sm',
    'bg-zinc-800/50 border text-zinc-100 placeholder:text-zinc-600',
    'transition-all duration-200 outline-none',
  ].join(' ');

  const borderClass = (field) =>
    focused === field || form[field]
      ? 'border-l-2 border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.15)] bg-zinc-800'
      : 'border-zinc-700/70 hover:border-zinc-600';

  const charCount = form.message.length;

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* Atmosphere gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, transparent 50%, rgba(139,92,246,0.05) 100%)' }} />

      {/* Topographic texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.5) 28px, rgba(255,255,255,0.5) 29px), repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.5) 28px, rgba(255,255,255,0.5) 29px)',
        }}
      />

      {/* Aurora blob behind the form */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'auroraBlob 14s ease-in-out infinite' }}
      />

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* ── Left column ── */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium mb-5">
              Contact us
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-5 leading-tight">
              Have questions?
              <br />
              <span className="gradient-text">We&apos;d love to talk.</span>
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed mb-10">
              Whether you&apos;re curious about features, pricing, or want a personal walkthrough — drop us a message and we&apos;ll get back to you within 24 hours.
            </p>

            {/* Info tiles */}
            <div className="space-y-3 mb-8">
              {[
                {
                  icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
                  label: 'Email', value: 'stockenza.help@gmail.com',
                },
                {
                  icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                  label: 'Response time', value: 'Within 24 hours',
                },
                {
                  icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>,
                  label: 'Live chat', value: 'Mon–Fri, 9am–6pm',
                },
                {
                  icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
                  label: 'Build with us', value: 'Open source friendly',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] cursor-default"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:ring-1 group-hover:ring-indigo-500/30 group-hover:ring-offset-2 group-hover:ring-offset-zinc-900">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium">{item.label}</p>
                    <p className="text-sm text-zinc-300 font-medium mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof testimonials */}
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 space-y-4">
              <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium">What our users say</p>
              {TESTIMONIALS.map(({ initials, from, to, name, stars, quote }) => (
                <div key={name} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold text-zinc-300">{name}</span>
                      <span className="text-amber-400 text-[10px]">{'★'.repeat(stars)}</span>
                    </div>
                    <p className="text-xs text-zinc-500 italic">&ldquo;{quote}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: form card ── */}
          <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
            {/* Aurora blob behind card */}
            <div
              className="absolute -inset-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 70% 30%, rgba(99,102,241,0.08), transparent 60%)', filter: 'blur(20px)' }}
            />

            {/* Animated top accent bar */}
            <div
              className="h-1 w-full"
              style={{
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)',
                backgroundSize: '200% 100%',
                animation: 'gradientShift 4s linear infinite',
              }}
            />

            <div className="relative bg-zinc-900 border border-zinc-800 border-t-0 rounded-b-2xl p-7">
              {status === 'sent' ? (
                /* ── Celebration state ── */
                <div className="flex flex-col items-center justify-center py-10 text-center relative">
                  {/* Confetti dots */}
                  {CONFETTI.map((d, i) => (
                    <ConfettiDot key={i} {...d} />
                  ))}

                  {/* Animated checkmark */}
                  <div className="relative w-20 h-20 mb-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="18" stroke="rgba(52,211,153,0.2)" strokeWidth="2" />
                        <path
                          d="M11 20 L17 26 L29 14"
                          stroke="#34d399"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          strokeDasharray="30"
                          strokeDashoffset="0"
                          style={{ animation: 'strokeDraw 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
                        />
                      </svg>
                    </div>
                  </div>

                  <h3
                    className="text-xl font-bold text-zinc-100 mb-2"
                    style={{ animation: 'fadeUp 0.5s 0.3s both' }}
                  >
                    Message sent!
                  </h3>
                  <p
                    className="text-sm text-zinc-500 mb-1"
                    style={{ animation: 'fadeUp 0.5s 0.45s both' }}
                  >
                    We&apos;ll reply within 24 hours.
                  </p>
                  <p
                    className="text-xs text-zinc-700"
                    style={{ animation: 'fadeUp 0.5s 0.6s both' }}
                  >
                    Check your inbox — including spam.
                  </p>

                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    style={{ animation: 'fadeUp 0.5s 0.75s both' }}
                  >
                    Send another message →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {status === 'error' && errMsg && (
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {errMsg}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5">Full name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={set('name')}
                      onFocus={() => setFocused('name')}
                      onBlur={() => setFocused('')}
                      required
                      className={`${inputBase} ${borderClass('name')}`}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5">Email address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set('email')}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused('')}
                      required
                      className={`${inputBase} ${borderClass('email')}`}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5">Subject</label>
                    <select
                      value={form.subject}
                      onChange={set('subject')}
                      onFocus={() => setFocused('subject')}
                      onBlur={() => setFocused('')}
                      className={`${inputBase} ${borderClass('subject')}`}
                      style={{ colorScheme: 'dark' }}
                    >
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Message + char counter */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Message</label>
                      <span className={`text-[10px] tabular-nums ${charCount > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-zinc-700'}`}>
                        {charCount} / {MAX_CHARS}
                      </span>
                    </div>
                    <textarea
                      placeholder="Tell us what you'd like to know…"
                      value={form.message}
                      onChange={set('message')}
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused('')}
                      required
                      maxLength={MAX_CHARS}
                      rows={4}
                      className={`${inputBase} resize-none ${borderClass('message')}`}
                    />
                  </div>

                  {/* Shimmer submit button */}
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="contact-submit-btn relative w-full py-3 rounded-xl text-sm font-medium overflow-hidden bg-indigo-600 text-white hover:bg-indigo-500 hover:-translate-y-px active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-200 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_32px_rgba(99,102,241,0.5)]"
                  >
                    {status === 'sending' ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Send message
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </span>
                    )}
                  </button>

                  <p className="text-center text-xs text-zinc-700">
                    We never share your information with third parties.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes auroraBlob {
          0%   { transform: translate(0,0)       scale(1);    opacity: 0.7; }
          33%  { transform: translate(30px,-25px) scale(1.07); opacity: 1;   }
          66%  { transform: translate(-15px,20px) scale(0.95); opacity: 0.8; }
          100% { transform: translate(0,0)       scale(1);    opacity: 0.7; }
        }
        @keyframes gradientShift {
          from { background-position: 0%   center; }
          to   { background-position: 200% center; }
        }
        @keyframes strokeDraw {
          from { stroke-dashoffset: 30; }
          to   { stroke-dashoffset: 0;  }
        }
        @keyframes confettiPop {
          0%   { transform: translate(-50%,-50%) translate(0,0)                       rotate(0deg);   opacity: 1; }
          100% { transform: translate(-50%,-50%) translate(var(--tx), var(--ty))      rotate(180deg); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        /* Button shimmer sweep on idle */
        .contact-submit-btn::after {
          content: "";
          position: absolute;
          top: 0; left: -80%; width: 50%; height: 100%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
          transform: skewX(-20deg);
          animation: btnShimmer 3s ease-in-out infinite;
        }
        @keyframes btnShimmer {
          0%   { left: -80%;  }
          60%  { left: 140%;  }
          100% { left: 140%;  }
        }
      `}</style>
    </section>
  );
}