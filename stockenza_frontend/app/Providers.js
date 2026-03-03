'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { CurrencyProvider } from '../context/CurrencyContext';
import { TaxProvider }      from '../context/TaxContext';

export default function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <TaxProvider>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </TaxProvider>
    </GoogleOAuthProvider>
  );
}
