'use client';

import { CurrencyProvider } from '../context/CurrencyContext';
import { TaxProvider }      from '../context/TaxContext';

export default function Providers({ children }) {
  return (
    <TaxProvider>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </TaxProvider>
  );
}
