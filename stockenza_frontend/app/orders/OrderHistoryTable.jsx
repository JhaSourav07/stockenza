import { useState, Fragment } from 'react';
import Badge from '../../components/ui/Badge';
import { useCurrency } from '../../context/CurrencyContext';

function Skeleton({ className = '' }) {
  return <div className={`rounded-lg bg-zinc-800 animate-pulse ${className}`} />;
}

// ── Expanded row — shows every line item in the order ────────────────────────
function ExpandedDetails({ order, fmt }) {
  const subtotal = order.items.reduce((s, it) => {
    const price = it.productId?.sellingPrice ?? 0;
    return s + price * it.qty;
  }, 0);
  const tax   = order.totalAmount - subtotal;
  const hasTax = tax > 0.005;

  return (
    <tr className="bg-zinc-950/60">
      <td colSpan={6} className="px-5 pb-4 pt-1">
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          {/* Line items table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="px-4 py-2 text-left font-medium text-zinc-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-2 text-left font-medium text-zinc-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-2 text-center font-medium text-zinc-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-2 text-right font-medium text-zinc-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-2 text-right font-medium text-zinc-500 uppercase tracking-wider">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
              {order.items.map((item, i) => {
                const name  = item.productId?.name  ?? <span className="italic text-zinc-600">Deleted product</span>;
                const sku   = item.productId?.sku   ?? '—';
                const price = item.productId?.sellingPrice ?? 0;
                return (
                  <tr key={i} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-zinc-300">{name}</td>
                    <td className="px-4 py-2.5 font-mono text-zinc-600">{sku}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">×{item.qty}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-400">{price > 0 ? fmt(price) : '—'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-zinc-200">
                      {price > 0 ? fmt(price * item.qty) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Order totals footer */}
          <div className="border-t border-zinc-800 bg-zinc-900/60 px-4 py-3 flex flex-col items-end gap-1 text-xs">
            <div className="flex gap-6">
              <span className="text-zinc-500">Subtotal</span>
              <span className="text-zinc-300 tabular-nums w-24 text-right">{fmt(subtotal)}</span>
            </div>
            {hasTax && (
              <div className="flex gap-6">
                <span className="text-zinc-500">Tax (10%)</span>
                <span className="text-zinc-300 tabular-nums w-24 text-right">{fmt(tax)}</span>
              </div>
            )}
            <div className="flex gap-6 pt-1 border-t border-zinc-700 mt-0.5">
              <span className="font-semibold text-zinc-300">Total</span>
              <span className="font-bold text-emerald-400 tabular-nums w-24 text-right">{fmt(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-zinc-600 px-1">
          <span>
            Order ID: <span className="font-mono text-zinc-500">{order._id}</span>
          </span>
          <span>
            Items: <span className="text-zinc-400">{order.items.reduce((s, i) => s + i.qty, 0)} units across {order.items.length} product{order.items.length !== 1 ? 's' : ''}</span>
          </span>
          <span>
            Placed: <span className="text-zinc-400">{new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </span>
        </div>
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OrderHistoryTable({ orders, loaded, totalRevenue, successId, fmtDate }) {
  const { fmt } = useCurrency();
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const HEADERS = ['Order ID', 'Date & Time', 'Items', 'Products', 'Total', ''];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Transaction History</h2>
          <p className="text-xs text-zinc-600 mt-0.5">{orders.length} orders total — click a row to see details</p>
        </div>
        {orders.length > 0 && <Badge variant="primary">{orders.length} total</Badge>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800/60">
              {HEADERS.map((h, i) => (
                <th
                  key={h || i}
                  className={`px-5 py-3 text-xs font-medium text-zinc-600 uppercase tracking-wider ${
                    i === 4 ? 'text-right' : i === 5 ? 'text-center w-10' : 'text-left'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {!loaded ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j} className="px-5 py-4"><Skeleton className="h-4" /></td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">No orders yet — place your first order via the POS terminal.</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order, i) => {
                const isNew      = order._id === successId;
                const isExpanded = expanded === order._id;
                const itemCount  = order.items.reduce((s, it) => s + it.qty, 0);
                const productNames = order.items
                  .map((it) => it.productId?.name)
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(', ') + (order.items.length > 2 ? ` +${order.items.length - 2} more` : '');

                return (
                  <Fragment key={order._id}>
                    <tr
                      onClick={() => toggle(order._id)}
                      className={`transition-all cursor-pointer ${
                        isExpanded
                          ? 'bg-zinc-800/50'
                          : isNew
                          ? 'bg-emerald-500/5 hover:bg-zinc-800/30'
                          : 'hover:bg-zinc-800/30'
                      }`}
                      style={{ animation: `fadeIn 0.3s ${i * 40}ms both` }}
                    >
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                          …{order._id.slice(-6)}
                        </span>
                        {isNew && (
                          <span className="ml-2 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                      </td>

                      {/* Date & time */}
                      <td className="px-5 py-4">
                        <p className="text-xs text-zinc-400">{fmtDate(order.createdAt)}</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Item count */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full">
                          {itemCount} unit{itemCount !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Product names preview */}
                      <td className="px-5 py-4 max-w-[180px]">
                        <p className="text-sm text-zinc-300 truncate" title={productNames}>
                          {productNames || <span className="italic text-zinc-600">Deleted product</span>}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-semibold text-zinc-200 tabular-nums">
                          {fmt(order.totalAmount)}
                        </span>
                      </td>

                      {/* Expand chevron */}
                      <td className="px-5 py-4 text-center">
                        <svg
                          className={`w-4 h-4 text-zinc-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <ExpandedDetails key={`${order._id}-exp`} order={order} fmt={fmt} />
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {loaded && orders.length > 0 && (
        <div className="px-6 py-3 border-t border-zinc-800/60 bg-zinc-900/50 flex justify-between items-center">
          <span className="text-xs text-zinc-600">{orders.length} transactions</span>
          <span className="text-xs text-zinc-500">
            Total: <span className="text-zinc-200 font-semibold">{fmt(totalRevenue)}</span>
          </span>
        </div>
      )}
    </div>
  );
}