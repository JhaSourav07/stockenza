import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './Providers';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Stockenza — Business Intelligence for Modern Commerce',
  description:
    'Track inventory, manage orders, and analyze profit in real time. The operating system for your business.',
  keywords: ['inventory management', 'business analytics', 'profit tracking', 'orders'],
  openGraph: {
    title: 'Stockenza',
    description: 'The operating system for your business.',
    type: 'website',
  },
};

// This is intentionally a Server Component (no 'use client').
// It can export `metadata`, use async/await, and do server-side work.
// Client-side context providers are handled by <Providers> below.
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#09090b] text-[#fafafa]`}
      >
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}