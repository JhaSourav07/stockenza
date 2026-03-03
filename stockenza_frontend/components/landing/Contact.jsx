'use client';
import { useState } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', message: '' });
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
        message: form.message,
      });
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
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
      ? 'border-indigo-500/60 shadow-[0_0_0_3px_rgba(99,102,241,0.12)] bg-zinc-800'
      : 'border-zinc-700/70 hover:border-zinc-600';

  return (
    <section id="contact" className="py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      {/* Bg glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-indigo-600/6 blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* ── Left: copy ── */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium mb-5">
              Contact us
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-5 leading-tight">
              Have questions?
              <br />
              <span className="gradient-text">We'd love to talk.</span>
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed mb-10">
              Whether you're curious about features, pricing, or want a personal walkthrough — drop us a message and we'll get back to you within 24 hours.
            </p>

            {/* Contact info tiles */}
            <div className="space-y-4">
              {[
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  label: 'Email',
                  value: 'stockenza.help@gmail.com',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  label: 'Response time',
                  value: 'Within 24 hours',
                },
                {
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  ),
                  label: 'Live chat',
                  value: 'Available Mon–Fri, 9am–6pm',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium">{item.label}</p>
                    <p className="text-sm text-zinc-300 font-medium mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
            {status === 'sent' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">Message sent!</h3>
                <p className="text-sm text-zinc-500">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {status === 'error' && errMsg && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {errMsg}
                  </div>
                )}
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

                <div>
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5">Message</label>
                  <textarea
                    placeholder="Tell us what you'd like to know…"
                    value={form.message}
                    onChange={set('message')}
                    onFocus={() => setFocused('message')}
                    onBlur={() => setFocused('')}
                    required
                    rows={5}
                    className={`${inputBase} resize-none ${borderClass('message')}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className={[
                    'w-full py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    'bg-indigo-600 text-white',
                    'hover:bg-indigo-500 hover:-translate-y-px active:translate-y-0',
                    'shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_32px_rgba(99,102,241,0.5)]',
                    'disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0',
                  ].join(' ')}
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
    </section>
  );
}