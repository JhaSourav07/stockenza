'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', setTheme: () => {}, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');

  // On mount: read saved preference (or default to dark)
  useEffect(() => {
    const saved = typeof window !== 'undefined'
      ? localStorage.getItem('stockenza_theme') || 'dark'
      : 'dark';
    setThemeState(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem('stockenza_theme', t);
    document.documentElement.dataset.theme = t;
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
