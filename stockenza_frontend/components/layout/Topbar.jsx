'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard',  subtitle: 'Business overview & analytics'      },
  '/inventory':  { title: 'Inventory',  subtitle: 'Manage your products & stock'       },
  '/orders':     { title: 'Orders',     subtitle: 'Sales history & new transactions'   },
  '/profile':    { title: 'Profile',    subtitle: 'Account settings & preferences'     },
};

// onMenuClick — passed down from AppLayout; toggles the mobile sidebar drawer
export default function Topbar({ onMenuClick }) {
  const pathname = usePathname();
  const [user,   setUser]   = useState(null);
  const [time,   setTime]   = useState('');
  const [notifs, setNotifs] = useState(3);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('stockenza_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}

    const tick = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  const meta = PAGE_META[pathname] || { title: 'Stockenza', subtitle: '' };
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header
      className={[
        'h-16 fixed top-0 right-0 z-30',
        'flex items-center justify-between px-4 sm:px-6 lg:px-8',
        'topbar-bg border-b border-zinc-800/80',
        // On mobile: full width. On desktop: offset by sidebar.
        'left-0 lg:left-64',
      ].join(' ')}
    >
      {/* ── Left: hamburger (mobile) + page title ── */}
      <div className="flex items-center gap-3">

        {/*
          Hamburger — only visible on mobile (hidden on lg+)
          Calls onMenuClick which flips sidebarOpen in AppLayout
        */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all shrink-0"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <div>
          <h1 className="text-sm font-semibold text-zinc-100 leading-none">{meta.title}</h1>
          <p className="text-xs text-zinc-600 mt-0.5 hidden sm:block">{meta.subtitle}</p>
        </div>
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Live clock — hidden on small screens */}
        <span className="hidden md:block text-xs font-mono text-zinc-600 mr-1">{time}</span>

        {/* Search */}
        <button className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-all text-xs">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden md:inline px-1 py-0.5 text-[10px] bg-zinc-700/50 border border-zinc-600/50 rounded font-mono">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setNotifs(0)}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifs > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-800 mx-0.5" />

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_8px_rgba(99,102,241,0.35)]">
            {initials}
          </div>
          <span className="hidden lg:block text-sm font-medium text-zinc-300 max-w-[120px] truncate">
            {user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}