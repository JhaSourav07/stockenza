'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLayout from '../../components/layout/AppLayout';

const TABS = [
  {
    label: 'Sales Analytics',
    href:  '/reports/sales',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Inventory Health',
    href:  '/reports/inventory',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

export default function ReportsLayout({ children }) {
  const pathname = usePathname();

  return (
    <AppLayout>
      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Reports</h1>
        <p className="text-sm text-zinc-600 mt-0.5">Analytics &amp; insights for your business</p>
      </div>

      {/* ── Sub-navigation ── */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit mb-8">
        {TABS.map(({ label, href, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── Page content ── */}
      {children}
    </AppLayout>
  );
}
