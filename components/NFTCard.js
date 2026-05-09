import Link from 'next/link'
import Image from 'next/image'
import { memo } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import clsx from 'clsx'
import CategoryBadge from './CategoryBadge'
import Button from './Button'

function formatAddress(addr) {
  if (!addr) return ''
  const s = String(addr)
  if (s.length < 12) return s
  return `${s.slice(0, 6)}…${s.slice(-4)}`
}

function isRemoteUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url)
}

function NFTCard({
  nft,
  onBuy,
  onToggleLike,
  liked,
  likeCount,
  userKey,
}) {
  const creator = nft.creatorName || formatAddress(nft.seller)
  const remote = isRemoteUrl(nft.image)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none backdrop-blur-xl"
    >
      <Link href={`/nft/${nft.itemId}`} className="block flex-1 flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          {remote ? (
            <Image
              src={nft.image}
              alt={nft.name || 'NFT'}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={nft.image}
              alt={nft.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="absolute left-3 top-3 z-10">
            <CategoryBadge category={nft.category} />
          </div>
          <button
            type="button"
            className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-black/55 transition"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleLike?.(nft.itemId, userKey)
            }}
          >
            <Heart
              size={16}
              className={clsx(liked && 'fill-rose-400 text-rose-400')}
            />
            {likeCount ?? 0}
          </button>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">{nft.name}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                by <span className="font-medium text-slate-700 dark:text-slate-300">{creator}</span>
              </p>
            </div>
            <span
              className={clsx(
                'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold border',
                nft.sold
                  ? 'bg-slate-500/15 text-slate-800 dark:text-slate-200 border-slate-500/25'
                  : nft.listed
                    ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/25'
                    : 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/25'
              )}
            >
              {nft.sold ? 'Sold' : nft.listed ? 'Listed' : 'Unlisted'}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-400">{nft.description}</p>
          <div className="mt-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Price</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{nft.price} ETH</p>
            </div>
          </div>
        </div>
      </Link>
      {onBuy && (
        <div className="px-5 pb-5">
          <Button
            className="w-full"
            onClick={(e) => {
              e.preventDefault()
              onBuy(nft)
            }}
          >
            Buy now
          </Button>
        </div>
      )}
    </motion.article>
  )
}

export default memo(NFTCard)
