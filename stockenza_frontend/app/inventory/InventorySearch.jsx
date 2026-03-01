export default function InventorySearch({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  showLowStock,
  setShowLowStock,
  categories,
}) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-3">
      {/* ── Text Search ── */}
      <div className="relative flex-1 min-w-0">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or SKU…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all"
        />
      </div>

      {/* ── Category Dropdown ── */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
        </svg>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="appearance-none pl-10 pr-8 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all cursor-pointer"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {/* Chevron icon */}
        <svg
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* ── Low Stock Toggle ── */}
      <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer select-none group hover:border-zinc-700 transition-all shrink-0">
        {/* Toggle switch */}
        <div className="relative">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4.5 rounded-full bg-zinc-700 peer-checked:bg-amber-500/80 transition-colors duration-200 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-zinc-300 after:transition-transform after:duration-200 peer-checked:after:translate-x-[14px] peer-checked:after:bg-white" style={{ height: '18px', width: '34px' }} />
        </div>
        <span className={`text-sm font-medium transition-colors ${showLowStock ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
          Low stock only
        </span>
        {showLowStock && (
          <span className="ml-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
            &lt; 5
          </span>
        )}
      </label>
    </div>
  );
}