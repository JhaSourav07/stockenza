'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';

// Inner layout that reads the SidebarContext
function AppLayoutInner({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  const [authorized,  setAuthorized]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    const token = localStorage.getItem('stockenza_token');
    if (!token) router.replace('/login');
    else        setAuthorized(true);
  }, [router]);

  // Close mobile drawer on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // Prevent body scroll while mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-indigo-500 animate-spin" />
          <p className="text-xs text-zinc-600">Authenticating…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

      {/*
        ── Main content ──
        On desktop (lg+): margin-left transitions between 16rem (expanded)
        and 4rem (collapsed) with a smooth 300ms animation.
        On mobile: no left margin — sidebar is a floating overlay drawer.
      */}
      <main
        className="pt-16 min-h-screen"
        style={{ animation: 'pageIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div
          style={{ marginLeft: collapsed ? '4rem' : '16rem' }}
          className="transition-[margin-left] duration-300 ease-in-out max-lg:!ml-0"
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function AppLayout({ children }) {
  return (
    <SidebarProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SidebarProvider>
  );
}