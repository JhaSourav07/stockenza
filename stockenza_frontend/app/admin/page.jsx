'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}
function fmtTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
}
function authHeaders(token) {
  return { 'x-admin-token': token };
}

/* ─────────────────────────────────────────────
   Star display
───────────────────────────────────────────── */
function Stars({ rating, size = 'text-sm' }) {
  return (
    <span className={size}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? 'text-amber-400' : 'text-zinc-700'}>★</span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Status badge
───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    unread:   'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    read:     'bg-zinc-800 text-zinc-500 border-zinc-700',
    archived: 'bg-zinc-900 text-zinc-600 border-zinc-800',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${map[status] || map.read}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'unread' ? 'bg-indigo-400' : status === 'archived' ? 'bg-zinc-600' : 'bg-zinc-500'}`} />
      {status}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Stat card
───────────────────────────────────────────── */
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-zinc-100 tabular-nums">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: accent + '18' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Messages table (shared for feedback + contact)
───────────────────────────────────────────── */
function MessagesTable({ token, type, onUpdate }) {
  const [messages, setMessages]   = useState([]);
  const [filter,   setFilter]     = useState('all');   // all|unread|read|archived
  const [loading,  setLoading]    = useState(true);
  const [selected, setSelected]   = useState(null);
  const [page,     setPage]       = useState(1);
  const [total,    setTotal]      = useState(0);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type, page, limit: LIMIT };
      if (filter !== 'all') params.status = filter;
      const { data } = await axios.get(`${API}/admin/messages`, {
        headers: authHeaders(token),
        params,
      });
      setMessages(data.messages);
      setTotal(data.total);
    } catch { /* handled by parent */ }
    finally { setLoading(false); }
  }, [token, type, filter, page]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await axios.patch(`${API}/admin/messages/${id}/status`, { status }, { headers: authHeaders(token) });
    setMessages((prev) => prev.map((m) => m._id === id ? { ...m, status } : m));
    if (selected?._id === id) setSelected((s) => ({ ...s, status }));
    onUpdate();
  };

  const deleteMsg = async (id) => {
    await axios.delete(`${API}/admin/messages/${id}`, { headers: authHeaders(token) });
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selected?._id === id) setSelected(null);
    onUpdate();
  };

  const openDetail = async (msg) => {
    setSelected(msg);
    if (msg.status === 'unread') await updateStatus(msg._id, 'read');
  };

  const FILTERS = ['all', 'unread', 'read', 'archived'];

  return (
    <div className="flex h-full relative">
      {/* Main list */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${selected ? 'mr-96' : ''}`}>
        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={[
                'px-3 py-1 rounded-full text-xs font-medium capitalize transition-all duration-150',
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-zinc-600">{total} total</span>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <span className="text-3xl mb-3">📭</span>
              <p className="text-sm">No messages found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs text-zinc-500 font-medium px-5 py-3 uppercase tracking-wider">Date</th>
                  <th className="text-left text-xs text-zinc-500 font-medium px-5 py-3 uppercase tracking-wider">Name</th>
                  <th className="text-left text-xs text-zinc-500 font-medium px-5 py-3 uppercase tracking-wider hidden md:table-cell">
                    {type === 'feedback' ? 'Rating' : 'Subject'}
                  </th>
                  <th className="text-left text-xs text-zinc-500 font-medium px-5 py-3 uppercase tracking-wider hidden lg:table-cell">Preview</th>
                  <th className="text-left text-xs text-zinc-500 font-medium px-5 py-3 uppercase tracking-wider">Status</th>
                  <th className="text-left text-xs text-zinc-500 font-medium px-5 py-3 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg._id}
                    onClick={() => openDetail(msg)}
                    className={[
                      'border-b border-zinc-800/60 cursor-pointer transition-colors',
                      msg.status === 'unread' ? 'bg-indigo-500/5 hover:bg-indigo-500/8' : 'hover:bg-zinc-800/40',
                      selected?._id === msg._id ? 'bg-zinc-800/60' : '',
                    ].join(' ')}
                  >
                    <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">
                      <div>{fmt(msg.createdAt)}</div>
                      <div className="text-zinc-700">{fmtTime(msg.createdAt)}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className={`font-medium truncate max-w-[140px] ${msg.status === 'unread' ? 'text-zinc-100' : 'text-zinc-300'}`}>{msg.name}</p>
                      <p className="text-xs text-zinc-600 truncate max-w-[140px]">{msg.email}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {type === 'feedback'
                        ? <Stars rating={msg.rating || 0} />
                        : <span className="text-xs text-zinc-400 truncate max-w-[120px] block">{msg.subject || '—'}</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500 hidden lg:table-cell">
                      <span className="block max-w-[200px] truncate">
                        {msg.message.slice(0, 60)}{msg.message.length > 60 ? '…' : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={msg.status} />
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {msg.status !== 'read' && (
                          <button
                            onClick={() => updateStatus(msg._id, 'read')}
                            title="Mark as read"
                            className="p-1 rounded text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        {msg.status !== 'archived' && (
                          <button
                            onClick={() => updateStatus(msg._id, 'archived')}
                            title="Archive"
                            className="p-1 rounded text-zinc-600 hover:text-zinc-400 hover:bg-zinc-700 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => { if (confirm('Delete this message?')) deleteMsg(msg._id); }}
                          title="Delete"
                          className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
            <span>Page {page} of {Math.ceil(total / LIMIT)}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-700 disabled:opacity-40 hover:bg-zinc-700 transition-colors">Prev</button>
              <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-700 disabled:opacity-40 hover:bg-zinc-700 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Slide-in detail panel ── */}
      {selected && (
        <div
          className="fixed top-0 right-0 h-screen w-96 bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col shadow-[−8px_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
          style={{ animation: 'slideIn 0.25s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {/* Panel header */}
          <div className="px-6 py-5 border-b border-zinc-800 flex items-start justify-between">
            <div>
              <p className="font-semibold text-zinc-100">{selected.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{selected.email}</p>
              <div className="mt-2">
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium mb-1">Received</p>
              <p className="text-sm text-zinc-300">{fmt(selected.createdAt)} at {fmtTime(selected.createdAt)}</p>
            </div>

            {selected.subject && (
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium mb-1">Subject</p>
                <p className="text-sm text-zinc-300">{selected.subject}</p>
              </div>
            )}

            {selected.rating && (
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium mb-1">Rating</p>
                <Stars rating={selected.rating} size="text-xl" />
                <span className="text-sm text-zinc-400 ml-2">{selected.rating}/5</span>
              </div>
            )}

            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium mb-2">Message</p>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>

            {selected.userId && (
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium mb-1">User ID</p>
                <p className="text-xs font-mono text-zinc-500">{selected.userId?._id || selected.userId}</p>
              </div>
            )}
          </div>

          {/* Panel actions */}
          <div className="px-6 py-4 border-t border-zinc-800 space-y-2">
            {selected.status !== 'read' && (
              <button
                onClick={() => updateStatus(selected._id, 'read')}
                className="w-full py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
              >
                Mark as Read
              </button>
            )}
            {selected.status !== 'archived' && (
              <button
                onClick={() => updateStatus(selected._id, 'archived')}
                className="w-full py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 border border-zinc-700 transition-colors"
              >
                Archive
              </button>
            )}
            <button
              onClick={() => { if (confirm('Delete this message?')) deleteMsg(selected._id); }}
              className="w-full py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/15 border border-red-500/20 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Overview tab
───────────────────────────────────────────── */
function OverviewTab({ token }) {
  const [stats,     setStats]     = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: authHeaders(token) }),
        axios.get(`${API}/admin/chart`, { headers: authHeaders(token) }),
      ]);
      setStats(s.data);
      setChartData(c.data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Messages" value={stats?.total ?? 0} icon="✉️" accent="linear-gradient(90deg,#6366f1,#818cf8)" />
        <StatCard label="Unread" value={stats?.unread ?? 0} icon="🔵" accent="linear-gradient(90deg,#6366f1,#4f46e5)" />
        <StatCard
          label="Avg Rating"
          value={stats?.avgRating > 0 ? `${stats.avgRating}/5` : '—'}
          icon={<Stars rating={stats?.avgRating || 0} size="text-sm" />}
          accent="linear-gradient(90deg,#f59e0b,#fbbf24)"
        />
        <StatCard label="Contact Forms" value={stats?.contact ?? 0} icon="📋" accent="linear-gradient(90deg,#10b981,#34d399)" />
      </div>

      {/* Bar chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-sm font-semibold text-zinc-200 mb-1">Messages — last 14 days</p>
        <p className="text-xs text-zinc-600 mb-5">Breakdown by type</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={8} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.5)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => d.slice(5)}
              tick={{ fill: '#71717a', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#a1a1aa' }}
              cursor={{ fill: 'rgba(99,102,241,0.08)' }}
            />
            <Bar dataKey="contact"  fill="#6366f1" radius={[3, 3, 0, 0]} name="Contact"  />
            <Bar dataKey="feedback" fill="#10b981" radius={[3, 3, 0, 0]} name="Feedback" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Admin Page
───────────────────────────────────────────── */
export default function AdminPage() {
  const [token,    setToken]    = useState(null);
  const [loginId,  setLoginId]  = useState('');
  const [loginPw,  setLoginPw]  = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [logging,  setLogging]  = useState(false);
  const [tab,      setTab]      = useState('overview'); // overview|feedback|contact|settings
  const [clock,    setClock]    = useState('');
  const [statsKey, setStatsKey] = useState(0); // bump to refresh overview

  // Load token from sessionStorage on mount
  useEffect(() => {
    const t = sessionStorage.getItem('adminToken');
    if (t) setToken(t);
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => {
      setClock(new Date().toLocaleString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLogging(true);
    setLoginErr('');
    try {
      const { data } = await axios.post(`${API}/admin/login`, { id: loginId, password: loginPw });
      sessionStorage.setItem('adminToken', data.token);
      setToken(data.token);
    } catch (err) {
      setLoginErr(err?.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLogging(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setToken(null);
    setLoginId('');
    setLoginPw('');
  };

  /* ── Login screen ── */
  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">S</div>
              <span className="text-lg font-bold text-zinc-100">Stockenza</span>
            </div>
            <p className="text-zinc-600 text-sm">Admin Portal</p>
          </div>

          <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-[0_24px_64px_rgba(0,0,0,0.6)] space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5">Admin ID</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter your admin ID"
                required
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-600 focus:border-indigo-500/60 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm placeholder:text-zinc-600 focus:border-indigo-500/60 focus:outline-none transition-colors"
              />
            </div>

            {loginErr && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {loginErr}
              </div>
            )}

            <button
              type="submit"
              disabled={logging}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-[0_0_24px_rgba(99,102,241,0.3)] hover:shadow-[0_0_36px_rgba(99,102,241,0.5)]"
            >
              {logging ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying…
                </span>
              ) : 'Sign in to Admin Panel'}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-700 mt-6">
            This portal is restricted to authorised administrators only.
          </p>
        </div>

        <style jsx global>{`
          body { background: #09090b; }
        `}</style>
      </div>
    );
  }

  /* ── Dashboard ── */
  const NAV = [
    { id: 'overview', label: 'Overview',      icon: '▤' },
    { id: 'feedback', label: 'Feedback',       icon: '★' },
    { id: 'contact',  label: 'Contact Forms',  icon: '✉' },
    { id: 'settings', label: 'Settings',       icon: '⚙' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col fixed h-screen z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">S</div>
            <div>
              <p className="text-sm font-bold text-zinc-100 leading-none">Stockenza</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left',
                tab === item.id
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800',
              ].join(' ')}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 bg-zinc-900/60 backdrop-blur-sm border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-zinc-200">Admin Panel</h1>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <span className="text-xs text-zinc-600 font-mono">{clock}</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {tab === 'overview' && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-6">Overview</h2>
              <OverviewTab token={token} key={statsKey} />
            </div>
          )}

          {tab === 'feedback' && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-6">Feedback</h2>
              <MessagesTable token={token} type="feedback" onUpdate={() => setStatsKey(k => k + 1)} />
            </div>
          )}

          {tab === 'contact' && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-6">Contact Forms</h2>
              <MessagesTable token={token} type="contact" onUpdate={() => setStatsKey(k => k + 1)} />
            </div>
          )}

          {tab === 'settings' && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-6">Settings</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-200 mb-1">Admin Session</p>
                  <p className="text-xs text-zinc-500">Your session is valid for 8 hours from the time of login.</p>
                </div>
                <div className="pt-4 border-t border-zinc-800">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20 hover:bg-red-500/15 transition-colors"
                  >
                    Sign out of Admin Panel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        body { background: #09090b; overflow-x: hidden; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
