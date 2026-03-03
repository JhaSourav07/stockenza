'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider }       from '../context/ThemeContext';
import { CurrencyProvider }    from '../context/CurrencyContext';
import { TaxProvider }         from '../context/TaxContext';

export default function Providers({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <TaxProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </TaxProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
