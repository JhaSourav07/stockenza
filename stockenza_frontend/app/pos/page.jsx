'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../lib/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useTax } from '../../context/TaxContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';

// ── Icons ─────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CartIcon = () => (
  <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 ${
      isSuccess
        ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
        : 'bg-red-950 border-red-700 text-red-300'
    }`}>
      {isSuccess ? (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {toast.message}
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ item, cartQty, onAdd }) {
  const isOOS   = item.quantity === 0;
  const isMaxed = cartQty >= item.quantity;
  const disabled = isOOS || isMaxed;

  return (
    <button
      onClick={() => !disabled && onAdd(item)}
      disabled={disabled}
      className={`relative flex flex-col rounded-xl border text-left transition-all duration-150 overflow-hidden group ${
        isOOS
          ? 'border-zinc-800 bg-zinc-900/40 opacity-50 cursor-not-allowed'
          : isMaxed
          ? 'border-zinc-700 bg-zinc-900 cursor-not-allowed opacity-70'
          : 'border-zinc-800 bg-zinc-900 hover:border-indigo-500/60 hover:bg-zinc-800 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer active:scale-[0.98]'
      }`}
    >
      <div className="w-full h-28 bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      <span className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
        isOOS ? 'bg-red-900/80 text-red-300'
        : item.quantity <= 5 ? 'bg-amber-900/80 text-amber-300'
        : 'bg-zinc-800 text-zinc-400'
      }`}>
        {isOOS ? 'Out of stock' : `${item.quantity} left`}
      </span>

      {cartQty > 0 && !isOOS && (
        <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow">
          {cartQty}
        </span>
      )}

      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-semibold text-zinc-200 leading-tight line-clamp-2">{item.name}</p>
        {item.sku && <p className="text-[10px] text-zinc-600 font-mono">{item.sku}</p>}
        <p className="mt-auto pt-1.5 text-sm font-bold text-indigo-400">
          {item.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 })}
        </p>
      </div>
    </button>
  );
}

// ── Cart Item Row ─────────────────────────────────────────────────────────────
function CartRow({ item, fmt, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-zinc-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">{item.name}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{fmt(item.price)} × {item.quantity}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onDecrement}
          className="w-6 h-6 rounded-md flex items-center justify-center bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-all text-lg leading-none">−</button>
        <span className="w-6 text-center text-sm font-semibold text-zinc-200">{item.quantity}</span>
        <button onClick={onIncrement} disabled={item.quantity >= item.maxStock}
          className="w-6 h-6 rounded-md flex items-center justify-center bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-all text-lg leading-none disabled:opacity-30 disabled:cursor-not-allowed">+</button>
      </div>
      <p className="text-sm font-semibold text-zinc-100 w-16 text-right shrink-0">{fmt(item.price * item.quantity)}</p>
      <button onClick={onRemove}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
        <TrashIcon />
      </button>
    </div>
  );
}

// ── Indian States ─────────────────────────────────────────────────────────────
const IN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry','Chandigarh',
];

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors';

// ── Customer Details Modal ────────────────────────────────────────────────────
function CustomerDetailsModal({ isOpen, onSkip, onDownload, generating }) {
  const modalRef = useRef(null);
  useFocusTrap(modalRef, isOpen);

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', state: '', pincode: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onSkip(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" aria-hidden="true" />

      {/* Panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
        className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
        style={{ animation: 'modalIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 id="customer-modal-title" className="text-sm font-semibold text-zinc-100">
              Order Complete — Generate Invoice?
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Enter customer details for the PDF tax invoice</p>
          </div>
          <button onClick={onSkip}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            aria-label="Skip invoice">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Customer Name</label>
              <input type="text" className={inputCls} placeholder="Walk-in Customer"
                value={form.name} onChange={set('name')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Phone</label>
              <input type="tel" className={inputCls} placeholder="+91 98765 43210"
                value={form.phone} onChange={set('phone')} />
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Address</label>
            <input type="text" className={inputCls} placeholder="Street / building / locality"
              value={form.address} onChange={set('address')} />
          </div>

          {/* City | State | Pincode */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">City</label>
              <input type="text" className={inputCls} placeholder="City"
                value={form.city} onChange={set('city')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">State</label>
              <select className={inputCls} value={form.state} onChange={set('state')}>
                <option value="">— State —</option>
                {IN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Pincode</label>
              <input type="text" maxLength={6} className={inputCls} placeholder="110001"
                value={form.pincode} onChange={set('pincode')} />
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
            <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-zinc-500 leading-relaxed">
              All fields are optional. The order has already been saved — this only generates the PDF invoice.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-5">
          <button onClick={onSkip}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all">
            Skip
          </button>
          <button
            onClick={() => onDownload(form)}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
          >
            {generating ? (
              <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Generating…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>Download Invoice</>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Main POS Page ─────────────────────────────────────────────────────────────
export default function POSPage() {
  const { fmt, isMounted } = useCurrency();
  const { taxRate, taxMultiplier } = useTax();

  const [inventory,      setInventory]      = useState([]);
  const [cart,           setCart]           = useState([]);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [loading,        setLoading]        = useState(true);
  const [isCheckingOut,  setIsCheckingOut]  = useState(false);
  const [toast,          setToast]          = useState(null);

  // Invoice / customer modal state
  const [completedOrder, setCompletedOrder]  = useState(null);  // set after successful order
  const [showInvoice,    setShowInvoice]     = useState(false);
  const [generating,     setGenerating]      = useState(false);

  // Store billing info (fetched once; used for the PDF)
  const [storeInfo, setStoreInfo] = useState({});

  // ── Fetch inventory ────────────────────────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    try {
      const res = await api.get('/inventory');
      setInventory(res.data);
    } catch {
      showToast('error', 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // ── Fetch store billing info (for PDF) ─────────────────────────────────────
  useEffect(() => {
    api.get('/auth/profile/billing')
      .then((res) => setStoreInfo(res.data ?? {}))
      .catch(() => {});
  }, []);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Filtered product list ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return inventory;
    const q = searchQuery.toLowerCase();
    return inventory.filter((i) =>
      i.name.toLowerCase().includes(q) ||
      (i.sku && i.sku.toLowerCase().includes(q))
    );
  }, [inventory, searchQuery]);

  // ── Cart helpers ───────────────────────────────────────────────────────────
  const cartQtyMap = useMemo(() => {
    const map = {};
    cart.forEach((c) => { map[c._id] = c.quantity; });
    return map;
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        if (existing.quantity >= item.quantity) return prev;
        return prev.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { _id: item._id, name: item.name, price: item.sellingPrice, quantity: 1, maxStock: item.quantity }];
    });
  };

  const increment = (id) => setCart((prev) =>
    prev.map((c) => c._id !== id ? c : c.quantity >= c.maxStock ? c : { ...c, quantity: c.quantity + 1 })
  );
  const decrement = (id) => setCart((prev) =>
    prev.map((c) => c._id === id ? { ...c, quantity: c.quantity - 1 } : c).filter((c) => c.quantity > 0)
  );
  const remove    = (id) => setCart((prev) => prev.filter((c) => c._id !== id));
  const clearCart = ()   => setCart([]);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const tax      = subtotal * taxMultiplier;
  const total    = subtotal + tax;

  // ── Checkout — intercept and open invoice modal ────────────────────────────
  const handleCheckout = async () => {
    if (cart.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const payload = {
        items:       cart.map((c) => ({ productId: c._id, qty: c.quantity })),
        totalAmount: Math.round(total * 100) / 100,
      };
      const res = await api.post('/orders', payload);

      // Save order snapshot for invoice generation
      setCompletedOrder({
        _id:       res.data._id ?? res.data.order?._id ?? 'N/A',
        items:     cart.map((c) => ({ name: c.name, qty: c.quantity, price: c.price })),
        subtotal:  Math.round(subtotal * 100) / 100,
        tax:       Math.round(tax * 100) / 100,
        total:     Math.round(total * 100) / 100,
        createdAt: new Date().toISOString(),
      });

      // Refresh stock, show modal
      fetchInventory();
      setShowInvoice(true);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Failed to place order. Please try again.';
      showToast('error', msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ── Invoice: skip ──────────────────────────────────────────────────────────
  const handleSkipInvoice = () => {
    showToast('success', `Order placed! Total: ${fmt(completedOrder?.total ?? 0)}`);
    setShowInvoice(false);
    setCompletedOrder(null);
    clearCart();
  };

  // ── Invoice: download ──────────────────────────────────────────────────────
  const handleDownloadInvoice = async (customer) => {
    if (!completedOrder) return;
    setGenerating(true);
    try {
      const { generateInvoice } = await import('../../lib/generateInvoice');
      await generateInvoice({
        store:   storeInfo,
        customer,
        order:   completedOrder,
        taxRate,
      });
      showToast('success', 'Invoice downloaded!');
    } catch (err) {
      console.error('[generateInvoice]', err);
      showToast('error', 'Failed to generate PDF. Try again.');
    } finally {
      setGenerating(false);
      setShowInvoice(false);
      setCompletedOrder(null);
      clearCart();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      {/* ── Page header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Point of Sale</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Select items and complete orders</p>
        </div>
        {cart.length > 0 && (
          <button onClick={clearCart} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">
            Clear cart
          </button>
        )}
      </div>

      {/* ── Split layout ── */}
      <div className="flex gap-6 h-[calc(100vh-11rem)] min-h-[500px]">

        {/* ════ LEFT — Product selection ════ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Search */}
          <div className="relative mb-4 shrink-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or SKU…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse h-48" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-600">
                <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm">
                  {searchQuery ? `No items matching "${searchQuery}"` : 'No inventory items yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 pb-2">
                {filtered.map((item) => (
                  <ProductCard
                    key={item._id}
                    item={item}
                    cartQty={cartQtyMap[item._id] ?? 0}
                    onAdd={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ════ RIGHT — Cart & Checkout ════ */}
        <div className="w-80 xl:w-96 shrink-0 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

          {/* Cart header */}
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-sm font-semibold text-zinc-200">Current Order</h2>
            </div>
            {cart.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-semibold">
                {cart.reduce((s, c) => s + c.quantity, 0)} items
              </span>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-700">
                <CartIcon />
                <p className="text-sm text-center">Cart is empty.<br />Click a product to add it.</p>
              </div>
            ) : (
              cart.map((item) => (
                <CartRow
                  key={item._id}
                  item={item}
                  fmt={isMounted ? fmt : (v) => `₹${v.toFixed(2)}`}
                  onIncrement={() => increment(item._id)}
                  onDecrement={() => decrement(item._id)}
                  onRemove={() => remove(item._id)}
                />
              ))
            )}
          </div>

          {/* Order summary + checkout */}
          <div className="px-5 py-4 border-t border-zinc-800 shrink-0 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Subtotal</span>
                <span>{isMounted ? fmt(subtotal) : `₹${subtotal.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Tax ({taxRate}%)</span>
                <span>{isMounted ? fmt(tax) : `₹${tax.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-100 pt-1 border-t border-zinc-800">
                <span>Total</span>
                <span className="text-emerald-400">{isMounted ? fmt(total) : `₹${total.toFixed(2)}`}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            >
              {isCheckingOut ? (
                <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Processing…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>Complete Order</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Customer Details Modal ── */}
      <CustomerDetailsModal
        isOpen={showInvoice}
        onSkip={handleSkipInvoice}
        onDownload={handleDownloadInvoice}
        generating={generating}
      />

      {/* ── Toast ── */}
      <Toast toast={toast} />
    </AppLayout>
  );
}
