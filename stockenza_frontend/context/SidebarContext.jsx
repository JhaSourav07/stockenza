'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: () => {},
});

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsedState] = useState(false);

  // Read persisted state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('stockenza_sidebar_collapsed');
      if (stored !== null) setCollapsedState(JSON.parse(stored));
    } catch {}
  }, []);

  const setCollapsed = (value) => {
    setCollapsedState(value);
    try { localStorage.setItem('stockenza_sidebar_collapsed', JSON.stringify(value)); } catch {}
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
