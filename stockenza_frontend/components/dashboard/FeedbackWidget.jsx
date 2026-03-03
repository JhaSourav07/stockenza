'use client';
import { useState } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const SUBJECTS = [
  'General Feedback',
  'Bug Report',
  'Feature Request',
  'Compliment',
];

export default function FeedbackWidget() {
  const [open,    setOpen]    = useState(false);
  const [rating,  setRating]  = useState(0);
  const [hover,   setHover]   = useState(0);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [status,    setStatus]    = useState('idle'); // idle | sending | sent | error
  const [toast,     setToast]     = useState(null);  // null | { type, title, body }

  const reset = () => {
    setRating(0);
    setHover(0);
    setSubject(SUBJECTS[0]);
    setMessage('');
    setStatus('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    setStatus('sending');
    try {
      const token = localStorage.getItem('stockenza_token');
      await axios.post(
        `${API}/messages/feedback`,
        { rating, subject, message },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStatus('sent');
      showToast('success', 'Feedback received!', 'Thank you — we really appreciate it.');
      setTimeout(() => { reset(); setOpen(false); }, 2800);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send. Please try again.';
      setStatus('error');
      showToast('error', "Couldn't send feedback", msg);
      setTimeout(() => setStatus('idle'), 3200);
    }
  };

  /* ── show / auto-dismiss toast ── */
  const showToast = (type, title, body) => {
    setToast({ type, title, body });
    setTimeout(() => setToast(null), 3200);
  };

  const toastCfg = toast ? {
    success: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      iconBg:  'bg-emerald-500/15',
      iconClr: 'text-emerald-400',
      bar:     'bg-emerald-500',
      border:  'border-emerald-500/20',
      titleClr:'text-emerald-300',
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      iconBg:  'bg-red-500/15',
      iconClr: 'text-red-400',
      bar:     'bg-red-500',
      border:  'border-red-500/20',
      titleClr:'text-red-300',
    },
  }[toast.type] : null;

  return (
    <>
      {/* ── Premium toast ── */}
      {toast && toastCfg && (
        <div
          className={`fixed bottom-24 right-6 z-[9999] w-80 bg-zinc-900 border ${toastCfg.border} rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden`}
          style={{ animation: 'toastSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {/* Progress drain bar */}
          <div className="h-0.5 w-full bg-zinc-800 relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full ${toastCfg.bar} opacity-70`}
              style={{ animation: 'toastDrain 3.2s linear forwards' }}
            />
          </div>

          <div className="flex items-start gap-3.5 px-5 py-4">
            {/* Icon */}
            <div className={`w-9 h-9 rounded-xl ${toastCfg.iconBg} ${toastCfg.iconClr} flex items-center justify-center shrink-0 mt-0.5`}>
              {toastCfg.icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${toastCfg.titleClr}`}>{toast.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{toast.body}</p>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setToast(null)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0 mt-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── FAB trigger ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Send feedback"
        className="fixed bottom-6 right-6 z-[998] w-12 h-12 rounded-full bg-indigo-600 text-white shadow-[0_0_24px_rgba(99,102,241,0.5)] hover:bg-indigo-500 hover:shadow-[0_0_36px_rgba(99,102,241,0.65)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div
          className="fixed bottom-20 right-6 z-[998] w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
          style={{ animation: 'feedbackIn 0.2s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Share feedback</p>
              <p className="text-xs text-zinc-500 mt-0.5">Help us improve Stockenza</p>
            </div>
            <button
              onClick={() => { reset(); setOpen(false); }}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Star rating */}
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Your rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className="text-2xl transition-transform duration-100 hover:scale-110 focus:outline-none"
                  >
                    <span className={(hover || rating) >= star ? 'text-amber-400' : 'text-zinc-700'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {!rating && status !== 'idle' && (
                <p className="text-xs text-red-400 mt-1">Please select a rating.</p>
              )}
            </div>

            {/* Subject dropdown */}
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5">
                Category
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm outline-none focus:border-indigo-500/60 transition-colors"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think…"
                rows={3}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm outline-none focus:border-indigo-500/60 resize-none transition-colors placeholder:text-zinc-600"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'sending' || status === 'sent'}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {status === 'sending' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending…
                </span>
              ) : status === 'sent' ? (
                '✓ Sent!'
              ) : (
                'Send feedback'
              )}
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        @keyframes feedbackIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(24px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes toastDrain {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </>
  );
}
