'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import api from '../../lib/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useTax } from '../../context/TaxContext';

// ── Icons ────────────────────────────────────────────────────────────────────
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

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 ${
        isSuccess
          ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
          : 'bg-red-950 border-red-700 text-red-300'
      }`}
    >
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

// ── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ item, cartQty, onAdd }) {
  const isOOS      = item.quantity === 0;
  const isMaxed    = cartQty >= item.quantity;
  const disabled   = isOOS || isMaxed;

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
      {/* Image / placeholder */}
      <div className="w-full h-28 bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      {/* Stock badge */}
      <span className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
        isOOS        ? 'bg-red-900/80 text-red-300'
        : item.quantity <= 5 ? 'bg-amber-900/80 text-amber-300'
        : 'bg-zinc-800 text-zinc-400'
      }`}>
        {isOOS ? 'Out of stock' : `${item.quantity} left`}
      </span>

      {/* In-cart indicator */}
      {cartQty > 0 && !isOOS && (
        <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow">
          {cartQty}
        </span>
      )}

      {/* Details */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-semibold text-zinc-200 leading-tight line-clamp-2">{item.name}</p>
        {item.sku && <p className="text-[10px] text-zinc-600 font-mono">{item.sku}</p>}
        <p className="mt-auto pt-1.5 text-sm font-bold text-indigo-400">
          {item.sellingPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
        </p>
      </div>
    </button>
  );
}

// ── Cart Item Row ─────────────────────────────────────────────────────────────
function CartRow({ item, fmt, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-zinc-800 last:border-0">
      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">{item.name}</p>
        <p className="text-xs text-zinc-600 mt-0.5">{fmt(item.price)} × {item.quantity}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onDecrement}
          className="w-6 h-6 rounded-md flex items-center justify-center bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-all text-lg leading-none"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold text-zinc-200">{item.quantity}</span>
        <button
          onClick={onIncrement}
          disabled={item.quantity >= item.maxStock}
          className="w-6 h-6 rounded-md flex items-center justify-center bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 transition-all text-lg leading-none disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      {/* Line total */}
      <p className="text-sm font-semibold text-zinc-100 w-16 text-right shrink-0">
        {fmt(item.price * item.quantity)}
      </p>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

// ── Main POS Page ─────────────────────────────────────────────────────────────
export default function POSPage() {
  const { fmt, isMounted } = useCurrency();
  const { taxRate, taxMultiplier } = useTax();

  const [inventory,    setInventory]   = useState([]);
  const [cart,         setCart]        = useState([]);
  const [searchQuery,  setSearchQuery] = useState('');
  const [loading,      setLoading]     = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [toast,        setToast]       = useState(null);

  // Rename to avoid the space issue in destructure
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // ── Fetch inventory ──────────────────────────────────────────────────────
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

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Filtered product list ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return inventory;
    const q = searchQuery.toLowerCase();
    return inventory.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.sku && i.sku.toLowerCase().includes(q))
    );
  }, [inventory, searchQuery]);

  // ── Cart helpers ─────────────────────────────────────────────────────────
  const cartQtyMap = useMemo(() => {
    const map = {};
    cart.forEach((c) => { map[c._id] = c.quantity; });
    return map;
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        if (existing.quantity >= item.quantity) return prev; // cap at stock
        return prev.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, {
        _id:      item._id,
        name:     item.name,
        price:    item.sellingPrice,
        quantity: 1,
        maxStock: item.quantity,
      }];
    });
  };

  const increment = (id) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c._id !== id) return c;
        if (c.quantity >= c.maxStock) return c;
        return { ...c, quantity: c.quantity + 1 };
      })
    );
  };

  const decrement = (id) => {
    setCart((prev) =>
      prev
        .map((c) => c._id === id ? { ...c, quantity: c.quantity - 1 } : c)
        .filter((c) => c.quantity > 0)
    );
  };

  const remove = (id) => setCart((prev) => prev.filter((c) => c._id !== id));

  const clearCart = () => setCart([]);

  // ── Totals ───────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const tax      = subtotal * taxMultiplier;
  const total    = subtotal + tax;

  // ── Checkout ─────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (cart.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const payload = {
        items: cart.map((c) => ({ productId: c._id, qty: c.quantity })),
        totalAmount: Math.round(total * 100) / 100,
      };
      await api.post('/orders', payload);
      showToast('success', `Order placed! Total: ${fmt(total)}`);
      clearCart();
      fetchInventory(); // refresh stock counts
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Failed to place order. Please try again.';
      showToast('error', msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      {/* ── Page header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Point of Sale</h1>
          <p className="text-sm text-zinc-600 mt-0.5">Select items and complete orders</p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
          >
            Clear cart
          </button>
        )}
      </div>

      {/* ── Split layout ── */}
      <div className="flex gap-6 h-[calc(100vh-11rem)] min-h-[500px]">

        {/* ════════════════════════════════════════════
            LEFT PANE — Product selection
        ════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Search */}
          <div className="relative mb-4 shrink-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or SKU…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
              >
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
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

        {/* ════════════════════════════════════════════
            RIGHT PANE — Cart & Checkout
        ════════════════════════════════════════════ */}
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

          {/* Cart items — scrollable */}
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
                  fmt={isMounted ? fmt : (v) => `$${v.toFixed(2)}`}
                  onIncrement={() => increment(item._id)}
                  onDecrement={() => decrement(item._id)}
                  onRemove={() => remove(item._id)}
                />
              ))
            )}
          </div>

          {/* Order summary + checkout */}
          <div className="px-5 py-4 border-t border-zinc-800 shrink-0 space-y-3">
            {/* Summary rows */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Subtotal</span>
                <span>{isMounted ? fmt(subtotal) : `$${subtotal.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Tax ({taxRate}%)</span>
                <span>{isMounted ? fmt(tax) : `$${tax.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-zinc-100 pt-1 border-t border-zinc-800">
                <span>Total</span>
                <span className="text-emerald-400">{isMounted ? fmt(total) : `$${total.toFixed(2)}`}</span>
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            >
              {isCheckingOut ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5 13l4 4L19 7" />
                  </svg>
                  Complete Order
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* ── Toast notification ── */}
      <Toast toast={toast} />
    </AppLayout>
  );
}
