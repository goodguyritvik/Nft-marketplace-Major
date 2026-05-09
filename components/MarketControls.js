import { Search, SlidersHorizontal } from 'lucide-react'
import clsx from 'clsx'
import { NFT_CATEGORIES } from '../lib/categories'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_desc', label: 'Highest price' },
  { value: 'price_asc', label: 'Lowest price' },
]

export default function MarketControls({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
}) {
  return (
    <div className="mb-10 space-y-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <SlidersHorizontal size={18} />
            <span className="text-sm font-medium">Sort</span>
          </div>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-xl border border-slate-300/80 dark:border-white/15 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange('')}
          className={clsx(
            'rounded-full px-4 py-2 text-xs font-semibold transition border',
            !category
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/15'
          )}
        >
          All
        </button>
        {NFT_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategoryChange(c)}
            className={clsx(
              'rounded-full px-4 py-2 text-xs font-semibold transition border',
              category === c
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/15'
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

export { SORT_OPTIONS }
