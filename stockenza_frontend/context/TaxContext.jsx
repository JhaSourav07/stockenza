'use client';
/**
 * context/TaxContext.jsx
 *
 * Stores the user's configured sales tax rate (as a percentage, e.g. 10 = 10%).
 * Persists to localStorage so the rate survives page refreshes.
 * Consumed by the POS page (to apply) and BillingSection (to edit).
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LS_KEY      = 'stockenza_tax_rate';
const DEFAULT_TAX = 10; // percent

const TaxContext = createContext(null);

export function TaxProvider({ children }) {
  const [taxRate,    setTaxRateState] = useState(DEFAULT_TAX);
  const [isMounted,  setIsMounted]   = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0) setTaxRateState(parsed);
      }
    } catch {}
    setIsMounted(true);
  }, []);

  const setTaxRate = useCallback((rate) => {
    const clamped = Math.min(Math.max(parseFloat(rate) || 0, 0), 100);
    setTaxRateState(clamped);
    try { localStorage.setItem(LS_KEY, String(clamped)); } catch {}
  }, []);

  // taxRate is the numeric % value (e.g. 10).
  // taxMultiplier is the decimal to multiply subtotals by (e.g. 0.10).
  const taxMultiplier = taxRate / 100;

  return (
    <TaxContext.Provider value={{ taxRate, taxMultiplier, setTaxRate, isMounted }}>
      {children}
    </TaxContext.Provider>
  );
}

export function useTax() {
  const ctx = useContext(TaxContext);
  if (!ctx) throw new Error('useTax must be used inside <TaxProvider>');
  return ctx;
}
