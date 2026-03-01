import { useState, useEffect } from 'react';
import { useTax } from '../../context/TaxContext';

function SectionCard({ title, subtitle, icon, children }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-base shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-600 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 pb-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, sub, valueClass = 'text-zinc-200' }) {
  return (
    <div className="flex items-start justify-between py-3.5 border-b border-zinc-800 last:border-0">
      <div>
        <p className="text-sm text-zinc-400">{label}</p>
        {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
      </div>
      <p className={`text-sm font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function BillingSection() {
  const { taxRate, setTaxRate, isMounted } = useTax();

  // Local draft — only committed when the user clicks Save
  const [draft,   setDraft]   = useState('');
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  // Sync draft with context once mounted (avoids hydration mismatch)
  useEffect(() => {
    if (isMounted) setDraft(String(taxRate));
  }, [isMounted, taxRate]);

  const handleSave = () => {
    setError('');
    const parsed = parseFloat(draft);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setError('Tax rate must be between 0 and 100.');
      return;
    }
    setTaxRate(parsed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">

      {/* ── Tax Configuration ─────────────────────────────────────────── */}
      <SectionCard
        title="Tax Configuration"
        subtitle="Applied automatically on every POS checkout"
        icon="🧾"
      >
        {/* Editable tax rate */}
        <div className="py-4 border-b border-zinc-800">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 block">
            Sales Tax Rate
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-[160px]">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={draft}
                onChange={(e) => { setDraft(e.target.value); setError(''); }}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-semibold text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors tabular-nums"
                placeholder="10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium pointer-events-none">
                %
              </span>
            </div>
            <button
              onClick={handleSave}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                saved
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {saved ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              ) : 'Save'}
            </button>
          </div>

          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <p className="mt-2 text-xs text-zinc-600">
            Current rate: <span className="text-indigo-400 font-semibold">{isMounted ? taxRate : '…'}%</span>
            {' '}— applied as a line item on POS checkout (Subtotal + Tax = Total).
          </p>
        </div>

        <InfoRow
          label="Tax Calculation Method"
          value="Inclusive (added on top)"
          sub="Tax = Subtotal × rate — shown separately at checkout"
        />
        <InfoRow
          label="Tax Region"
          value="Global / Default"
          sub="No region-specific rules are applied"
        />

        <div className="mt-4 mb-3 flex items-start gap-3 p-3.5 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
          <svg className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Changes take effect immediately on the POS terminal. The rate is saved in your browser and persists across sessions.
          </p>
        </div>
      </SectionCard>

      {/* ── Subscription Plan ──────────────────────────────────────────── */}
      <SectionCard
        title="Subscription Plan"
        subtitle="Your current Stockenza plan"
        icon="💳"
      >
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">Stockenza Free</p>
              <p className="text-xs text-zinc-600">All core features included</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            Active
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 pb-4">
          {[
            { label: 'Inventory items', value: 'Unlimited'  },
            { label: 'Orders / month',  value: 'Unlimited'  },
            { label: 'POS terminals',   value: '1 device'   },
            { label: 'Reports',         value: 'Full access' },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-xs text-zinc-600">{label}</p>
              <p className="text-sm font-medium text-zinc-300">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Payment Method ─────────────────────────────────────────────── */}
      <SectionCard title="Payment Method" subtitle="Manage how you pay for Stockenza" icon="🏦">
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-zinc-600">
          <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-sm">Payment settings coming soon.</p>
        </div>
      </SectionCard>

    </div>
  );
}
