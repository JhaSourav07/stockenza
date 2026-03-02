'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Inventory',
    path: '/inventory',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: 'Point of Sale',
    path: '/pos',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Order History',
    path: '/orders',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

/** Status pill config */
const STATUS_CONFIG = {
  ok:       { dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]',  text: 'All systems operational' },
  degraded: { dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]',   text: 'Degraded performance'     },
  down:     { dot: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]',    text: 'Service disrupted'         },
};

// ── The actual sidebar panel (shared between desktop & mobile) ──
function SidebarPanel({ onClose, isMobile = false, systemStatus = 'ok' }) {
  const pathname             = usePathname();
  const router               = useRouter();
  const { collapsed, setCollapsed } = useSidebar();
  const [user,       setUser]       = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Only respect collapsed on desktop; mobile drawer is always expanded
  const isCollapsed = !isMobile && collapsed;

  useEffect(() => {
    try {
      const stored = localStorage.getItem('stockenza_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('stockenza_token');
      localStorage.removeItem('stockenza_user');
      router.push('/login');
    }, 400);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const statusCfg = STATUS_CONFIG[systemStatus] ?? STATUS_CONFIG.ok;

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/80 overflow-hidden">

      {/* ── Logo + collapse/close button ── */}
      <div className={`h-16 flex items-center border-b border-zinc-800/80 shrink-0 ${isCollapsed ? 'justify-center px-3' : 'justify-between px-6'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-100">
              Stock<span className="text-indigo-400">enza</span>
            </span>
          </div>
        )}

        {isCollapsed && (
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        )}

        {/* Close button — only visible in mobile drawer */}
        {isMobile && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className={`flex-1 py-4 overflow-y-auto space-y-0.5 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {!isCollapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
            Menu
          </p>
        )}

        {NAV_ITEMS.map((item, i) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.name}
              href={item.path}
              title={isCollapsed ? item.name : undefined}
              style={{ animationDelay: `${i * 60}ms` }}
              className={[
                'group flex items-center rounded-lg text-sm font-medium transition-all duration-150',
                'animate-[fadeIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0',
                isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5',
                isActive
                  ? isCollapsed
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 pl-[10px]'
                  : isCollapsed
                    ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/70'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/70 border-l-2 border-transparent pl-[10px]',
              ].join(' ')}
            >
              <span className={`shrink-0 transition-colors duration-150 ${isActive ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-300'}`}>
                {item.icon}
              </span>
              {!isCollapsed && item.name}
              {!isCollapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Collapse toggle (desktop only) ── */}
      {!isMobile && (
        <div className={`${isCollapsed ? 'px-2 pb-2' : 'px-4 pb-2'}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/70 transition-all text-xs font-medium ${isCollapsed ? 'justify-center' : ''}`}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      )}

      {/* ── System status pill ── */}
      {!isCollapsed && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusCfg.dot}`} />
            <span className="text-xs text-zinc-500">{statusCfg.text}</span>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="px-2 pb-3 flex justify-center">
          <div title={statusCfg.text} className="w-2 h-2 rounded-full animate-pulse cursor-default" style={{ background: 'currentColor' }}>
            <span className={`block w-2 h-2 rounded-full animate-pulse ${statusCfg.dot.split(' ')[0]}`} />
          </div>
        </div>
      )}

      {/* ── User card ── */}
      <div className={`border-t border-zinc-800/80 pt-3 pb-4 shrink-0 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {isCollapsed ? (
          /* Collapsed: just the avatar */
          <div
            className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]"
            title={user?.name || 'User'}
          >
            {initials}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-zinc-500 truncate">{user?.email || ''}</p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Logout"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose, systemStatus = 'ok' }) {
  const { collapsed }   = useSidebar();
  const hasOpened       = useRef(false);
  const mobileDrawerRef = useRef(null);
  if (isOpen) hasOpened.current = true;

  // Phase 4: Focus trap for the mobile drawer
  useFocusTrap(mobileDrawerRef, isOpen);

  // Close mobile drawer on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/*
        ══════════════════════════════════════════
        DESKTOP — fixed sidebar with collapse support
        Width transitions smoothly between w-64 and w-16
        ══════════════════════════════════════════
      */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 transition-[width] duration-300 ease-in-out"
        style={{ width: collapsed ? '4rem' : '16rem' }}
      >
        <SidebarPanel isMobile={false} onClose={onClose} systemStatus={systemStatus} />
      </aside>

      {/*
        ══════════════════════════════════════════
        MOBILE — slide-in drawer (below lg)
        ══════════════════════════════════════════
      */}
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{
          opacity:       isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        ref={mobileDrawerRef}
        className="lg:hidden fixed left-0 top-0 h-full w-72 max-w-[85vw] z-50 shadow-[4px_0_40px_rgba(0,0,0,0.6)]"
        style={{
          transform:  isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: hasOpened.current ? 'transform' : 'auto',
        }}
        aria-label="Navigation menu"
        aria-modal="true"
        role="dialog"
      >
        <SidebarPanel isMobile={true} onClose={onClose} systemStatus={systemStatus} />
      </aside>
    </>
  );
}