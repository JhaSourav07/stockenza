'use client';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

/** Small sort indicator shown inside clickable header cells */
function SortIcon({ columnKey, sortConfig }) {
  if (sortConfig.key !== columnKey) {
    return (
      <svg className="inline-block ml-1 w-3 h-3 text-zinc-700" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5 6l3-3 3 3H5zm6 4l-3 3-3-3h6z" />
      </svg>
    );
  }
  return sortConfig.direction === 'asc' ? (
    <svg className="inline-block ml-1 w-3 h-3 text-indigo-400" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 4l4 6H4l4-6z" />
    </svg>
  ) : (
    <svg className="inline-block ml-1 w-3 h-3 text-indigo-400" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 12L4 6h8l-4 6z" />
    </svg>
  );
}

/** Product thumbnail or placeholder icon */
function ProductThumb({ item }) {
  if (item.imageUrl) {
    return (
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-9 h-9 rounded-lg object-cover bg-zinc-800 border border-zinc-700 flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 18h18M3 12V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v12" />
      </svg>
    </div>
  );
}

/** Mobile product card — replaces table row on small screens */
function ProductCard({ item, isMounted, fmt, openEdit, handleDelete, deleteId, isSelected, onToggleSelect }) {
  const margin = ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100);
  const status = stockStatus(item.quantity);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 relative">
      {/* Checkbox */}
      <div className="absolute top-3 left-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item._id)}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-indigo-500 cursor-pointer"
          aria-label={`Select ${item.name}`}
        />
      </div>

      {/* Top row: image + name + status */}
      <div className="flex items-center gap-3 pl-7">
        <ProductThumb item={item} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-200 truncate">{item.name}</p>
          {item.sku && (
            <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">
              {item.sku}
            </span>
          )}
        </div>
        <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-full border ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-3 gap-2 text-center pl-0">
        <div className="bg-zinc-800/50 rounded-lg px-2 py-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Price</p>
          <p className="text-sm font-semibold text-zinc-200">{isMounted ? fmt(item.sellingPrice) : '—'}</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg px-2 py-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Stock</p>
          <p className="text-sm font-semibold text-zinc-300">{item.quantity}</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg px-2 py-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Margin</p>
          <p className={`text-sm font-semibold ${margin >= 30 ? 'text-emerald-400' : margin >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
            {margin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-zinc-800 pt-3">
        {item.category && (
          <span className="text-xs text-zinc-500 flex-1">{item.category}</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => openEdit(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            disabled={deleteId === item._id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            {deleteId === item._id ? (
              <span className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function stockStatus(qty) {
  if (qty === 0) return { label: 'Out of stock', cls: 'bg-red-500/10 text-red-400 border-red-500/20' };
  if (qty <= 5)  return { label: 'Low stock',    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  return              { label: 'In stock',       cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
}

/** Pagination footer */
function PaginationBar({ page, pageSize, totalCount, onPageChange, onPageSizeChange }) {
  const totalPages   = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem    = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem      = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-zinc-800">
      {/* Row-count selector */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Page info + controls */}
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span>{totalCount === 0 ? '0' : `${startItem}–${endItem}`} of {totalCount}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Previous page"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page number pills */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === '…' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-zinc-600">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-all ${
                    p === page
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Next page"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Bulk action toolbar — appears when items are checked */
function BulkActionBar({ count, onDeleteSelected, onClearSelection }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-3 animate-[fadeIn_0.2s_ease_forwards]">
      <span className="text-xs font-semibold text-amber-400">{count} selected</span>
      <div className="flex-1" />
      <button
        onClick={onClearSelection}
        className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-md hover:bg-zinc-800 transition-all"
      >
        Clear selection
      </button>
      <button
        onClick={onDeleteSelected}
        className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded-md transition-all border border-red-500/20"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete selected
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main InventoryTable component
// ─────────────────────────────────────────────────────────────────────────────
export default function InventoryTable({
  items, filtered, loaded, isMounted, fmt,
  openEdit, handleDelete, deleteId,
  sortConfig, onSort,
  // Pagination
  page, pageSize, onPageChange, onPageSizeChange,
  // Bulk actions
  selectedIds, onToggleSelect, onToggleAll, onBulkDelete,
}) {
  const headers = [
    { label: '',         sortKey: null,           align: ''       }, // checkbox
    { label: 'Product',  sortKey: 'name',         align: 'left'   },
    { label: 'SKU',      sortKey: null,            align: 'left'   },
    { label: 'Category', sortKey: null,            align: 'left'   },
    { label: 'Cost',     sortKey: null,            align: 'right'  },
    { label: 'Price',    sortKey: 'sellingPrice',  align: 'right'  },
    { label: 'Margin',   sortKey: null,            align: 'right'  },
    { label: 'Stock',    sortKey: 'quantity',      align: 'center' },
    { label: 'Status',   sortKey: null,            align: 'left'   },
    { label: '',         sortKey: null,            align: ''       },
  ];

  const allOnPageSelected =
    filtered.length > 0 && filtered.every((item) => selectedIds.has(item._id));

  const selectedCount = selectedIds.size;

  return (
    <div>
      {/* Bulk action toolbar */}
      {selectedCount > 0 && (
        <BulkActionBar
          count={selectedCount}
          onDeleteSelected={onBulkDelete}
          onClearSelection={() => onToggleAll(false)}
        />
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Products</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {filtered.length} of {items.length} products
            </p>
          </div>
          {items.length > 0 && <Badge variant="default">{items.length} total</Badge>}
        </div>

        {/* ── DESKTOP TABLE (sm and up) ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                {/* Select-all checkbox */}
                <th className="pl-5 pr-2 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={(e) => onToggleAll(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-indigo-500 cursor-pointer"
                    aria-label="Select all on page"
                  />
                </th>

                {headers.slice(1).map(({ label, sortKey, align }, i) => {
                  const isSortable = !!sortKey;
                  const isActive   = sortConfig.key === sortKey;
                  const alignClass =
                    align === 'right'  ? 'text-right'  :
                    align === 'center' ? 'text-center' :
                    align === 'left'   ? 'text-left'   : '';

                  return (
                    <th
                      key={label + i}
                      className={`px-5 py-3 text-xs font-medium uppercase tracking-wider whitespace-nowrap ${alignClass} ${
                        isSortable
                          ? 'text-zinc-500 cursor-pointer select-none hover:text-zinc-300 transition-colors'
                          : 'text-zinc-600'
                      } ${isActive ? 'text-indigo-400' : ''}`}
                      onClick={isSortable ? () => onSort(sortKey) : undefined}
                      title={isSortable ? `Sort by ${label}` : undefined}
                    >
                      {label}
                      {isSortable && <SortIcon columnKey={sortKey} sortConfig={sortConfig} />}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/40">
              {!loaded ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(10).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4"><Skeleton className="h-4" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-zinc-600">
                      <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-sm">
                        {items.length === 0 ? 'No products yet — add your first one' : 'No products match your filters'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => {
                  const margin = ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100);
                  const status = stockStatus(item.quantity);
                  const isSelected = selectedIds.has(item._id);

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-zinc-800/30 transition-colors ${isSelected ? 'bg-indigo-500/5' : ''}`}
                      style={{ animation: `fadeIn 0.3s ${i * 30}ms both` }}
                    >
                      {/* Row checkbox */}
                      <td className="pl-5 pr-2 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(item._id)}
                          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-indigo-500 cursor-pointer"
                          aria-label={`Select ${item.name}`}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ProductThumb item={item} />
                          <p className="text-sm font-medium text-zinc-200">{item.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                          {item.sku || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-zinc-400">{item.category || '—'}</span>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-zinc-400 tabular-nums">
                        {isMounted ? fmt(item.costPrice) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-zinc-300 font-medium tabular-nums">
                        {isMounted ? fmt(item.sellingPrice) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-xs font-medium ${margin >= 30 ? 'text-emerald-400' : margin >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm font-semibold text-zinc-300">{item.quantity}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex text-xs font-medium px-2 py-1 rounded-full border ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => openEdit(item)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700 transition-all"
                            aria-label="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deleteId === item._id}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            aria-label="Delete"
                          >
                            {deleteId === item._id ? (
                              <span className="w-3.5 h-3.5 border-2 border-zinc-600 border-t-red-400 rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARD GRID (below sm) ── */}
        <div className="sm:hidden">
          {!loaded ? (
            <div className="p-4 space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-2 text-zinc-600">
              <svg className="w-8 h-8 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm">
                {items.length === 0 ? 'No products yet — add your first one' : 'No products match your filters'}
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {/* Mobile select-all */}
              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-zinc-500">Select all ({filtered.length})</span>
              </div>

              {filtered.map((item, i) => (
                <div key={item._id} style={{ animation: `fadeIn 0.3s ${i * 40}ms both` }}>
                  <ProductCard
                    item={item}
                    isMounted={isMounted}
                    fmt={fmt}
                    openEdit={openEdit}
                    handleDelete={handleDelete}
                    deleteId={deleteId}
                    isSelected={selectedIds.has(item._id)}
                    onToggleSelect={onToggleSelect}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination footer */}
        {loaded && items.length > 0 && (
          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalCount={filtered.length}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
}