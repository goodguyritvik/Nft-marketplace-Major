/** @typedef {'Art'|'Gaming'|'Photography'|'Music'|'Memes'|'Collectibles'} NftCategory */

export const NFT_CATEGORIES = [
  'Art',
  'Gaming',
  'Photography',
  'Music',
  'Memes',
  'Collectibles',
]

/** @type {Record<string, { label: string; className: string }>} */
export const CATEGORY_STYLES = {
  Art: {
    label: 'Art',
    className:
      'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25',
  },
  Gaming: {
    label: 'Gaming',
    className:
      'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25',
  },
  Photography: {
    label: 'Photography',
    className:
      'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/25',
  },
  Music: {
    label: 'Music',
    className:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25',
  },
  Memes: {
    label: 'Memes',
    className:
      'bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 border border-cyan-500/25',
  },
  Collectibles: {
    label: 'Collectibles',
    className:
      'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25',
  },
}

export function normalizeCategory(cat) {
  if (!cat || typeof cat !== 'string') return 'Art'
  const c = NFT_CATEGORIES.find((k) => k.toLowerCase() === cat.toLowerCase())
  return c || 'Art'
}
