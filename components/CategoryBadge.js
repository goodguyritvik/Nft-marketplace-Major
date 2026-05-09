import clsx from 'clsx'
import { CATEGORY_STYLES, normalizeCategory } from '../lib/categories'

export default function CategoryBadge({ category, className }) {
  const c = normalizeCategory(category)
  const style = CATEGORY_STYLES[c] || CATEGORY_STYLES.Art
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold',
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  )
}
