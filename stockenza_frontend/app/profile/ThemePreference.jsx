'use client';
import { useTheme } from '../../context/ThemeContext';

const SunIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="5" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

export default function ThemePreference() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: 'dark',
      label: 'Dark',
      description: 'Premium dark interface',
      icon: <MoonIcon />,
      preview: {
        bg: '#09090b',
        surface: '#18181b',
        border: '#3f3f46',
        text: '#fafafa',
        muted: '#71717a',
        accent: '#818cf8',
      },
    },
    {
      id: 'light',
      label: 'Light',
      description: 'Clean warm-cream interface',
      icon: <SunIcon />,
      preview: {
        bg: '#f8f7f4',
        surface: '#ffffff',
        border: '#e5e3de',
        text: '#1a1816',
        muted: '#9b9790',
        accent: '#4f46e5',
      },
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Appearance</h3>
          <p className="text-xs text-zinc-500">Choose your preferred theme</p>
        </div>
        {/* Live badge */}
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            {theme === 'dark' ? 'Dark' : 'Light'} mode
          </span>
        </div>
      </div>

      {/* Theme tiles */}
      <div className="grid grid-cols-2 gap-4">
        {themes.map((t) => {
          const active = theme === t.id;
          const p = t.preview;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={[
                'relative flex flex-col rounded-xl border-2 p-0 overflow-hidden text-left transition-all duration-200',
                active
                  ? 'border-indigo-500 shadow-[0_0_24px_rgba(99,102,241,0.3)]'
                  : 'border-zinc-800 hover:border-zinc-600',
              ].join(' ')}
            >
              {/* Preview Window */}
              <div
                className="w-full h-28 relative overflow-hidden"
                style={{ background: p.bg }}
              >
                {/* Fake sidebar */}
                <div
                  className="absolute left-0 top-0 h-full w-10 flex flex-col gap-1 pt-2 px-1.5"
                  style={{ background: p.surface, borderRight: `1px solid ${p.border}` }}
                >
                  {[1,2,3,4].map(i => (
                    <div key={i} className="rounded"
                      style={{ height: 6, background: i === 1 ? p.accent : p.border, opacity: i === 1 ? 1 : 0.6 }} />
                  ))}
                </div>
                {/* Fake content */}
                <div className="absolute left-12 right-2 top-2 flex flex-col gap-1.5">
                  {/* Topbar */}
                  <div className="rounded-md h-5 flex items-center px-1.5 gap-1"
                    style={{ background: p.surface, border: `1px solid ${p.border}` }}>
                    <div className="rounded-sm flex-1" style={{ height: 3, background: p.border }} />
                    <div className="rounded-full w-3 h-3" style={{ background: `${p.accent}55` }} />
                  </div>
                  {/* Metric cards */}
                  <div className="grid grid-cols-3 gap-1">
                    {[p.accent, '#34d399', '#f472b6'].map((c, i) => (
                      <div key={i} className="rounded p-1" style={{ background: p.surface, border: `1px solid ${p.border}` }}>
                        <div className="rounded-sm mb-1" style={{ height: 3, width: '60%', background: p.muted, opacity: 0.5 }} />
                        <div className="rounded-sm" style={{ height: 5, width: '80%', background: c, opacity: 0.8 }} />
                      </div>
                    ))}
                  </div>
                  {/* Bar chart preview */}
                  <div className="rounded p-1.5 flex items-end gap-0.5"
                    style={{ background: p.surface, border: `1px solid ${p.border}`, height: 36 }}>
                    {[40, 65, 35, 80, 50, 70, 55].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm"
                        style={{ height: `${h}%`, background: i === 3 ? p.accent : `${p.accent}40`, transition: 'height 0.3s' }} />
                    ))}
                  </div>
                </div>

                {/* Active checkmark */}
                {active && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                    style={{ animation: 'successPop 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Label row */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 border-t"
                style={{ background: 'transparent', borderColor: active ? 'rgba(99,102,241,0.3)' : undefined }}
              >
                <span className={active ? 'text-indigo-400' : 'text-zinc-500'}>
                  {t.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{t.label}</p>
                  <p className="text-[10px] text-zinc-500">{t.description}</p>
                </div>
                {active && (
                  <span className="ml-auto text-[9px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5">
                    Active
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes successPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
